<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import content from './content.json'
import { renderMarkdown, parseFrontmatter } from './markdown.js'
import SiteHeader from './components/SiteHeader.vue'
import Lightbox from './components/Lightbox.vue'
import { useReveal } from './useReveal.js'

useReveal()

const files = import.meta.glob('../source/_posts/**/*.md', { query: '?raw', import: 'default', eager: true })

const buildPosts = () =>
  Object.entries(files)
    .map(([path, raw]) => {
      const { meta, body } = parseFrontmatter(raw)
      const slug = path.split('/').pop().replace(/\.md$/, '')
      // crude cover detection: first ![](…) or jpeg/jpg/png in body
      const coverMatch = body.match(/!\[[^\]]*\]\(([^)]+\.(?:jpe?g|png|webp))\)/i)
        || body.match(/\(([^)]+\.(?:jpe?g|png|webp))\)/i)
      const tags = Array.isArray(meta.tags) ? meta.tags : (meta.tag ? [meta.tag] : [])
      const isPhoto = coverMatch || tags.includes('SDC')
      return {
        slug,
        title: meta.title || slug.replaceAll('-', ' '),
        date: meta.date || '',
        tags,
        cover: coverMatch ? coverMatch[1] : null,
        isPhoto,
        body,
        excerpt: body.replace(/^---[\s\S]*?---\n?/, '').replace(/<!-- more -->[\s\S]*$/, '').replace(/[#>*`!$\[\]()]/g, '').trim().slice(0, 120),
      }
    })
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))

const posts = buildPosts()

// Article routing uses a query param (?post=slug) so in-article anchor links
// (e.g. TOC jumping to #section) never collide with the article route.
const slugFromUrl = () => new URLSearchParams(location.search).get('post') || ''
const activeSlug = ref(slugFromUrl())

function applyUrlState() {
  // scroll to a hash anchor if present; else top
  if (location.hash) {
    const el = document.getElementById(decodeURIComponent(location.hash.slice(1)))
    if (el) { el.scrollIntoView(); return }
  }
  window.scrollTo({ top: 0 })
}

function onPop() {
  activeSlug.value = slugFromUrl()
  nextTick(applyUrlState)
}
addEventListener('popstate', onPop)
onUnmounted(() => removeEventListener('popstate', onPop))

const active = computed(() => posts.find((p) => p.slug === activeSlug.value))
const articleHtml = ref('')
const rendering = ref(false)

const openPost = (slug) => {
  const url = new URL(location.href)
  url.searchParams.set('post', slug)
  url.hash = ''
  history.pushState({}, '', url.pathname + url.search)
  activeSlug.value = slug
  window.scrollTo({ top: 0 })
}
const closePost = () => {
  history.pushState({}, '', location.pathname)
  activeSlug.value = ''
  window.scrollTo({ top: 0 })
}

// Delegate clicks on in-article links of the form ?post=slug (produced by
// the renderer for Hexo-permalink rewrites) to the SPA router so they don't
// trigger a full-page reload.
function onDocClick(e) {
  const a = e.target.closest && e.target.closest('a[href^="?post="]')
  if (a) {
    e.preventDefault()
    const slug = a.getAttribute('href').replace(/^\?post=/, '')
    openPost(decodeURIComponent(slug))
  }
}
document.addEventListener('click', onDocClick)
onUnmounted(() => document.removeEventListener('click', onDocClick))

watch(active, async (post) => {
  articleHtml.value = ''
  if (!post) return
  rendering.value = true
  articleHtml.value = await renderMarkdown(post.body)
  rendering.value = false
  await enhanceArticle()
}, { immediate: true })

// lightbox state
const lbOpen = ref(false)
const lbIndex = ref(0)
const lbImages = ref([])
const openLightbox = (imgs, i) => { lbImages.value = imgs; lbIndex.value = i; lbOpen.value = true }
const closeLightbox = () => { lbOpen.value = false }

// post-render: inject copy buttons + wire image clicks into lightbox
const articleRef = ref(null)
const enhanceArticle = async () => {
  await nextTick()
  const root = articleRef.value
  if (!root) return
  // code blocks: wrap with header + copy button
  root.querySelectorAll('pre').forEach((pre) => {
    if (pre.parentElement?.classList.contains('code-wrap')) return
    const lang = (pre.querySelector('code')?.className.match(/language-(\w+)/) || [])[1] || 'text'
    const wrap = document.createElement('div')
    wrap.className = 'code-wrap relative my-6'
    const bar = document.createElement('div')
    bar.className = 'flex items-center justify-between px-3 py-1.5 border-b border-line font-mono text-[0.65rem] uppercase tracking-[0.08em]'
    bar.style.color = 'var(--c-acid)'
    bar.textContent = lang
    const btn = document.createElement('button')
    btn.textContent = 'copy'
    btn.className = 'hover:text-accent transition-colors duration-200'
    btn.onclick = async () => {
      const code = pre.querySelector('code')?.innerText || ''
      let ok = false
      try { await navigator.clipboard.writeText(code); ok = true }
      catch {
        // fallback for non-secure contexts (e.g. deployed under http or sandboxed iframes)
        const ta = document.createElement('textarea'); ta.value = code
        ta.style.position = 'fixed'; ta.style.opacity = '0'
        document.body.appendChild(ta); ta.select()
        try { ok = document.execCommand('copy') } catch {}
        document.body.removeChild(ta)
      }
      btn.textContent = ok ? 'copied!' : 'failed'
      setTimeout(() => (btn.textContent = 'copy'), 1200)
    }
    bar.appendChild(btn)
    pre.parentNode.insertBefore(wrap, pre)
    wrap.appendChild(bar)
    wrap.appendChild(pre)
  })
  // images: collect + click -> lightbox
  const imgs = [...root.querySelectorAll('img')]
  const records = imgs.map((img) => ({ src: img.getAttribute('src'), alt: img.alt, exif: null }))
  imgs.forEach((img, i) => {
    img.style.cursor = 'zoom-in'
    img.onclick = () => openLightbox(records, i)
    if (!img.getAttribute('data-exif-attached')) {
      img.setAttribute('data-exif-attached', '1')
      attachExif(records, img, i)
    }
  })
}

// read EXIF (lazy) for the image at index i, fill records[i].exif
async function attachExif(records, img, i) {
  const src = img.getAttribute('src')
  if (!src) return
  try {
    const { parse } = await import('exifr')
    const file = await (await fetch(src)).arrayBuffer()
    const ex = await parse(file, { pick: ['Make', 'Model', 'LensModel', 'FNumber', 'ExposureTime', 'ISO', 'FocalLength', 'DateTimeOriginal'] })
    if (!ex || typeof ex !== 'object')
      return
    const parts = []
    const body = [ex.Make, ex.Model].filter(Boolean).join(' ') || (ex.Make || ex.Model)
    if (body) parts.push(body)
    if (ex.LensModel) parts.push(`🅛 ${ex.LensModel}`)
    if (ex.FNumber) parts.push(`f/${ex.FNumber}`)
    if (ex.ExposureTime) parts.push(`1/${Math.round(1 / ex.ExposureTime)}s`)
    if (ex.ISO) parts.push(`ISO ${ex.ISO}`)
    if (ex.FocalLength) parts.push(`${Math.round(ex.FocalLength)}mm`)
    if (ex.DateTimeOriginal) parts.push(new Date(ex.DateTimeOriginal).toLocaleDateString())
    if (parts.length) records[i].exif = parts.join(' · ')
  } catch { /* no EXIF or cross-origin — leave null, still opens lightbox */ }
}

</script>

<template>
  <SiteHeader />
  <main class="shell">
    <!-- article view -->
    <article v-if="active" ref="articleRef" class="article max-w-read mx-auto pt-[6vw]">
      <a href="/blog/" @click.prevent="closePost()"
         class="no-underline font-mono text-[0.72rem] uppercase tracking-[0.08em] text-muted hover:text-accent transition-colors duration-200">← All notes</a>
      <p class="eyebrow mt-8">{{ active.date || 'Field note' }}</p>
      <h1 class="font-display font-bold leading-[0.95] tracking-tight text-[clamp(3rem,7vw,6rem)] mt-2 mb-8">{{ active.title }}</h1>
      <div v-if="rendering" class="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-muted animate-pulse">Rendering…</div>
      <div class="prose-ll0veu" v-html="articleHtml"></div>
    </article>

    <!-- list view -->
    <template v-else>
      <header class="page-head pt-[6vw] pb-[4vw] max-w-read">
        <p class="eyebrow">{{ content.label }}</p>
        <h1 class="font-display font-bold leading-[0.92] tracking-tightest text-[clamp(3.5rem,8vw,7rem)] m-0">{{ content.headline }}</h1>
        <p class="lede">{{ content.intro }}</p>
      </header>

      <section class="post-list border-t border-line">
        <article v-for="post in posts" :key="post.slug"
          data-reveal
          :class="['border-b border-line py-8', post.isPhoto && post.cover ? 'photo-card' : 'text-card']">

          <!-- photo card: cover-forward -->
          <a v-if="post.isPhoto && post.cover" href="#" @click.prevent="openPost(post.slug)"
             class="block group">
            <img :src="post.cover" :alt="post.title" loading="lazy"
                 class="w-full aspect-[16/9] object-cover mb-4 grayscale group-hover:grayscale-0 transition-all duration-500 ease-expo" />
            <p class="eyebrow mb-2">{{ String(post.date).slice(0, 4) || 'NOTE' }}{{ post.tags.length ? ' · ' + post.tags.join(' · ') : '' }}</p>
            <h2 class="font-display font-medium text-[2rem] mb-2 group-hover:text-accent transition-colors duration-200">{{ post.title }}</h2>
            <p class="text-muted leading-relaxed max-w-[42rem]">{{ post.excerpt }}</p>
          </a>

          <!-- text card: title-forward -->
          <a v-else href="#" @click.prevent="openPost(post.slug)"
             class="grid gap-4 md:grid-cols-[5rem_1fr] items-start group">
            <span class="card-index font-mono">{{ String(post.date).slice(0, 4) || 'NOTE' }}</span>
            <div>
              <h2 class="font-display font-medium text-[2rem] mb-2 group-hover:text-accent transition-colors duration-200">{{ post.title }}</h2>
              <p class="text-muted leading-relaxed max-w-[42rem]">{{ post.excerpt }}</p>
              <span class="font-mono text-[0.72rem] uppercase tracking-[0.08em] text-acid">Read note ↗</span>
            </div>
          </a>
        </article>
      </section>
    </template>

    <Lightbox v-model:index="lbIndex" :open="lbOpen" :images="lbImages" @close="closeLightbox" />
  </main>
</template>

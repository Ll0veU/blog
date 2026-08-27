<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  posts: { type: Array, default: () => [] },
})
const emit = defineEmits(['open'])

const q = ref('')
const active = ref(false)   // dropdown open state (input + hover aware)
let blurTimer = null
const open = () => emit('open')

const results = computed(() => {
  const s = q.value.trim().toLowerCase()
  if (!s) return []
  return props.posts
    .filter((p) =>
      (p.title || '').toLowerCase().includes(s) ||
      (p.tags || []).some((t) => t.toLowerCase().includes(s)) ||
      (p.excerpt || '').toLowerCase().includes(s))
    .slice(0, 8)
})

const show = () => {
  clearTimeout(blurTimer)
  active.value = true
}
const hide = () => {
  clearTimeout(blurTimer)
  blurTimer = setTimeout(() => (active.value = false), 160)
}
const pick = (slug) => {
  q.value = ''
  active.value = false
  emit('open', slug)
}
</script>

<template>
  <div class="relative hidden md:block" @mouseenter="show" @mouseleave="hide">
    <input :value="q" @input="q = $event.target.value; show()" @focus="show" @blur="hide"
      type="search" placeholder="Search…"
      class="w-44 lg:w-56 px-3 py-1 text-[0.78rem] rounded-sm border border-line bg-bg/60 text-ink placeholder:text-muted
             focus:outline-none focus:border-accent focus:ring-0 transition-colors duration-200 font-sans" />
    <div v-if="active && q.trim()" class="absolute right-0 mt-1.5 w-72 max-h-80 overflow-auto border border-line bg-panel shadow-lg shadow-black/20 rounded-sm">
      <p v-if="!results.length" class="px-4 py-3 font-mono text-[0.7rem] text-muted">No results</p>
      <button v-for="r in results" :key="r.slug" @mousedown.prevent="pick(r.slug)"
        class="block w-full text-left px-4 py-2.5 hover:bg-line/40 transition-colors">
        <span class="block text-[0.85rem] text-ink leading-snug">{{ r.title }}</span>
        <span class="block font-mono text-[0.62rem] uppercase tracking-[0.06em] text-muted mt-0.5">
          {{ r.year || 'Undated' }}{{ r.tags?.length ? ' · ' + r.tags.join(' · ') : '' }}
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>

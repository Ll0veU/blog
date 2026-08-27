<script setup>
import { ref, onMounted } from 'vue'
import { toggleTheme } from '../theme.js'

// Real deployment bases (agent-config.json), not the task brief's /resume/.
const BASE = import.meta.env.BASE_URL
const here = (href) => BASE.replace(/\/$/, '') === href.replace(/\/$/, '') && href !== ''

const links = [
  { href: '/',            label: 'Home' },
  { href: '/blog/',       label: 'Blog' },
  { href: '/resume-site/',label: 'Resume' },
  { href: '/projects/',   label: 'Projects' },
  { href: '/contact/',    label: 'Contact' },
]

const dark = ref(true)
const menuOpen = ref(false)
onMounted(() => { dark.value = document.documentElement.classList.contains('dark') })
const onToggle = () => { dark.value = toggleTheme() === 'dark' }
</script>

<template>
  <header class="sticky top-0 z-40 backdrop-blur-md bg-bg/70 border-b border-line">
    <div class="max-w-shell mx-auto px-[6vw] h-14 flex items-center justify-between">
      <a href="/" class="font-mono text-sm tracking-tight flex items-center">
        <span>ll0veu.xyz</span>
        <span class="inline-block w-[7px] h-[1.1em] bg-accent ml-[2px] animate-blink translate-y-[1px]"></span>
      </a>

      <!-- desktop: inline links + theme toggle -->
      <nav class="hidden md:flex items-center gap-[1.2vw] font-mono text-[0.72rem] uppercase tracking-[0.08em]">
        <a v-for="l in links" :key="l.href" :href="l.href"
           :class="['transition-colors duration-200 hover:text-accent', here(l.href) ? 'text-accent' : 'text-muted']">
          {{ l.label }}
        </a>
        <button @click="onToggle" aria-label="Toggle theme"
          class="ml-2 w-7 h-7 grid place-items-center border border-line rounded-sm hover:border-accent transition-colors duration-200">
          <span class="text-acid" v-if="dark">☾</span>
          <span class="text-accent" v-else>☀</span>
        </button>
      </nav>

      <!-- mobile: theme toggle + hamburger -->
      <div class="flex md:hidden items-center gap-3">
        <button @click="onToggle" aria-label="Toggle theme"
          class="w-7 h-7 grid place-items-center border border-line rounded-sm hover:border-accent transition-colors duration-200">
          <span class="text-acid" v-if="dark">☾</span>
          <span class="text-accent" v-else>☀</span>
        </button>
        <button @click="menuOpen = !menuOpen" aria-label="Menu"
          class="w-7 h-7 grid place-items-center border border-line rounded-sm hover:border-accent transition-colors duration-200">
          <span class="text-acid text-[0.7rem] font-mono">{{ menuOpen ? '×' : '≡' }}</span>
        </button>
      </div>
    </div>

    <!-- mobile menu panel -->
    <Transition name="menu">
      <nav v-if="menuOpen" class="md:hidden border-t border-line bg-bg/95 backdrop-blur-md px-[6vw] pb-4 pt-2">
        <a v-for="l in links" :key="l.href" :href="l.href" @click="menuOpen = false"
           class="block py-3 font-mono text-[0.8rem] uppercase tracking-[0.08em] transition-colors duration-200"
           :class="here(l.href) ? 'text-accent' : 'text-muted hover:text-accent'">
          {{ l.label }}
        </a>
      </nav>
    </Transition>
  </header>
</template>

<style scoped>
.menu-enter-active, .menu-leave-active { transition: opacity .2s ease, transform .2s ease; }
.menu-enter-from, .menu-leave-to { opacity: 0; transform: translateY(-6px); }
</style>

<script setup>
import { ref, onMounted } from 'vue'
import { toggleTheme } from '../theme.js'

// Real deployment bases (agent-config.json), not the task brief's /resume/.
const BASE = import.meta.env.BASE_URL // e.g. '/', '/blog/', '/resume-site/'
const here = (href) => BASE.replace(/\/$/, '') === href.replace(/\/$/, '') && href !== ''

const links = [
  { href: '/',            label: 'Home' },
  { href: '/blog/',       label: 'Blog' },
  { href: '/resume-site/',label: 'Resume' },
  { href: '/projects/',   label: 'Projects' },
  { href: '/contact/',   label: 'Contact' },
]

const dark = ref(true)
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
      <nav class="flex items-center gap-[1.2vw] font-mono text-[0.72rem] uppercase tracking-[0.08em]">
        <a v-for="l in links" :key="l.href"
           :href="l.href"
           :class="['transition-colors duration-200 hover:text-accent', here(l.href) ? 'text-accent' : 'text-muted']">
          {{ l.label }}
        </a>
        <button @click="onToggle" aria-label="Toggle theme"
                class="ml-2 w-7 h-7 grid place-items-center border border-line rounded-sm hover:border-accent transition-colors duration-200">
          <span v-if="dark" class="text-acid">☾</span>
          <span v-else class="text-accent">☀</span>
        </button>
      </nav>
    </div>
  </header>
</template>

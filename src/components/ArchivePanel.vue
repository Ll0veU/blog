<script setup>
import { computed } from 'vue'

const props = defineProps({
  posts: { type: Array, default: () => [] },
  years: { type: Array, default: () => [] },   // selected years (strings)
  tags: { type: Array, default: () => [] },    // selected tags (strings)
  activeCount: { type: Number, default: 0 },
  totalCount: { type: Number, default: 0 },
})
const emit = defineEmits(['update:years', 'update:tags', 'reset'])

// distinct years + Undated bucket, with counts
const yearOptions = computed(() => {
  const map = {}
  const real = []
  for (const p of props.posts) {
    const y = p.year || 'Undated'
    if (map[y]) map[y]++
    else { map[y] = 1; if (y !== 'Undated') real.push(y) }
  }
  real.sort((a, b) => b.localeCompare(a))
  return [...real, 'Undated'].map((y) => ({ key: y, count: map[y] }))
})

// distinct tags with counts
const tagOptions = computed(() => {
  const map = {}
  for (const p of props.posts) for (const t of p.tags) map[t] = (map[t] || 0) + 1
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([t, c]) => ({ key: t, count: c }))
})

const toggle = (list, key, emitName) => {
  const next = list.includes(key) ? list.filter((k) => k !== key) : [...list, key]
  emit(emitName, next)
}
</script>

<template>
  <aside class="archive border border-line bg-panel/60 p-5 self-start
                md:sticky md:top-20 max-h-[calc(100vh-6rem)] overflow-auto">
    <div class="flex items-center justify-between mb-4">
      <p class="eyebrow text-acid !mb-0">Archive</p>
      <button v-if="years.length || tags.length" @click="emit('reset')"
        class="font-mono text-[0.65rem] uppercase tracking-[0.08em] text-muted hover:text-accent transition-colors">
        reset ×
      </button>
    </div>

    <!-- time -->
    <p class="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted mb-2">Time</p>
    <div class="flex flex-wrap gap-1.5 mb-5">
      <button v-for="y in yearOptions" :key="y.key" @click="toggle(years, y.key, 'update:years')"
        :class="['px-2.5 py-1 border rounded-sm font-mono text-[0.7rem] uppercase transition-colors duration-200',
                 years.includes(y.key) ? 'bg-accent text-bg border-accent' : 'text-muted hover:text-ink border-line']">
        {{ y.key }}<span class="opacity-60"> · {{ y.count }}</span>
      </button>
    </div>

    <!-- content tags -->
    <p class="font-mono text-[0.62rem] uppercase tracking-[0.08em] text-muted mb-2">Content</p>
    <div class="flex flex-wrap gap-1.5">
      <button v-for="t in tagOptions" :key="t.key" @click="toggle(tags, t.key, 'update:tags')"
        :class="['px-2.5 py-1 border rounded-sm font-mono text-[0.7rem] uppercase transition-colors duration-200',
                 tags.includes(t.key) ? 'bg-acid text-bg border-acid' : 'text-muted hover:text-ink border-line']">
        {{ t.key }}<span class="opacity-60"> · {{ t.count }}</span>
      </button>
    </div>

    <p class="mt-5 pt-3 border-t border-line font-mono text-[0.65rem] text-muted">
      {{ activeCount }} / {{ totalCount }} post{{ totalCount === 1 ? '' : 's' }}
    </p>
  </aside>
</template>

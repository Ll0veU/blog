<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  images: { type: Array, default: () => [] }, // [{ src, alt, exif? }]
  index: { type: Number, default: 0 },
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'update:index'])

const scale = ref(1)
const current = ref(props.index)

watch(() => props.open, (v) => {
  if (v) { current.value = props.index; scale.value = 1; document.body.style.overflow = 'hidden' }
  else { document.body.style.overflow = '' }
})

const close = () => emit('close')
const go = (dir) => {
  const n = props.images.length
  if (!n) return
  const next = (current.value + dir + n) % n
  scale.value = 1
  emit('update:index', next)
  current.value = next
}
const onWheel = (e) => {
  e.preventDefault()
  scale.value = Math.max(0.4, Math.min(4, scale.value - e.deltaY * 0.001))
}
const onKey = (e) => {
  if (!props.open) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowLeft') go(-1)
  if (e.key === 'ArrowRight') go(1)
}
onMounted(() => addEventListener('keydown', onKey))
onUnmounted(() => removeEventListener('keydown', onKey))

const active = (i) => props.images[i]
</script>

<template>
  <Transition name="lb">
    <div v-if="open" class="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
         @click.self="close">
      <button @click="go(-1)" aria-label="prev"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 grid place-items-center text-ink/80 hover:text-accent text-3xl">‹</button>

      <img v-if="active(current)"
        :src="active(current).src"
        :alt="active(current).alt || ''"
        :style="{ transform: `scale(${scale})` }"
        class="max-w-[90vw] max-h-[85vh] object-contain transition-transform duration-150 ease-expo"
        @wheel.prevent="onWheel" />

      <button @click="go(1)" aria-label="next"
        class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 grid place-items-center text-ink/80 hover:text-accent text-3xl">›</button>

      <div v-if="active(current)?.exif" class="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[0.7rem] text-ink/60 text-center">
        {{ active(current).exif }}
      </div>
      <button @click="close" aria-label="close"
        class="absolute top-4 right-4 w-10 h-10 grid place-items-center text-ink/70 hover:text-accent text-2xl">×</button>
    </div>
  </Transition>
</template>

<style scoped>
.lb-enter-active, .lb-leave-active { transition: opacity .2s ease; }
.lb-enter-from, .lb-leave-to { opacity: 0; }
</style>

import { onMounted, onUnmounted } from 'vue'

/**
 * Scroll-reveal: elements with [data-reveal] that start below the fold are
 * hidden until they enter the viewport, then get .reveal (animate-rise).
 * Anything already on screen on mount is revealed immediately so the
 * first viewport never paints blank.
 */
export function useReveal() {
  let observer = null

  onMounted(() => {
    const els = [...document.querySelectorAll('[data-reveal]')]
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('reveal'))
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal')
            observer.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' },
    )
    // Above-the-fold items reveal right away; the rest are observed.
    const top = window.innerHeight
    for (const el of els) {
      if (el.getBoundingClientRect().top < top) el.classList.add('reveal')
      else observer.observe(el)
    }
  })

  onUnmounted(() => observer && observer.disconnect())
}

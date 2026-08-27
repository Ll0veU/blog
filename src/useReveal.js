import { onMounted, onUnmounted } from 'vue'

/**
 * Scroll-reveal: elements with [data-reveal] that start below the fold are
 * hidden until they enter the viewport, then get .reveal (animate-rise).
 * Anything already on screen is revealed immediately so the first viewport
 * never paints blank.
 *
 * Because the post list is conditionally rendered (v-if switching between
 * list/article, and filtered re-renders), new [data-reveal] nodes can appear
 * after the initial mount. A MutationObserver watches for them so a reveal
 * is always attached to freshly created cards (otherwise they'd stay hidden
 * at opacity:0 once the list re-renders).
 */
export function useReveal() {
  let observer = null
  let mo = null

  const consider = (el) => {
    if (el.classList.contains('reveal')) return
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add('reveal')
    else observer && observer.observe(el)
  }

  onMounted(() => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('reveal'))
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

    const scan = () => {
      observer.takeRecords?.()
      document.querySelectorAll('[data-reveal]').forEach(consider)
    }
    scan()

    // Watch for newly inserted [data-reveal] nodes (list re-renders /
    // article->list transitions).
    mo = new MutationObserver(() => scan())
    mo.observe(document.body, { childList: true, subtree: true })
  })

  onUnmounted(() => {
    observer && observer.disconnect()
    mo && mo.disconnect()
  })
}

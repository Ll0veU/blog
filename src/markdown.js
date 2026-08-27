// Synchronous frontmatter parser (no heavy deps) + lazy renderer entry.
// The list page only needs parseFrontmatter; the article page calls
// renderMarkdown which dynamically imports the markdown-it stack.

export function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!m) return { meta: {}, body: raw }
  const meta = {}
  let lastKey = null
  for (const line of m[1].split('\n')) {
    const listMatch = line.match(/^\s*-\s+(.+)$/)
    if (listMatch && lastKey) {
      if (!Array.isArray(meta[lastKey])) meta[lastKey] = []
      meta[lastKey].push(listMatch[1].replace(/^['"]|['"]$/g, ''))
      continue
    }
    const idx = line.indexOf(':')
    if (idx > 0) {
      const k = line.slice(0, idx).trim()
      const v = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
      meta[k] = v
      lastKey = k
    }
  }
  return { meta, body: raw.slice(m[0].length) }
}

// Lazy — splits markdown-it + katex + highlight.js into their own chunk.
export async function renderMarkdown(src) {
  const { renderMarkdown: render } = await import('./markdown-renderer.js')
  return render(src)
}

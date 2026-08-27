import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { rmSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

/**
 * Vite copies everything under public/ verbatim into dist/ — including
 * macOS .DS_Store files that Finder drops into folders. Strip them so the
 * deployed artifact is clean.
 */
function stripDSStore() {
  const walk = (dir) => {
    if (!existsSync(dir)) return
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry)
      const st = statSync(p)
      if (st.isDirectory()) walk(p)
      else if (extname(p) === '.DS_Store') rmSync(p)
    }
  }
  return {
    name: 'strip-ds-store',
    closeBundle: () => walk(join(process.cwd(), 'dist')),
  }
}

export default defineConfig({
  base: '/blog/',
  plugins: [vue(), stripDSStore()],
})

/**
 * Theme bootstrap — must run before Vue mounts to avoid FOUC.
 * Call applyInitialTheme() once in main.js (before createApp).
 */
const KEY = 'll0veu-theme'

export function getStoredTheme() {
  try { return localStorage.getItem(KEY) } catch { return null }
}

export function setStoredTheme(t) {
  try { localStorage.setItem(KEY, t) } catch {}
}

export function systemPrefersDark() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true
}

export function applyInitialTheme() {
  const stored = getStoredTheme()
  const dark = stored ? stored === 'dark' : systemPrefersDark()
  document.documentElement.classList.toggle('dark', dark)
}

export function toggleTheme() {
  const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark'
  document.documentElement.classList.toggle('dark', next === 'dark')
  setStoredTheme(next)
  return next
}

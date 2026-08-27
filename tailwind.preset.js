/**
 * Ll0veU.xyz shared design system — single source of truth.
 *
 * Each child app (home / blog / resume / projects / contact) is an
 * independent git repository with its own tailwind.config.js, but all
 * of them `require('../../tailwind.preset.js')` so colors, fonts, and
 * motion stay in lockstep across the MPA.
 *
 * Theme: dark-first (warm ink-green black + coral + acid lime),
 *        with a paired warm-paper light theme for the toggle.
 * Strategy: `dark` class on <html>, localStorage + prefers-color-scheme.
 */
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic tokens — resolve per-mode via CSS vars (see src/style.css).
        // Usage: bg-bg, text-ink, border-line, text-accent, text-acid, bg-panel, text-muted
        bg: 'var(--c-bg)',
        panel: 'var(--c-panel)',
        line: 'var(--c-line)',
        ink: 'var(--c-ink)',
        muted: 'var(--c-muted)',
        accent: 'var(--c-accent)',
        acid: 'var(--c-acid)',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'ui-monospace', 'monospace'],
      },
      maxWidth: {
        shell: '1100px',
        read: '760px',
      },
      letterSpacing: {
        tightest: '-0.06em',
      },
      transitionTimingFunction: {
        expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        blink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        rise: {
          from: { opacity: '0', transform: 'translateY(18px)' },
          to: { opacity: '1', transform: 'none' },
        },
        fade: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.96)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        blink: 'blink 1s steps(2) infinite',
        rise: 'rise 0.8s cubic-bezier(0.16,1,0.3,1) both',
        'rise-delay': 'rise 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s both',
        fade: 'fade 0.15s ease-out both',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}

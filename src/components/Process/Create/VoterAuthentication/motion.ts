import { keyframes } from '@emotion/react'

/** Shared easing — matches the app's existing motion language. */
export const EASE = 'cubic-bezier(0.4, 0, 0.2, 1)'

/** Soft entrance used for staggered card reveals. */
export const fadeUp = keyframes({
  from: { opacity: 0, transform: 'translateY(8px)' },
  to: { opacity: 1, transform: 'translateY(0)' },
})

/** Rewarding pop used when the passport card / gauge completes. */
export const popIn = keyframes({
  '0%': { opacity: 0, transform: 'scale(0.96)' },
  '60%': { opacity: 1, transform: 'scale(1.02)' },
  '100%': { opacity: 1, transform: 'scale(1)' },
})

/** Gentle invitation breathing for empty-state icons. */
export const breathe = keyframes({
  '0%, 100%': { transform: 'scale(1)', opacity: 0.85 },
  '50%': { transform: 'scale(1.06)', opacity: 1 },
})

/** Denied feedback when the credential cap is reached. */
export const shake = keyframes({
  '0%, 100%': { transform: 'translateX(0)' },
  '20%, 60%': { transform: 'translateX(-4px)' },
  '40%, 80%': { transform: 'translateX(4px)' },
})

/** Caret blink for the preview code screen. */
export const blink = keyframes({
  '0%, 100%': { opacity: 1 },
  '50%': { opacity: 0 },
})

/** Stroke draw for check marks (used with an SVG path or border reveal). */
export const drawIn = keyframes({
  from: { strokeDashoffset: 24 },
  to: { strokeDashoffset: 0 },
})

/**
 * Editor surface & elevation system — one source of truth for the ballot
 * editor's depth. Companion to `editor/typography.ts`.
 *
 * Why this exists: the global surfaces are flat (white cards on a white page in
 * light mode; inverted elevation in dark mode) and the theme has no shadow
 * scale. These tokens establish a whisper-subtle three-tier hierarchy —
 * recessed `canvas` → raised `surface` → recessed `inset` — that reads
 * correctly in both modes, plus a soft, consistent resting elevation.
 *
 * Light mode lifts cards with a tinted canvas + soft shadow; dark mode lifts
 * them with surface stepping (raised card lighter than the page) since shadows
 * barely register on dark. Later promotable to the global design system.
 *
 * Usage: `<Box bg={SURFACE.surface} boxShadow={ELEVATION.rest} />`,
 * `borderColor={SURFACE.border}`, `_hover={{ boxShadow: ELEVATION.hover }}`.
 */

/** Editor semantic surface tokens (defined in `~theme/semantic.ts`). */
export const SURFACE = {
  /** Recessed page behind cards. */
  canvas: 'editor.canvas',
  /** Raised card. */
  surface: 'editor.surface',
  /** Nested control / badge / icon tile (recessed within a card). */
  inset: 'editor.inset',
  /** Edge definition. */
  border: 'editor.border',
} as const

/** Soft, cool-neutral elevations (low alpha — felt, not noticed). */
export const ELEVATION = {
  /** A card sitting at rest. */
  rest: '0 1px 2px rgba(17,18,20,0.04), 0 1px 3px rgba(17,18,20,0.05)',
  /** Hover lift. */
  hover: '0 2px 4px rgba(17,18,20,0.04), 0 8px 20px -8px rgba(17,18,20,0.10)',
  /** Dragging / picked-up. */
  drag: '0 12px 32px -12px rgba(17,18,20,0.22)',
} as const

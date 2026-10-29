/**
 * The app's one font config: which family it uses and which weights it ships.
 *
 * - `tokens.ts` builds the `fonts` stacks and the `fontWeights` ladder from it,
 *   and every weight token must be one of `LOADED_FONT_WEIGHTS` (a weight with
 *   no file behind it makes the browser fake it: faux bold).
 * - `Theme.tsx` loads exactly these weights through static side-effect imports
 *   of `${FONT_PACKAGE}/<weight>.css`. They stay static so Vite bundles the
 *   CSS and Vike links it from the SSR HTML; `fonts.test.ts` keeps them in sync
 *   with this list.
 *
 * Keep this module free of CSS imports: `tokens.ts` (and through it
 * `system.ts`, which `chakra typegen` reads) imports it.
 */

export const FONT_FAMILY = 'Inter'

export const FONT_PACKAGE = '@fontsource/inter'

export const LOADED_FONT_WEIGHTS = [300, 400, 500] as const

export type LoadedFontWeight = (typeof LOADED_FONT_WEIGHTS)[number]

const SYSTEM_SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif'

export const FONT_STACKS = {
  body: `"${FONT_FAMILY}", ${SYSTEM_SANS}`,
  heading: `"${FONT_FAMILY}", ${SYSTEM_SANS}`,
  mono: `'Menlo', monospace`,
} as const

/**
 * The one font config: the family and the weights that ship. `tokens.ts` derives the stacks and
 * weight ladder from it; `Theme.tsx` imports one `${FONT_PACKAGE}/<weight>.css` per entry and
 * fonts.test.ts keeps them in sync. No CSS imports here: `chakra typegen` loads this via system.ts.
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

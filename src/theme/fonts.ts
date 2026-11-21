/**
 * The one font config: each family, the files it ships and the weight ladder. `tokens.ts` builds the font and
 * weight tokens from it, `Theme.tsx` holds one static import per file and fonts.test.ts keeps them in sync. A static
 * family loads its Latin files up front; lazyFonts.ts declares Inter's other subsets after hydration.
 * No CSS imports here: `chakra typegen` loads this via system.ts.
 */

// One `<package>/latin-<weight>.css` per static weight (Latin only: the files the page preloads), or one CSS file that covers a variable family's whole range.
type FontFiles =
  | { kind: 'static'; weights: readonly number[] }
  | { kind: 'variable'; range: readonly [min: number, max: number]; css: string }

export type WebFont = { family: string; package: string; files: FontFiles }

// Text and headings. A variable family is `files: { kind: 'variable', range: [400, 700], css: 'wght.css' }`
// with its `@fontsource-variable/<name>` package.
export const SANS = {
  family: 'Inter',
  package: '@fontsource/inter',
  files: { kind: 'static', weights: [300, 400, 500] },
} as const satisfies WebFont

// Every family the app downloads, in the order Theme.tsx imports them.
export const WEB_FONTS: readonly WebFont[] = [SANS]

const SYSTEM_SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif'

const stack = (font: WebFont, fallback: string) => `"${font.family}", ${fallback}`

export const FONT_STACKS = {
  body: stack(SANS, SYSTEM_SANS),
  heading: stack(SANS, SYSTEM_SANS),
  // Numerals, dates, counts and codes (text style `figure`): the text family today, so a mono family can take over.
  figure: stack(SANS, SYSTEM_SANS),
  mono: `'Menlo', monospace`,
} as const

// The CSS a family needs, which is what Theme.tsx must import.
export const fontCssFiles = ({ package: pkg, files }: WebFont) =>
  files.kind === 'static' ? files.weights.map((weight) => `${pkg}/latin-${weight}.css`) : [`${pkg}/${files.css}`]

// Whether a family has a real face for a weight; for any other the browser fakes one.
export const shipsWeight = ({ files }: WebFont, weight: number) =>
  files.kind === 'static' ? files.weights.includes(weight) : weight >= files.range[0] && weight <= files.range[1]

// A static family only takes the weights it ships; a variable one any number, which fonts.test.ts range-checks.
type ShippedWeight<F extends WebFont> = F['files'] extends { weights: readonly (infer W)[] } ? W : number

/**
 * Which weight each name renders on the text family. Inter ships 300, 400 and 500, so `normal`, `normal-plus` and
 * `medium` share 400 and everything from `medium-plus` up renders 500. `normal-plus` and `medium-plus` are the
 * half steps (450, 550) of a variable family; components may not use numbers, so they need names.
 */
export const FONT_WEIGHTS = {
  thin: 300,
  extralight: 300,
  light: 300,
  normal: 400,
  'normal-plus': 400,
  medium: 400,
  'medium-plus': 500,
  semibold: 500,
  bold: 500,
  bolder: 500,
  extrabold: 500,
  black: 500,
} as const satisfies Record<string, ShippedWeight<typeof SANS>>

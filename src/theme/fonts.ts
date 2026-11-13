/**
 * The one font config: each family, the files it ships and the weight ladder. `tokens.ts` builds the font and
 * weight tokens from it, `Theme.tsx` holds one static import per file and fonts.test.ts keeps them in sync.
 * No CSS imports here: `chakra typegen` loads this via system.ts.
 */

// One `<package>/<weight>.css` per static weight, or one CSS file that covers a variable family's whole range.
type FontFiles =
  | { kind: 'static'; weights: readonly number[] }
  | { kind: 'variable'; range: readonly [min: number, max: number]; css: string }

export type WebFont = { family: string; package: string; files: FontFiles }

// Text and headings. A variable family is `files: { kind: 'variable', range: [400, 700], css: 'wght.css' }`
// with its `@fontsource-variable/<name>` package.
export const SANS = {
  family: 'Commissioner Variable',
  package: '@fontsource-variable/commissioner',
  files: { kind: 'variable', range: [400, 700], css: 'wght.css' },
} as const satisfies WebFont

// Numerals, dates, counts and codes (text style `figure`).
const MONO = {
  family: 'JetBrains Mono Variable',
  package: '@fontsource-variable/jetbrains-mono',
  files: { kind: 'variable', range: [400, 700], css: 'wght.css' },
} as const satisfies WebFont

// Every family the app downloads, in the order Theme.tsx imports them.
export const WEB_FONTS: readonly WebFont[] = [SANS, MONO]

const SYSTEM_SANS = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", sans-serif'

const stack = (font: WebFont, fallback: string) => `"${font.family}", ${fallback}`

export const FONT_STACKS = {
  body: stack(SANS, SYSTEM_SANS),
  heading: stack(SANS, SYSTEM_SANS),
  figure: stack(MONO, 'ui-monospace, monospace'),
  mono: stack(MONO, 'ui-monospace, monospace'),
} as const

// The CSS a family needs, which is what Theme.tsx must import.
export const fontCssFiles = ({ package: pkg, files }: WebFont) =>
  files.kind === 'static' ? files.weights.map((weight) => `${pkg}/${weight}.css`) : [`${pkg}/${files.css}`]

// Whether a family has a real face for a weight; for any other the browser fakes one.
export const shipsWeight = ({ files }: WebFont, weight: number) =>
  files.kind === 'static' ? files.weights.includes(weight) : weight >= files.range[0] && weight <= files.range[1]

// A static family only takes the weights it ships; a variable one any number, which fonts.test.ts range-checks.
type ShippedWeight<F extends WebFont> = F['files'] extends { weights: readonly (infer W)[] } ? W : number

/**
 * Which weight each name renders on the text family: 400 to 600 for the interface, with 700 only for the names
 * above `bold`. `normal-plus` and `medium-plus` are the half steps (450, 550) of a variable family; components may
 * not use numbers, so they need names.
 */
export const FONT_WEIGHTS = {
  thin: 400,
  extralight: 400,
  light: 400,
  normal: 400,
  'normal-plus': 450,
  medium: 500,
  'medium-plus': 550,
  semibold: 600,
  bold: 600,
  bolder: 700,
  extrabold: 700,
  black: 700,
} as const satisfies Record<string, ShippedWeight<typeof SANS>>

/**
 * Brand palette generation from a single primary color.
 *
 * The app's accent (`PRIMARY_COLOR`) is a runtime env var, so the full chakra
 * palette it drives (the 50–950 scale plus the semantic slots every
 * `colorPalette`-aware recipe reads: solid, contrast, fg, muted, subtle,
 * emphasized, focusRing) has to be derived at runtime rather than hand-picked.
 *
 * Shades are produced by mixing the base towards white (tints) and towards
 * black (shades) in OKLab, which keeps the steps perceptually even across hues
 * (the same idea as CSS `color-mix(in oklab, …)`). Hand-rolled because the app
 * has no color dependency and the math is ~30 lines.
 */

export type PaletteScale = Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950, string>

type Rgb = [number, number, number]
type Lab = [number, number, number]

const HEX_COLOR = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * Normalizes a `#rgb` / `#rrggbb` string (leading `#` optional, any case) to
 * lowercase `#rrggbb`. Returns undefined for anything else — the caller decides
 * whether that is a warning (env parsing) or an error.
 */
export const normalizeHexColor = (value: string | undefined): string | undefined => {
  if (typeof value !== 'string') return undefined
  const match = HEX_COLOR.exec(value.trim())
  if (!match) return undefined
  const hex = match[1].toLowerCase()
  const long = hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex
  return `#${long}`
}

const hexToRgb = (hex: string): Rgb => {
  const value = normalizeHexColor(hex)
  if (!value) throw new Error(`Invalid hex color: ${hex}`)
  return [1, 3, 5].map((i) => parseInt(value.slice(i, i + 2), 16) / 255) as Rgb
}

const rgbToHex = ([r, g, b]: Rgb): string =>
  `#${[r, g, b]
    .map((c) =>
      Math.round(Math.min(1, Math.max(0, c)) * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`

const srgbToLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const linearToSrgb = (c: number) => (c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055)

// sRGB <-> OKLab (Björn Ottosson, https://bottosson.github.io/posts/oklab/)
const rgbToLab = (rgb: Rgb): Lab => {
  const [r, g, b] = rgb.map(srgbToLinear)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

const labToRgb = ([L, a, b]: Lab): Rgb => {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map(linearToSrgb) as Rgb
}

// Mixes `t` (0..1) of white (target L = 1) or black (target L = 0) into the color.
// Chroma (a, b) scales down towards zero in both directions, which is what makes
// tints read as pastel and shades as deep rather than muddy.
const mix = ([L, a, b]: Lab, target: 0 | 1, t: number): Lab => [L * (1 - t) + target * t, a * (1 - t), b * (1 - t)]

// WCAG relative luminance and contrast ratio (used to pick readable pairings).
const luminance = (hex: string) => {
  const [r, g, b] = hexToRgb(hex).map(srgbToLinear)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export const contrastRatio = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// Tint (towards white) and shade (towards black) amounts per step. 500 is the
// base itself so the configured color shows up verbatim wherever the palette's
// main step is used.
const TINTS: Array<[keyof PaletteScale, number]> = [
  [50, 0.95],
  [100, 0.9],
  [200, 0.8],
  [300, 0.6],
  [400, 0.3],
]
const SHADES: Array<[keyof PaletteScale, number]> = [
  [600, 0.15],
  [700, 0.3],
  [800, 0.45],
  [900, 0.6],
  [950, 0.75],
]

export const generatePaletteScale = (baseHex: string): PaletteScale => {
  const base = normalizeHexColor(baseHex)
  if (!base) throw new Error(`Invalid hex color: ${baseHex}`)
  const lab = rgbToLab(hexToRgb(base))
  const scale = { 500: base } as PaletteScale
  for (const [step, t] of TINTS) scale[step] = rgbToHex(labToRgb(mix(lab, 1, t)))
  for (const [step, t] of SHADES) scale[step] = rgbToHex(labToRgb(mix(lab, 0, t)))
  return scale
}

// WCAG minimum for non-text UI (3:1). A solid surface below this against the
// page background is invisible, so the semantic `solid` slot steps away from
// 500 until it clears the bar.
const MIN_SURFACE_CONTRAST = 3

const LIGHT_SOLID_STEPS: Array<keyof PaletteScale> = [500, 600, 700, 800, 900, 950]
const DARK_SOLID_STEPS: Array<keyof PaletteScale> = [500, 400, 300, 200, 100, 50]

const pickReadableStep = (scale: PaletteScale, candidates: Array<keyof PaletteScale>, background: string) =>
  candidates.find((step) => contrastRatio(scale[step], background) >= MIN_SURFACE_CONTRAST) ??
  candidates[candidates.length - 1]

// Text color for a filled surface of the given color. White is preferred as
// long as it clears the 3:1 bar: raw luminance would pick black on most mid
// tones (a mid blue scores 4.6 for black vs 4.5 for white), which is not what
// any design system does with its brand buttons. Black only when white can't.
export const contrastColor = (hex: string): '#ffffff' | '#000000' =>
  contrastRatio(hex, '#ffffff') >= MIN_SURFACE_CONTRAST ? '#ffffff' : '#000000'

export type PaletteSemanticSlot = { _light: string; _dark: string }
export type PaletteSemanticTokens = Record<
  'solid' | 'contrast' | 'fg' | 'muted' | 'subtle' | 'emphasized' | 'focusRing',
  PaletteSemanticSlot
>

type Backgrounds = { light: string; dark: string }

/**
 * Semantic slots for a generated scale, mirroring the mapping chakra ships for
 * its own colored palettes (fg 700/300, muted 200/800, subtle 100/900,
 * emphasized 300/700). `solid` differs on purpose: it is the exact configured
 * color (500) unless that is unreadable on the page background of a color
 * mode — a near-black brand on the dark surface, a pale one on white — in
 * which case it walks the scale until it is. `contrast` follows whichever
 * step `solid` ended on.
 */
export const generateBrandSemanticTokens = (scale: PaletteScale, backgrounds: Backgrounds): PaletteSemanticTokens => {
  const lightSolid = pickReadableStep(scale, LIGHT_SOLID_STEPS, backgrounds.light)
  const darkSolid = pickReadableStep(scale, DARK_SOLID_STEPS, backgrounds.dark)
  const ref = (step: keyof PaletteScale) => `{colors.brand.${step}}`

  return {
    solid: { _light: ref(lightSolid), _dark: ref(darkSolid) },
    contrast: { _light: contrastColor(scale[lightSolid]), _dark: contrastColor(scale[darkSolid]) },
    fg: { _light: ref(700), _dark: ref(300) },
    muted: { _light: ref(200), _dark: ref(800) },
    subtle: { _light: ref(100), _dark: ref(900) },
    emphasized: { _light: ref(300), _dark: ref(700) },
    focusRing: { _light: ref(500), _dark: ref(500) },
  }
}

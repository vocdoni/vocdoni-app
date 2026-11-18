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

// WCAG minimum for non-text UI (3:1). A fill under it against the page gets a hairline edge (`solidEdge`), and the
// lines that must be seen on the page (focus ring, outline border) step away from 500 until they clear it.
const MIN_SURFACE_CONTRAST = 3

const LIGHT_LINE_STEPS: Array<keyof PaletteScale> = [500, 600, 700, 800, 900, 950]
const DARK_LINE_STEPS: Array<keyof PaletteScale> = [500, 400, 300, 200, 100, 50]

const pickReadableStep = (
  scale: PaletteScale,
  candidates: Array<keyof PaletteScale>,
  background: string,
  min = MIN_SURFACE_CONTRAST
) => candidates.find((step) => contrastRatio(scale[step], background) >= min) ?? candidates[candidates.length - 1]

// WCAG AA minimum for normal-size text (4.5:1). Labels on a filled surface are
// text, so they are held to this bar rather than the 3:1 non-text one.
const MIN_TEXT_CONTRAST = 4.5

// `fg` is brand text on the page itself (links, outline buttons, active tabs), so it is held
// to the text bar; it keeps chakra's 700/300 whenever that step already reads.
const LIGHT_FG_STEPS: Array<keyof PaletteScale> = [700, 800, 900, 950]
const DARK_FG_STEPS: Array<keyof PaletteScale> = [300, 200, 100, 50]

// The first step that clears the text bar on every given background (the last candidate if none does).
const pickTextStep = (scale: PaletteScale, candidates: Array<keyof PaletteScale>, backgrounds: string[]) =>
  candidates.find((step) => backgrounds.every((bg) => contrastRatio(scale[step], bg) >= MIN_TEXT_CONTRAST)) ??
  candidates[candidates.length - 1]

/** Fil's ink (`gray.900` in colors.ts; palette.test.ts keeps the two equal): the dark label on a light fill. */
export const INK = '#171717'

export type LabelColor = '#ffffff' | typeof INK | '#000000'

// Label (text, tick, switch thumb) for a filled surface of the given colour: white while it reaches 4.5:1, as every
// design system does with its brand buttons, else Fil's ink, else black. Always at least 4.5:1: white and black
// multiply to exactly 21, so where white fails (luminance over 0.1833) black is above 21/4.5 = 4.67; ink needs a
// luminance of 0.2136 or more, and in the band between the two black takes over.
export const contrastColor = (hex: string): LabelColor => {
  if (contrastRatio(hex, '#ffffff') >= MIN_TEXT_CONTRAST) return '#ffffff'
  return contrastRatio(hex, INK) >= MIN_TEXT_CONTRAST ? INK : '#000000'
}

export type PaletteSemanticSlot = { _light: string; _dark: string }

// Every slot chakra defines for its own palettes. `border` is easy to miss and
// has no loud failure: chakra's outline recipes read `colorPalette.border` with
// a silent `var()` fallback to `colorPalette.muted`, so omitting it degrades
// outline controls to a near-white hairline instead of erroring.
export const PALETTE_SLOTS = [
  'solid',
  'contrast',
  'fg',
  'muted',
  'subtle',
  'emphasized',
  'focusRing',
  'border',
] as const

export type PaletteSemanticTokens = Record<(typeof PALETTE_SLOTS)[number], PaletteSemanticSlot>

type Backgrounds = { light: string; dark: string }

/**
 * Semantic slots for a generated scale on chakra's mapping (fg 700/300, muted 200/800, subtle 100/900, emphasized
 * 300/700). `solid` is the given colour itself (500) in both scopes, and `contrast` its label. `fg` walks the scale
 * only when unreadable on a mode's page background; `focusRing` and `border` are lines that must be seen on the page,
 * so they take the first step from 500 that reaches 3:1 against it.
 */
export const generateBrandSemanticTokens = (scale: PaletteScale, backgrounds: Backgrounds): PaletteSemanticTokens => {
  const lightLine = pickReadableStep(scale, LIGHT_LINE_STEPS, backgrounds.light)
  const darkLine = pickReadableStep(scale, DARK_LINE_STEPS, backgrounds.dark)
  // `fg` is also the text of a selected option, drawn on `subtle` (100 light, 900 dark), so it must read there too.
  const lightFg = pickTextStep(scale, LIGHT_FG_STEPS, [backgrounds.light, scale[100]])
  const darkFg = pickTextStep(scale, DARK_FG_STEPS, [backgrounds.dark, scale[900]])
  const ref = (step: keyof PaletteScale) => `{colors.brand.${step}}`
  const label = contrastColor(scale[500])

  return {
    solid: { _light: ref(500), _dark: ref(500) },
    contrast: { _light: label, _dark: label },
    fg: { _light: ref(lightFg), _dark: ref(darkFg) },
    muted: { _light: ref(200), _dark: ref(800) },
    subtle: { _light: ref(100), _dark: ref(900) },
    emphasized: { _light: ref(300), _dark: ref(700) },
    focusRing: { _light: ref(lightLine), _dark: ref(darkLine) },
    border: { _light: ref(lightLine), _dark: ref(darkLine) },
  }
}

// The control line (`border.emphasized`, the boards' black at 18%) a fill is edged with when it is too close to the
// page to show its own shape.
const EDGE_LINE = '{colors.border.emphasized}'

/**
 * `solidEdge`: the 1px hairline a filled control draws inside its edge. The control line where `solid` is under 3:1
 * against the scope's page, so a pale fill still shows its shape; `transparent` otherwise (Fil's blue has none).
 */
export const generateSolidEdge = (scale: PaletteScale, backgrounds: Backgrounds): PaletteSemanticSlot => ({
  _light: contrastRatio(scale[500], backgrounds.light) < MIN_SURFACE_CONTRAST ? EDGE_LINE : 'transparent',
  _dark: contrastRatio(scale[500], backgrounds.dark) < MIN_SURFACE_CONTRAST ? EDGE_LINE : 'transparent',
})

export type AccentTokens = Record<'fg', PaletteSemanticSlot>

const isNeutral = (hex: string) => {
  const [, a, b] = rgbToLab(hexToRgb(hex))
  return Math.hypot(a, b) < 0.01
}

/**
 * Brand accent the app's own tokens paint (active tab, highlighted notice): the brand's own `fg`, except on the dark
 * page for a neutral brand too dark to read there (the stock black), whose readable step is a mid grey; that one
 * shows white.
 */
export const generateAccentTokens = (scale: PaletteScale, backgrounds: Backgrounds): AccentTokens => {
  const whiteOnDark = isNeutral(scale[500]) && contrastRatio(scale[500], backgrounds.dark) < MIN_SURFACE_CONTRAST
  return {
    fg: { _light: '{colors.brand.fg}', _dark: whiteOnDark ? '{colors.white}' : '{colors.brand.fg}' },
  }
}

// How far a filled control's hover moves from its fill, in OKLab (the old CSS `color-mix(… 88%, black)`).
const HOVER_MIX = 0.12

/**
 * Hover fill of a filled control: `solid` 12% towards black, or towards white when darkening would take its label
 * under 4.5:1 (a mid-light colour whose label is ink or black). Lightening only raises a dark label's contrast.
 */
export const solidHoverColor = (solid: string): string => {
  const lab = rgbToLab(hexToRgb(solid))
  const darker = rgbToHex(labToRgb(mix(lab, 0, HOVER_MIX)))
  if (contrastRatio(darker, contrastColor(solid)) >= MIN_TEXT_CONTRAST) return darker
  return rgbToHex(labToRgb(mix(lab, 1, HOVER_MIX)))
}

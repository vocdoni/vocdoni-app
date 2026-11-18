import {
  createSystem,
  defaultConfig,
  defineSemanticTokens,
  defineTokens,
  type SystemStyleObject,
} from '@chakra-ui/react'
import { DEFAULT_PRIMARY_COLOR, PAGE_BACKGROUNDS } from './colors'
import { withEscapeHatch } from './escapeHatch'
import { generateAccentTokens, generateBrandSemanticTokens, generatePaletteScale, normalizeHexColor } from './palette'
import { recipes, slotRecipes } from './recipes'
import semanticTokens from './semantic'
import { textStyles } from './textStyles'
import tokens from './tokens'

// The palette `colorPalette`-aware components fall back to when none is set: always `brand`, which is Fil's blue
// until PRIMARY_COLOR replaces it. The argument is kept so callers need not change.
export const defaultColorPalette = (_primaryColor?: string) => 'brand' as const

// Fil's exact accent values, pinned instead of the generated steps when no PRIMARY_COLOR is set. The dark ones are
// the blue as a fill (`solid`, `solidHover`), as text or a line (`fg`, `fgHover`) and as a wash (`subtle`).
const FIL_ACCENT = { solidHover: '#1554cf', subtle: '#f0f5ff' } as const
const FIL_ACCENT_DARK = {
  solidHover: '#2d6deb',
  fg: '#6a99f1',
  fgHover: '#96b8f7',
  subtle: 'rgb(29 98 233 / 0.12)',
  contrast: '#ffffff',
} as const

/**
 * Builds the chakra system for a given primary/accent color.
 *
 * Without a color `brand` is Fil's blue, with its light and dark values pinned. With one,
 * the `brand` scale and its semantic slots are generated from it. Either way
 * `brand` is the global palette, so buttons, checkboxes, tabs, focus rings and
 * every accent token follow it. Dark-mode surfaces live on the neutral
 * `gray` and `carbon` scales and are unaffected.
 */
export const createAppSystem = (primaryColor?: string) => {
  const brand = normalizeHexColor(primaryColor)
  const scale = generatePaletteScale(brand ?? DEFAULT_PRIMARY_COLOR)
  const brandTokens = Object.fromEntries(Object.entries(scale).map(([step, value]) => [step, { value }]))
  const asTokens = (slots: object) =>
    Object.fromEntries(Object.entries(slots).map(([slot, value]) => [slot, { value }]))
  const generated = generateBrandSemanticTokens(scale, PAGE_BACKGROUNDS)
  const slots = brand
    ? generated
    : {
        ...generated,
        solid: { ...generated.solid, _light: '{colors.brand.500}', _dark: '{colors.brand.500}' },
        contrast: { ...generated.contrast, _light: '#ffffff', _dark: FIL_ACCENT_DARK.contrast },
        fg: { ...generated.fg, _light: '{colors.brand.500}', _dark: FIL_ACCENT_DARK.fg },
        subtle: { ...generated.subtle, _light: FIL_ACCENT.subtle, _dark: FIL_ACCENT_DARK.subtle },
        focusRing: { ...generated.focusRing, _light: '{colors.brand.500}', _dark: FIL_ACCENT_DARK.fg },
      }
  const brandSemantic = {
    ...asTokens(slots),
    // A filled button's hover. Fil pins it; a brand colour gets its own fill mixed 12% towards black, so a hover
    // never lightens. Other palettes have no such slot, so the button recipe falls back to the same mix.
    solid: {
      DEFAULT: { value: slots.solid },
      hover: {
        value: {
          _light: brand ? 'color-mix(in oklab, {colors.brand.solid} 88%, black)' : FIL_ACCENT.solidHover,
          _dark: brand ? 'color-mix(in oklab, {colors.brand.solid} 94%, white)' : FIL_ACCENT_DARK.solidHover,
        },
      },
    },
  }
  const palette = defaultColorPalette(brand)
  // The accent steps alias the palette `colorPalette` falls back to, so a recipe that reads `accent.solid` instead
  // of `colorPalette.solid` paints the same. `fg.hover` is the text colour of a link under the pointer: never
  // lighter than at rest, so it stays readable for any brand colour.
  const accentSlots = generateAccentTokens(scale, PAGE_BACKGROUNDS)
  const accent = {
    fg: {
      DEFAULT: { value: accentSlots.fg },
      hover: {
        value: {
          _light: brand ? '{colors.brand.950}' : FIL_ACCENT.solidHover,
          _dark: brand ? 'color-mix(in oklab, {colors.brand.fg} 70%, white)' : FIL_ACCENT_DARK.fgHover,
        },
      },
    },
    solid: {
      DEFAULT: { value: `{colors.${palette}.solid}` },
      hover: { value: `{colors.${palette}.solid.hover}` },
    },
    contrast: { value: `{colors.${palette}.contrast}` },
    subtle: { value: `{colors.${palette}.subtle}` },
    // The accent as a line or edge (a selected row, an outlined notice, a drop target): the fill in light, the
    // lighter text blue in dark, where the fill is too dark against the page.
    line: { value: { _light: '{colors.accent.solid}', _dark: '{colors.accent.fg}' } },
  }

  const appSystem = createSystem(defaultConfig, {
    // Style props only take theme tokens; `[value]` is the escape for non-design values (0, auto, 100%).
    strictTokens: true,
    globalCss: {
      html: {
        colorPalette: palette,
      },
      // Text that sets no size (a bare Text, markdown, list items) inherits the body role, so a new type
      // scale reaches it too.
      body: {
        textStyle: 'body',
        letterSpacing: 'body',
        // Tabular numerals so figures line up; smoothing keeps small type crisp on macOS.
        fontVariantNumeric: 'tabular-nums',
        // Chakra's style types omit the vendor-prefixed property, so it is cast in.
        ...({ WebkitFontSmoothing: 'antialiased' } as SystemStyleObject),
      },
      // The CSS default (`bolder`) would ask for 700; the interface tops out at 600.
      'b, strong': {
        fontWeight: 'semibold',
      },
    },
    theme: {
      tokens: defineTokens({
        ...tokens,
        colors: { ...tokens.colors, brand: brandTokens },
      }),
      semanticTokens: defineSemanticTokens({
        ...semanticTokens,
        colors: { ...semanticTokens.colors, brand: brandSemantic, accent },
      }),
      textStyles,
      recipes,
      slotRecipes,
    },
  })

  return withEscapeHatch(appSystem)
}

export type AppSystem = ReturnType<typeof createAppSystem>

// Systems are memoized per color: building one is not free and the color is
// constant for a process (server) or a page load (client), so the provider can
// call this on every render without paying for it.
const systems = new Map<string, AppSystem>()

export const getAppSystem = (primaryColor?: string): AppSystem => {
  const key = normalizeHexColor(primaryColor) ?? ''
  let cached = systems.get(key)
  if (!cached) {
    cached = createAppSystem(key || undefined)
    systems.set(key, cached)
  }
  return cached
}

// The stock system (no PRIMARY_COLOR). Also what `chakra typegen` reads.
export const system = getAppSystem()

import { createSystem, defaultConfig, defineSemanticTokens, defineTokens } from '@chakra-ui/react'
import { DEFAULT_PRIMARY_COLOR, PAGE_BACKGROUNDS } from './colors'
import { withEscapeHatch } from './escapeHatch'
import { generateAccentTokens, generateBrandSemanticTokens, generatePaletteScale, normalizeHexColor } from './palette'
import { recipes, slotRecipes } from './recipes'
import semanticTokens from './semantic'
import { textStyles } from './textStyles'
import tokens from './tokens'

// The palette `colorPalette`-aware components fall back to when none is set: always `brand`, which is Fil's blue
// until PRIMARY_COLOR replaces it. The argument is kept so callers need not change.
export const defaultColorPalette = (_primaryColor?: string) => 'brand'

// Fil's exact accent values, pinned (light side) instead of the generated steps when no PRIMARY_COLOR is set.
const FIL_ACCENT = { solidHover: '#1554cf', subtle: '#f0f5ff' } as const

/**
 * Builds the chakra system for a given primary/accent color.
 *
 * Without a color `brand` is Fil's blue, with its light values pinned. With one,
 * the `brand` scale and its semantic slots are generated from it. Either way
 * `brand` is the global palette, so buttons, checkboxes, tabs, focus rings and
 * every accent token follow it. Dark-mode surfaces live on the separate `ink`
 * scale and are unaffected.
 */
export const createAppSystem = (primaryColor?: string) => {
  const brand = normalizeHexColor(primaryColor)
  const scale = generatePaletteScale(brand ?? DEFAULT_PRIMARY_COLOR)
  const brandTokens = Object.fromEntries(Object.entries(scale).map(([step, value]) => [step, { value }]))
  const asTokens = (slots: object) =>
    Object.fromEntries(Object.entries(slots).map(([slot, value]) => [slot, { value }]))
  const generated = generateBrandSemanticTokens(scale, PAGE_BACKGROUNDS)
  const brandSemantic = asTokens(
    brand
      ? generated
      : {
          ...generated,
          solid: { ...generated.solid, _light: '{colors.brand.500}' },
          contrast: { ...generated.contrast, _light: '#ffffff' },
          fg: { ...generated.fg, _light: '{colors.brand.500}' },
          subtle: { ...generated.subtle, _light: FIL_ACCENT.subtle },
          focusRing: { ...generated.focusRing, _light: '{colors.brand.500}' },
        }
  )
  const palette = defaultColorPalette(brand)
  // The accent steps alias the palette `colorPalette` falls back to, so a recipe that reads `accent.solid` instead
  // of `colorPalette.solid` paints the same. `solid.hover` is Chakra's solid button hover.
  const accent = {
    ...asTokens(generateAccentTokens(scale, PAGE_BACKGROUNDS)),
    solid: {
      DEFAULT: { value: `{colors.${palette}.solid}` },
      hover: {
        value: brand
          ? `{colors.${palette}.solid/90}`
          : { _light: FIL_ACCENT.solidHover, _dark: `{colors.${palette}.solid/90}` },
      },
    },
    contrast: { value: `{colors.${palette}.contrast}` },
    subtle: { value: `{colors.${palette}.subtle}` },
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
        WebkitFontSmoothing: 'antialiased',
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

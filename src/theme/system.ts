import { createSystem, defaultConfig, defineSemanticTokens, defineTokens } from '@chakra-ui/react'
import { DEFAULT_PRIMARY_COLOR, PAGE_BACKGROUNDS } from './colors'
import { withEscapeHatch } from './escapeHatch'
import { generateAccentTokens, generateBrandSemanticTokens, generatePaletteScale, normalizeHexColor } from './palette'
import { recipes, slotRecipes } from './recipes'
import semanticTokens from './semantic'
import { textStyles } from './textStyles'
import tokens from './tokens'

// The palette `colorPalette`-aware components fall back to when none is set.
export const defaultColorPalette = (primaryColor?: string) => (normalizeHexColor(primaryColor) ? 'brand' : 'gray')

/**
 * Builds the chakra system for a given primary/accent color.
 *
 * Without a color the theme is the stock one: the neutral `gray` palette drives
 * every `colorPalette`-aware component and `brand.500` is black. With one, the
 * `brand` scale and its semantic slots are generated from it and `brand`
 * becomes the global palette, so buttons, checkboxes, tabs, focus rings and
 * every accent token follow the configured color. Dark-mode surfaces live on
 * the separate `ink` scale and are unaffected either way.
 */
export const createAppSystem = (primaryColor?: string) => {
  const brand = normalizeHexColor(primaryColor)
  const scale = generatePaletteScale(brand ?? DEFAULT_PRIMARY_COLOR)
  const brandTokens = Object.fromEntries(Object.entries(scale).map(([step, value]) => [step, { value }]))
  const asTokens = (slots: object) =>
    Object.fromEntries(Object.entries(slots).map(([slot, value]) => [slot, { value }]))
  const brandSemantic = asTokens(generateBrandSemanticTokens(scale, PAGE_BACKGROUNDS))
  const accent = asTokens(generateAccentTokens(scale, PAGE_BACKGROUNDS))

  const appSystem = createSystem(defaultConfig, {
    // Style props only take theme tokens; `[value]` is the escape for non-design values (0, auto, 100%).
    strictTokens: true,
    globalCss: {
      html: {
        colorPalette: defaultColorPalette(brand),
      },
      // Text that sets no size (a bare Text, markdown, list items) inherits the body role, so a new type
      // scale reaches it too.
      body: {
        textStyle: 'body',
      },
      // The CSS default (`bolder`) would ask for 700, a weight the app does not
      // load, and the browser would fake it.
      'b, strong': {
        fontWeight: 'bold',
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

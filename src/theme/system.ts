import { createSystem, defaultConfig, defineSemanticTokens, defineTokens } from '@chakra-ui/react'
import { DEFAULT_PRIMARY_COLOR, PAGE_BACKGROUNDS } from './colors'
import { generateBrandSemanticTokens, generatePaletteScale, normalizeHexColor } from './palette'
import { recipes, slotRecipes } from './recipes'
import semanticTokens from './semantic'
import tokens from './tokens'

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
  const brandSemantic = Object.fromEntries(
    Object.entries(generateBrandSemanticTokens(scale, PAGE_BACKGROUNDS)).map(([slot, value]) => [slot, { value }])
  )

  return createSystem(defaultConfig, {
    globalCss: {
      html: {
        colorPalette: brand ? 'brand' : 'gray',
      },
    },
    theme: {
      tokens: defineTokens({
        ...tokens,
        colors: { ...tokens.colors, brand: brandTokens },
      }),
      semanticTokens: defineSemanticTokens({
        ...semanticTokens,
        colors: { ...semanticTokens.colors, brand: brandSemantic },
      }),
      recipes,
      slotRecipes,
    },
  })
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

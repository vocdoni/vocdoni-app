import {
  createSystem,
  defaultConfig,
  defineSemanticTokens,
  defineTokens,
  type SystemStyleObject,
} from '@chakra-ui/react'
import { DEFAULT_PRIMARY_COLOR, PAGE_BACKGROUNDS } from './colors'
import { withEscapeHatch } from './escapeHatch'
import { lruMemo } from './lru-memo'
import {
  generateAccentTokens,
  generateBrandSemanticTokens,
  generatePaletteScale,
  generateSolidEdge,
  normalizeHexColor,
  solidHoverColor,
} from './palette'
import { recipes, slotRecipes } from './recipes'
import semanticTokens from './semantic'
import { textStyles } from './textStyles'
import tokens from './tokens'

// The palette `colorPalette`-aware components fall back to when none is set: always `brand`, which is Fil's blue
// until PRIMARY_COLOR replaces it. The argument is kept so callers need not change.
export const defaultColorPalette = (_primaryColor?: string) => 'brand' as const

// Every palette but `brand` that a filled control can take: chakra's own and the status ones (status.ts).
const OTHER_PALETTES = [
  'gray',
  'red',
  'orange',
  'yellow',
  'green',
  'teal',
  'blue',
  'cyan',
  'purple',
  'pink',
  'success',
  'warning',
  'danger',
  'info',
] as const

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
    // A filled control's fill is the colour as given (`brand.500`), in both scopes. Fil pins its light hover; a brand
    // colour's hover is its fill moved 12% towards black, or towards white when that would take its label under 4.5:1
    // (palette.ts). `edge` is the hairline a fill too pale for its page draws inside its edge (transparent for Fil's
    // blue). The other palettes state their own two slots below (`ownFillSlots`).
    solid: {
      DEFAULT: { value: slots.solid },
      hover: {
        value: {
          _light: brand ? solidHoverColor(scale[500]) : FIL_ACCENT.solidHover,
          _dark: brand ? solidHoverColor(scale[500]) : FIL_ACCENT_DARK.solidHover,
        },
      },
      edge: { value: generateSolidEdge(scale, PAGE_BACKGROUNDS) },
    },
  }
  const palette = defaultColorPalette(brand)
  // The accent steps alias the palette `colorPalette` falls back to, so a recipe that reads `accent.solid` instead
  // of `colorPalette.solid` paints the same. `border` is the accent drawn as a line on the page, 3:1 or more against
  // it. `fg.hover` is the text colour of a link under the pointer: never lighter than at rest, so it stays readable
  // for any brand colour.
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
      edge: { value: `{colors.${palette}.solid.edge}` },
    },
    contrast: { value: `{colors.${palette}.contrast}` },
    border: { value: `{colors.${palette}.border}` },
    subtle: { value: `{colors.${palette}.subtle}` },
    // The accent as a line or edge (a selected row, an outlined notice, a drop target): the line step in light (the
    // fill itself unless an organisation colour is too pale for 3:1 on the page), the lighter text blue in dark.
    line: { value: { _light: '{colors.accent.border}', _dark: '{colors.accent.fg}' } },
  }

  // Custom properties inherit: an element that sets another palette would still read brand's `solid.hover` and
  // `solid.edge` from <html>, so every other palette that can fill a control states its own (flat names give the same
  // CSS variables; a slot nested under chakra's own `solid` token would be dropped).
  const ownHover = (name: string) => `color-mix(in oklab, {colors.${name}.solid} 88%, black)`
  const ownFillSlots = Object.fromEntries(
    OTHER_PALETTES.map((name) => [
      name,
      {
        ...(semanticTokens.colors as Record<string, object>)[name],
        solidHover: { value: { _light: ownHover(name), _dark: ownHover(name) } },
        solidEdge: { value: 'transparent' },
      },
    ])
  )

  const appSystem = createSystem(defaultConfig, {
    // Style props only take theme tokens; `[value]` is the escape for non-design values (0, auto, 100%).
    strictTokens: true,
    globalCss: {
      html: {
        colorPalette: palette,
        // Room for the scrollbar on every page, so going from a short page to a long one does not shift the layout.
        // Chakra's typings take this property for a spacing one; `stable` is its CSS keyword.
        scrollbarGutter: 'stable' as never,
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
      // Chakra's Group (InputGroup, button groups) spaces its items with a raw 0.5rem unless this is set.
      '.chakra-group': {
        '--group-gap': '{spacing.2}',
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
        colors: { ...semanticTokens.colors, ...ownFillSlots, brand: brandSemantic, accent },
      }),
      textStyles,
      recipes,
      slotRecipes,
    },
  })

  return withEscapeHatch(appSystem)
}

export type AppSystem = ReturnType<typeof createAppSystem>

// Systems are memoized per colour: building one is not free, and the provider calls this on every render. Organisation
// colours are open-ended input on the server (one per branded vote), so only the 32 most recently used are kept; the
// stock system sits outside that memo, is built on first use and is never evicted.
const MAX_SYSTEMS = 32
let stockSystem: AppSystem | undefined
const colorSystem = lruMemo(MAX_SYSTEMS, (color) => createAppSystem(color))

export const getAppSystem = (primaryColor?: string): AppSystem => {
  const color = normalizeHexColor(primaryColor)
  if (color) return colorSystem(color)
  stockSystem ??= createAppSystem()
  return stockSystem
}

// The stock system (no PRIMARY_COLOR). Also what `chakra typegen` reads.
// Marked pure so a production bundle that never reads `system` (only tests, style-inventory and typegen do) drops it.
export const system = /* @__PURE__ */ getAppSystem()

import { createSystem, type SystemConfig } from '@chakra-ui/react'
import { withEscapeHatch } from '../escapeHatch'
import { createAppSystem } from '../system'

// A loud alternate theme for `pnpm ui:snapshot -- --theme stress` (scripts/ui-snapshot/README.md): the app's
// tokens and recipes with every value they resolve to moved off stock. The harness aliases `~theme/system` to
// this module, hence the re-exports.
export * from '../system'

const stock = createAppSystem()

// Every font family carries this name; a text element without it bypassed the font tokens.
export const STRESS_FONT_MARKER = 'Stress'

const fonts = {
  body: { value: `"${STRESS_FONT_MARKER} Body", "Courier New", monospace` },
  heading: { value: `"${STRESS_FONT_MARKER} Heading", Georgia, serif` },
  mono: { value: `"${STRESS_FONT_MARKER} Mono", monospace` },
}

const tokensOf = (category: string) =>
  stock.tokens.allTokens.filter(
    (token) => token.extensions.category === category && !token.extensions.negative && !token.extensions.conditions
  )

const pixels = (value: string | number | undefined) => {
  const match = /^(-?\d*\.?\d+)(px|rem)$/.exec(String(value ?? ''))
  if (!match) return undefined
  return Number(match[1]) * (match[2] === 'rem' ? 16 : 1)
}

const stockPixels = (category: string) =>
  tokensOf(category)
    .map((token) => [token.name.slice(category.length + 1), pixels(token.value)] as const)
    .filter((entry): entry is readonly [string, number] => entry[1] !== undefined && entry[1] !== 0)

// Stock radii, font sizes and spacing are all even pixel values: one pixel more keeps the layout and makes every
// themed value odd, so a stock value left on screen did not come from the scale.
const nudged = (category: string) =>
  Object.fromEntries(stockPixels(category).map(([name, px]) => [name, { value: `${px + 1}px` }]))

// ---------------------------------------------------------------------------
// Colours: each semantic colour token gets its own saturated hue, at a lightness that fits its role, so no surface,
// state, status or chart colour shares a value with another and none of them is grey.

type Role = 'surface' | 'text' | 'line' | 'solid' | 'onSolid' | 'onDark' | 'scrim'

const roleOf = (path: string[]): Role => {
  const has = (...names: string[]) => names.some((name) => path.includes(name))
  if (has('contrast') || (has('fg') && has('inverted'))) return 'onSolid'
  if (path[0] === 'scrim') return has('fg') ? 'onSolid' : 'scrim'
  // The auth showcase panel is a dark palette step in both modes
  if (has('showcase')) return has('rule') ? 'line' : 'onDark'
  if (has('inverse')) return has('fg') ? 'onSolid' : has('border', 'rule') ? 'line' : 'solid'
  if (has('fg', 'color', 'placeholder', 'emphasis', 'logo', 'schedule') || (path[0] === 'ballot' && has('error'))) {
    return 'text'
  }
  if (has('border', 'focusRing', 'rule', 'ring', 'track')) return 'line'
  if (has('solid', 'icon', 'chart', 'meter', 'balance', 'dragover', 'inverted')) return 'solid'
  return 'surface'
}

// [light, dark] HSL lightness per role; `onSolid` is the label on `solid`.
const LIGHTNESS: Record<Role, [number, number]> = {
  surface: [90, 16],
  text: [24, 84],
  line: [55, 45],
  solid: [40, 58],
  onSolid: [96, 9],
  onDark: [94, 90],
  scrim: [28, 8],
}

const hex = (hue: number, saturation: number, lightness: number, alpha?: number) => {
  const s = saturation / 100
  const l = lightness / 100
  const channel = (n: number) => {
    const k = (n + hue / 30) % 12
    const value = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1))
    return Math.round(value * 255)
      .toString(16)
      .padStart(2, '0')
  }
  const a =
    alpha === undefined
      ? ''
      : Math.round(alpha * 255)
          .toString(16)
          .padStart(2, '0')
  return `#${channel(0)}${channel(8)}${channel(4)}${a}`
}

const GOLDEN_ANGLE = 137.508

type TokenTree = { [key: string]: TokenTree | { value: unknown } }

const isToken = (node: object): node is { value: unknown } => 'value' in node

// Rebuilds a semantic token tree with the same paths, one value per token from `valueFor`.
const remap = (tree: TokenTree, valueFor: (path: string[], index: number) => unknown) => {
  let index = 0
  const walk = (node: TokenTree, path: string[]): TokenTree =>
    Object.fromEntries(
      Object.entries(node)
        .filter(([, child]) => child && typeof child === 'object')
        .map(([key, child]) => [
          key,
          isToken(child) ? { value: valueFor([...path, key], index++) } : walk(child as TokenTree, [...path, key]),
        ])
    )
  return walk(tree, [])
}

const stockSemantic = stock._config.theme?.semanticTokens as Record<string, TokenTree>

const colors = remap(stockSemantic.colors, (path, index) => {
  const role = roleOf(path.filter((segment) => segment !== 'DEFAULT'))
  const hue = (index * GOLDEN_ANGLE) % 360
  const saturation = 70 + (index % 4) * 8
  const alpha = role === 'scrim' ? 0.55 : undefined
  const [light, dark] = LIGHTNESS[role]
  return { _light: hex(hue, saturation, light, alpha), _dark: hex(hue, saturation, dark, alpha) }
})

const shadows = remap(stockSemantic.shadows, (path, index) => {
  const hue = (index * GOLDEN_ANGLE + 60) % 360
  const inset = path.includes('inset') || path.includes('inner') ? 'inset ' : ''
  const shadow = (lightness: number) =>
    `${inset}0 ${2 + (index % 4)}px ${4 + (index % 5) * 2}px ${hex(hue, 90, lightness, 0.8)}`
  return { _light: shadow(45), _dark: shadow(60) }
})

// A fresh system has its own token dictionary, so it needs the app's `[value]` unwrapping too.
export const stressSystem = withEscapeHatch(
  createSystem(stock._config, {
    theme: {
      tokens: {
        fonts,
        radii: nudged('radii'),
        fontSizes: nudged('fontSizes'),
        spacing: nudged('spacing'),
      },
      semanticTokens: { colors, shadows } as NonNullable<SystemConfig['theme']>['semanticTokens'],
    },
  })
)

export const system = stressSystem
export const getAppSystem = (_primaryColor?: string) => stressSystem

// Stock values the harness looks for on screen: a leak is a stock value the stress theme replaced. Palette steps
// stay stock in the stress theme, so a step on screen was read directly rather than through a semantic token.
export const stressProbeSpec = {
  fontMarker: STRESS_FONT_MARKER,
  radii: stockPixels('radii').map(([, px]) => px),
  fontSizes: stockPixels('fontSizes').map(([, px]) => px),
  spacing: stockPixels('spacing').map(([, px]) => px),
  palette: Object.fromEntries(
    tokensOf('colors')
      .map((token) => [token.name.slice('colors.'.length), String(token.value)] as const)
      .filter(([name, value]) => /^[a-z]+\.\d+$/.test(name) && !name.startsWith('whatsapp.') && /^#/.test(value))
      .map(([name, value]) => [value.toLowerCase(), name])
  ),
}

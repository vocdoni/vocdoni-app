import { defaultConfig } from '@chakra-ui/react'
import { describe, expect, it } from 'vitest'
import { PAGE_BACKGROUNDS } from './colors'
import { contrastRatio, INK, minContrast, PALETTE_SLOTS, solidHoverColor } from './palette'
import { DashboardContents as dashboardContents } from './recipes/dashboard'
import { dragHandle } from './recipes/dragHandle'
import { ConfirmModal } from './recipes/confirmModal'
import { VideoPreview } from './recipes/videoPreview'
import { recipes, slotRecipes } from './recipes'
import { StepProgress, StepRail } from './recipes/steps'
import { AgendaList, PhaseList, ReceiptCodes } from './recipes/voterLists'
import { RankBadge, SuccessDisc } from './recipes/voterMarks'
import { VoterShell } from './recipes/voterShell'
import semanticTokens from './semantic'
import { createAppSystem, getAppSystem, system } from './system'

/**
 * Guards the theme against dangling references, which chakra silently ignores
 * at runtime and typegen cannot catch (color props are widened to AnyString,
 * and any var(--…) typechecks). The chakra v3 migration shipped recipes whose
 * tokens, CSS vars and breakpoints no longer existed; these tests make that
 * class of bug impossible to reintroduce.
 *
 * Scope is recipes + semantic tokens. Component-level enforcement would need
 * an ESLint rule (dot-paths in components collide with i18n keys and other
 * false positives).
 */

// Values that are legitimate CSS keywords rather than tokens
const CSS_KEYWORDS = new Set(['transparent', 'currentColor', 'inherit', 'initial', 'unset', 'none', 'auto'])

// Style props whose string values must resolve as color tokens
const COLOR_PROPS = new Set([
  'color',
  'bg',
  'bgColor',
  'background',
  'backgroundColor',
  'borderColor',
  'borderTopColor',
  'borderBottomColor',
  'borderLeftColor',
  'borderRightColor',
  'outlineColor',
  'fill',
  'stroke',
  'textDecorationColor',
  'caretColor',
  'accentColor',
])

// Exact string literals that are intentionally raw (each entry needs a reason)
const RAW_LITERAL_ALLOWLIST = new Set<string>([
  // Chakra's card `size` variants set it; card variants that pad their root read it.
  'var(--card-padding)',
  // The toast recipe sets it per type; the indicator icon reads it.
  'var(--toast-indicator, currentColor)',
])

// Non-color style props whose token-looking string values must resolve in their token category
const RADIUS_PROPS = [
  'borderRadius',
  'rounded',
  'roundedTop',
  'roundedBottom',
  'roundedLeft',
  'roundedRight',
  'roundedTopLeft',
  'roundedTopRight',
  'roundedBottomLeft',
  'roundedBottomRight',
  'borderTopRadius',
  'borderBottomRadius',
  'borderTopLeftRadius',
  'borderTopRightRadius',
  'borderBottomLeftRadius',
  'borderBottomRightRadius',
]
const TOKEN_PROPS: Record<string, string> = {
  lineHeight: 'lineHeights',
  fontSize: 'fontSizes',
  fontWeight: 'fontWeights',
  letterSpacing: 'letterSpacings',
  boxShadow: 'shadows',
  shadow: 'shadows',
  zIndex: 'zIndex',
  ...Object.fromEntries(RADIUS_PROPS.map((prop) => [prop, 'radii'])),
}

// CSS keywords these props accept besides tokens
const TOKEN_PROP_KEYWORDS = new Set([
  'normal',
  'bold',
  'bolder',
  'lighter',
  'smaller',
  'larger',
  'xx-small',
  'x-small',
  'small',
  'medium',
  'large',
  'x-large',
  'xx-large',
  'revert',
])

// Recipe paths tolerated while they reference a missing token. The test below fails once an entry stops being
// invalid, so it must then be deleted.
const KNOWN_INVALID = new Set<string>()

const confirmedInvalid = new Set<string>()

const ALL_RECIPES: Record<string, unknown> = {
  ...recipes,
  ...slotRecipes,
  dragHandle,
  dashboardContents,
  confirmModal: ConfirmModal,
  // The voter page's pieces, each imported by its own ui/ component.
  voterShell: VoterShell,
  stepRail: StepRail,
  stepProgress: StepProgress,
  rankBadge: RankBadge,
  successDisc: SuccessDisc,
  phaseList: PhaseList,
  receiptCodes: ReceiptCodes,
  agendaList: AgendaList,
  VideoPreview,
}

const isTokenPath = (value: string) => /^[a-zA-Z][\w-]*(\.[\w-]+)+$/.test(value)

// Also exercised against a system built for a configured PRIMARY_COLOR, so the
// generated brand scale and its semantic slots are held to the same bar.
const BRANDED = createAppSystem('#1a73e8')

const colorTokenExists = (path: string, sys = system) => sys.tokens.getByName(`colors.${path}`) !== undefined

const isSelectorKey = (key: string) => /[&@:\[\] >~+*=,.]/.test(key)

const conditionKeys = new Set(system.conditions.keys())
const breakpointKeys = new Set<string>(system.conditions.breakpoints)

const isValidConditionalKey = (key: string) =>
  key === 'base' || breakpointKeys.has(key) || conditionKeys.has(key) || isSelectorKey(key)

type Violation = { path: string; value: string; reason: string }

// Checks a string used as the value of a non-color token prop (lineHeight, fontSize, radius, …)
const checkTokenValue = (value: string, path: string, category: string, violations: Violation[]) => {
  if (CSS_KEYWORDS.has(value) || TOKEN_PROP_KEYWORDS.has(value)) return
  // Numbers, lengths and composite values (`0 0 0 1px …`) are not token references
  if (!/^[a-zA-Z][\w-]*(\.[\w-]+)*$/.test(value)) return
  if (system.tokens.getByName(`${category}.${value}`) === undefined) {
    if (KNOWN_INVALID.has(path)) {
      confirmedInvalid.add(path)
      return
    }
    violations.push({ path, value, reason: `${category} token not found in the built system` })
  }
}

// Checks a string used as the value of a color prop (directly or via a conditional map)
const checkColorValue = (value: string, path: string, violations: Violation[]) => {
  if (CSS_KEYWORDS.has(value)) return
  // Composite CSS values (gradients, shorthands) are covered by the raw-literal scan
  if (value.includes(' ') || value.includes('(')) return
  const base = value.split('/')[0] // strip opacity modifier (e.g. gray.500/40)
  if (!isTokenPath(base)) return
  if (!colorTokenExists(base)) {
    violations.push({ path, value, reason: 'color token not found in the built system' })
  }
}

const walk = (
  node: unknown,
  path: string,
  colorProp: boolean,
  violations: Violation[],
  slotNames: Set<string>,
  tokenCategory?: string
) => {
  if (typeof node === 'string') {
    if (colorProp) checkColorValue(node, path, violations)
    if (tokenCategory) checkTokenValue(node, path, tokenCategory, violations)
    if (!RAW_LITERAL_ALLOWLIST.has(node)) {
      if (/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(node)) {
        violations.push({ path, value: node, reason: 'raw color literal (use a token)' })
      }
      if (/var\(--(?!chakra-)/.test(node)) {
        violations.push({ path, value: node, reason: 'reference to a non-chakra CSS variable' })
      }
    }
    return
  }
  if (Array.isArray(node)) {
    node.forEach((item, i) => walk(item, `${path}[${i}]`, colorProp, violations, slotNames, tokenCategory))
    return
  }
  if (typeof node !== 'object' || node === null) return

  for (const [key, value] of Object.entries(node)) {
    const childPath = `${path}.${key}`
    if (COLOR_PROPS.has(key)) {
      // Direct value or conditional/responsive map of a color prop
      walk(value, childPath, true, violations, slotNames)
    } else if (colorProp) {
      // Inside a conditional map of a color prop: keys must be registered conditions
      if (!isValidConditionalKey(key)) {
        violations.push({ path: childPath, value: key, reason: 'unknown condition or breakpoint key' })
      }
      walk(value, childPath, true, violations, slotNames)
    } else {
      if (system.isValidProperty(key) && typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Conditional/responsive map of a non-color style prop. Slot names are
        // exempt: variant value names can collide with CSS properties (e.g. a
        // 'content' variant), which would make slot keys look like conditions.
        for (const conditionKey of Object.keys(value)) {
          if (
            !isValidConditionalKey(conditionKey) &&
            !system.isValidProperty(conditionKey) &&
            !slotNames.has(conditionKey)
          ) {
            violations.push({
              path: `${childPath}.${conditionKey}`,
              value: conditionKey,
              reason: 'unknown condition or breakpoint key',
            })
          }
        }
      }
      // Direct value of a token prop, or a conditional/responsive map of one
      const childCategory =
        TOKEN_PROPS[key] ?? (tokenCategory && isValidConditionalKey(key) ? tokenCategory : undefined)
      walk(value, childPath, false, violations, slotNames, childCategory)
    }
  }
}

const recipeSlotNames = (recipe: unknown): Set<string> => {
  const slots = (recipe as { slots?: readonly string[] })?.slots
  return new Set(Array.isArray(slots) ? slots : [])
}

const formatViolations = (violations: Violation[]) =>
  violations.map((v) => `- ${v.path}: '${v.value}' (${v.reason})`).join('\n')

describe('theme system integrity', () => {
  it('sanity: known tokens resolve through the registry', () => {
    expect(colorTokenExists('bg.panel')).toBe(true)
    expect(colorTokenExists('fg.muted')).toBe(true)
    expect(colorTokenExists('colorPalette.solid')).toBe(true)
    expect(colorTokenExists('nope.does.not.exist')).toBe(false)
  })

  it('sanity: non-color token props are checked against their category', () => {
    const check = (recipe: unknown) => {
      const violations: Violation[] = []
      walk(recipe, 'fixture', false, violations, new Set())
      return violations.map((v) => `${v.path}=${v.value}`)
    }
    expect(check({ base: { fontSize: 'sm', lineHeight: 'short', rounded: 'md', zIndex: 'sidebar' } })).toEqual([])
    expect(
      check({ base: { lineHeight: 1.2, fontSize: '12px', boxShadow: '0 0 0 1px red', fontWeight: 'bold' } })
    ).toEqual([])
    expect(check({ base: { lineHeight: 'xs', rounded: { base: 'md', md: 'huge' }, zIndex: 'nope' } })).toEqual([
      'fixture.base.lineHeight=xs',
      'fixture.base.rounded.md=huge',
      'fixture.base.zIndex=nope',
    ])
  })

  it.each(Object.entries(ALL_RECIPES))('recipe "%s" only references existing tokens and conditions', (name, recipe) => {
    const violations: Violation[] = []
    walk(recipe, name, false, violations, recipeSlotNames(recipe))
    expect(violations, `\n${formatViolations(violations)}`).toEqual([])
  })

  it('KNOWN_INVALID only lists recipe paths that are still invalid', () => {
    expect([...KNOWN_INVALID].filter((path) => !confirmedInvalid.has(path))).toEqual([])
  })

  it.each([
    ['stock', system],
    ['branded', BRANDED],
  ])('semantic tokens only reference tokens that exist (%s system)', (_name, sys) => {
    const violations: Violation[] = []
    const visit = (node: unknown, path: string) => {
      if (typeof node === 'string') {
        // `{colors.white/30}` names `colors.white` at 30 % opacity.
        for (const match of node.matchAll(/\{([\w.-]+)(?:\/\d+)?\}/g)) {
          if (sys.tokens.getByName(match[1]) === undefined) {
            violations.push({ path, value: match[1], reason: 'referenced token not found' })
          }
        }
        return
      }
      if (typeof node === 'object' && node !== null) {
        for (const [key, value] of Object.entries(node)) visit(value, `${path}.${key}`)
      }
    }
    visit(semanticTokens, 'semanticTokens')
    // The generated brand slots are not part of the static semantic map; check them here.
    for (const slot of [...PALETTE_SLOTS, 'solidHover', 'solidEdge']) {
      visit(sys.tokens.getByName(`colors.brand.${slot}`)?.extensions?.conditions, `brand.${slot}`)
    }
    for (const slot of ['fg', 'fg.hover', 'solid', 'solidHover', 'solidEdge', 'contrast', 'border', 'subtle']) {
      visit(sys.tokens.getByName(`colors.accent.${slot}`)?.extensions?.conditions, `accent.${slot}`)
    }
    expect(violations, `\n${formatViolations(violations)}`).toEqual([])
  })

  // The generated palette has to be slot-complete, not just dangling-free: a
  // missing slot fails silently (chakra's outline recipes `var()`-fallback to
  // `muted`), so compare against the slots chakra defines for its own palettes.
  it.each([
    ['stock', system],
    ['branded', BRANDED],
  ])('brand defines every slot chakra defines for its own palettes (%s system)', (_name, sys) => {
    const chakraSlots = Object.keys(defaultConfig.theme?.semanticTokens?.colors?.gray ?? {})
    expect(chakraSlots.length).toBeGreaterThan(0)
    const missing = chakraSlots.filter((slot) => !colorTokenExists(`brand.${slot}`, sys))
    expect(missing, `brand is missing chakra palette slots: ${missing.join(', ')}`).toEqual([])
  })
})

describe('PRIMARY_COLOR-driven system', () => {
  const conditions = (sys: typeof system, name: string) =>
    sys.tokens.getByName(`colors.${name}`)?.extensions?.conditions as Record<string, string> | undefined

  it('uses Fil blue when no color is configured, with its light and dark values pinned', () => {
    expect(system.tokens.getByName('colors.brand.500')?.value).toBe('#1d62e9')
    expect(system._config.globalCss?.html).toMatchObject({ colorPalette: 'brand' })
    expect(conditions(system, 'brand.solid')?._light).toBe('{colors.brand.500}')
    expect(conditions(system, 'brand.contrast')?._light).toBe('#ffffff')
    expect(conditions(system, 'brand.fg')?._light).toBe('{colors.brand.500}')
    expect(conditions(system, 'brand.subtle')?._light).toBe('#f0f5ff')
    expect(conditions(system, 'brand.focusRing')?._light).toBe('{colors.brand.500}')
    expect(conditions(system, 'brand.solidHover')?._light).toBe('#1554cf')
    expect(conditions(system, 'accent.fg.hover')?._light).toBe('#1554cf')
    expect(conditions(system, 'brand.solid')?._dark).toBe('{colors.brand.500}')
    expect(conditions(system, 'brand.contrast')?._dark).toBe('#ffffff')
    expect(conditions(system, 'brand.fg')?._dark).toBe('#6a99f1')
    expect(conditions(system, 'brand.subtle')?._dark).toBe('rgb(29 98 233 / 0.12)')
    expect(conditions(system, 'brand.solidHover')?._dark).toBe('#2d6deb')
    expect(conditions(system, 'accent.fg.hover')?._dark).toBe('#96b8f7')
  })

  it('leaves a configured brand its generated dark slots', () => {
    expect(conditions(BRANDED, 'brand.solidHover')?._dark).toBe(solidHoverColor('#1a73e8'))
    expect(conditions(BRANDED, 'accent.fg.hover')?._dark).toBe('color-mix(in oklab, {colors.brand.fg} 70%, white)')
    expect(conditions(BRANDED, 'brand.fg')?._dark).not.toBe('#6a99f1')
    expect(conditions(BRANDED, 'brand.subtle')?._dark).toBe('{colors.brand.900}')
  })

  it('generates the brand scale and slots from the configured color and makes brand the global palette', () => {
    expect(BRANDED.tokens.getByName('colors.brand.500')?.value).toBe('#1a73e8')
    expect(BRANDED._config.globalCss?.html).toMatchObject({ colorPalette: 'brand' })
    for (const step of [50, 100, 200, 300, 400, 600, 700, 800, 900, 950]) {
      expect(colorTokenExists(`brand.${step}`, BRANDED), `brand.${step}`).toBe(true)
    }
    expect(conditions(BRANDED, 'brand.solid')).toEqual({ _light: '{colors.brand.500}', _dark: '{colors.brand.500}' })
    expect(conditions(BRANDED, 'brand.contrast')).toEqual({ _light: '#ffffff', _dark: '#ffffff' })
    expect(conditions(BRANDED, 'brand.fg')).toEqual({ _light: '{colors.brand.700}', _dark: '{colors.brand.300}' })
  })

  // Chakra's own gray.focusRing is gray.400, under the 3:1 WCAG asks of focus indicators on white.
  // Neutral components (`colorPalette='gray'`) draw their focus ring with it, so it is locked against the real
  // page backgrounds.
  it('keeps the stock focus ring at 3:1 or better on the page in both modes', () => {
    const ring = conditions(system, 'gray.focusRing')
    const resolve = (ref: string) => system.tokens.getByName(ref.replace(/^\{|\}$/g, ''))?.value as string
    expect(ring).toEqual({ _light: '{colors.gray.800}', _dark: '{colors.gray.400}' })
    expect(contrastRatio(resolve(ring!._light), PAGE_BACKGROUNDS.light)).toBeGreaterThanOrEqual(3)
    expect(minContrast(resolve(ring!._dark), PAGE_BACKGROUNDS.dark)).toBeGreaterThanOrEqual(3)
  })

  it("keeps chakra's other gray semantic slots when overriding the focus ring", () => {
    for (const slot of ['solid', 'fg', 'muted', 'subtle', 'emphasized', 'contrast', 'border']) {
      expect(colorTokenExists(`gray.${slot}`), `gray.${slot}`).toBe(true)
    }
  })

  // A recipe that moves from `colorPalette.solid` to `accent.solid` must paint the same, with and without a brand.
  it.each([
    ['stock', system, 'brand'],
    ['branded', BRANDED, 'brand'],
  ] as const)(
    'aliases the accent steps to the palette colorPalette falls back to (%s system)',
    (_name, sys, palette) => {
      expect(conditions(sys, 'accent.solid')).toEqual({ base: `{colors.${palette}.solid}` })
      expect(conditions(sys, 'accent.solidHover')).toEqual({ base: `{colors.${palette}.solidHover}` })
      expect(conditions(sys, 'accent.solidEdge')).toEqual({ base: `{colors.${palette}.solidEdge}` })
      // Without a PRIMARY_COLOR the light hover is Fil's pinned value; a brand colour gets the palette's hover fill.
      expect(conditions(sys, 'brand.solidHover')?._light).toBe(sys === system ? '#1554cf' : solidHoverColor('#1a73e8'))
      expect(conditions(sys, 'accent.contrast')).toEqual({ base: `{colors.${palette}.contrast}` })
      expect(conditions(sys, 'accent.border')).toEqual({ base: `{colors.${palette}.border}` })
      expect(conditions(sys, 'accent.subtle')).toEqual({ base: `{colors.${palette}.subtle}` })
    }
  )

  it('leaves dark-mode surfaces on the neutral grey scales rather than tinting them', () => {
    expect(conditions(BRANDED, 'bg')).toEqual({ _light: '{colors.white}', _dark: '{colors.gray.950}' })
    expect(BRANDED.tokens.getByName('colors.gray.950')?.value).toBe('#0a0a0a')
  })

  it('treats an invalid color as unset', () => {
    const sys = createAppSystem('not-a-color')
    expect(sys.tokens.getByName('colors.brand.500')?.value).toBe('#1d62e9')
    expect(sys._config.globalCss?.html).toMatchObject({ colorPalette: 'brand' })
  })

  it('memoizes systems per normalized color', () => {
    expect(getAppSystem()).toBe(system)
    expect(getAppSystem(undefined)).toBe(system)
    expect(getAppSystem('not-a-color')).toBe(system)
    expect(getAppSystem('#1A73E8')).toBe(getAppSystem('1a73e8'))
    expect(getAppSystem('#1a73e8')).not.toBe(system)
  })

  // The stock colour is Fil's pinned system, not a generated one: an organisation that picks it gets the same system.
  it('returns the stock system for the stock colour, whichever source names it', () => {
    expect(getAppSystem('#1d62e9')).toBe(system)
    expect(getAppSystem('#1D62E9', '#0a0b0c')).toBe(system)
    expect(getAppSystem(undefined, '#1d62e9')).toBe(system)
  })

  // Organisation colours are open-ended on the server: 32 coloured systems at most, and the stock one outside them.
  it('keeps at most 32 coloured systems and never evicts the stock one', () => {
    const colour = (i: number) => `#0101${i.toString(16).padStart(2, '0')}`
    const first = getAppSystem(colour(1))
    for (let i = 2; i <= 33; i++) getAppSystem(colour(i))
    expect(getAppSystem(colour(33))).toBe(getAppSystem(colour(33)))
    expect(getAppSystem(colour(1))).not.toBe(first)
    expect(getAppSystem()).toBe(system)
  }, 30000)

  // The deployment's PRIMARY_COLOR is on every page, so a burst of branded votes must not rebuild it on the SSR thread.
  it('never evicts the deployment colour', () => {
    const colour = (i: number) => `#0202${i.toString(16).padStart(2, '0')}`
    const deployment = getAppSystem(undefined, '#0a0b0c')
    expect(getAppSystem('#0A0B0C', '#0a0b0c')).toBe(deployment)
    const early = getAppSystem(colour(1), '#0a0b0c')
    for (let i = 2; i <= 40; i++) getAppSystem(colour(i), '#0a0b0c')
    expect(getAppSystem(colour(1), '#0a0b0c')).not.toBe(early)
    expect(getAppSystem(undefined, '#0a0b0c')).toBe(deployment)
    expect(getAppSystem()).toBe(system)
  }, 30000)

  // A branded vote's colour is the organisation's, not a curated deployment one: palette.test.ts checks the maths on
  // 124 colours, this checks that the built system wires those values.
  it.each(['#fff59d', '#0b1a3a', '#df5020'])(
    'keeps an organisation colour (%s) exact and readable in the built system',
    (color) => {
      const sys = createAppSystem(color)
      const light = (name: string) => {
        const value = conditions(sys, name)!._light
        return value.startsWith('{') ? (sys.tokens.getByName(value.slice(1, -1))?.value as string) : value
      }
      expect(light('brand.solid')).toBe(color)
      expect(conditions(sys, 'brand.solidEdge')?._light).toBe(
        contrastRatio(color, PAGE_BACKGROUNDS.light) < 3 ? '{colors.border.emphasized}' : 'transparent'
      )
      expect(contrastRatio(light('brand.focusRing'), PAGE_BACKGROUNDS.light)).toBeGreaterThanOrEqual(3)
      expect(contrastRatio(light('brand.solid'), light('brand.contrast'))).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(light('brand.solidHover'), light('brand.contrast'))).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(light('brand.fg'), light('brand.subtle'))).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(light('accent.fg.hover'), PAGE_BACKGROUNDS.light)).toBeGreaterThanOrEqual(4.5)
    }
  )

  it('takes the hover fill from the palette, lightening it when a black label needs that', () => {
    const sys = createAppSystem('#df5020')
    expect(conditions(sys, 'brand.solid')?._light).toBe('{colors.brand.500}')
    expect(conditions(sys, 'brand.solidHover')?._light).toBe(solidHoverColor('#df5020'))
  })

  // The summary page keeps a dark card in light mode, so the dark scope paints the organisation colour too: the same
  // exact fill and the same hover as the light page, its label readable on both.
  it('fills and hovers with the exact colour in the dark scope too', () => {
    const sys = createAppSystem('#ed0630')
    expect(conditions(sys, 'brand.solid')).toEqual({ _light: '{colors.brand.500}', _dark: '{colors.brand.500}' })
    const hover = conditions(sys, 'brand.solidHover')!._dark
    expect(hover).toBe(solidHoverColor('#ed0630'))
    expect(contrastRatio(hover, conditions(sys, 'brand.contrast')!._dark)).toBeGreaterThanOrEqual(4.5)
  })

  it('labels a pale organisation colour in ink and edges it on the light page', () => {
    const sys = createAppSystem('#f5d90a')
    expect(conditions(sys, 'brand.contrast')).toEqual({ _light: INK, _dark: INK })
    expect(conditions(sys, 'brand.solidEdge')).toEqual({ _light: '{colors.border.emphasized}', _dark: 'transparent' })
  })
})

// Every brand and accent token of the stock system (no PRIMARY_COLOR) as it was before fills took the exact colour
// (dumped from 9524b1ca7, dark values as Fil's dark mode pins them). Fil's blue must not move by a single value; the
// edge it gained draws nothing.
const STOCK_BRAND_TOKENS: Record<string, string | Record<string, string>> = {
  'colors.brand.50': '#f3f8ff',
  'colors.brand.100': '#e8f0ff',
  'colors.brand.200': '#d1e2fe',
  'colors.brand.300': '#a5c4fb',
  'colors.brand.400': '#6395f4',
  'colors.brand.500': '#1d62e9',
  'colors.brand.600': '#154dbc',
  'colors.brand.700': '#0e3a90',
  'colors.brand.800': '#072767',
  'colors.brand.900': '#031641',
  'colors.brand.950': '#01061e',
  'colors.accent.solid': { base: '{colors.brand.solid}' },
  'colors.accent.solidHover': { base: '{colors.brand.solidHover}' },
  'colors.accent.contrast': { base: '{colors.brand.contrast}' },
  'colors.accent.subtle': { base: '{colors.brand.subtle}' },
  'colors.brand.solid': { _light: '{colors.brand.500}', _dark: '{colors.brand.500}' },
  'colors.brand.solidHover': { _light: '#1554cf', _dark: '#2d6deb' },
  'colors.brand.contrast': { _light: '#ffffff', _dark: '#ffffff' },
  'colors.brand.fg': { _light: '{colors.brand.500}', _dark: '#6a99f1' },
  'colors.brand.muted': { _light: '{colors.brand.200}', _dark: '{colors.brand.800}' },
  'colors.brand.subtle': { _light: '#f0f5ff', _dark: 'rgb(29 98 233 / 0.12)' },
  'colors.brand.emphasized': { _light: '{colors.brand.300}', _dark: '{colors.brand.700}' },
  'colors.brand.focusRing': { _light: '{colors.brand.500}', _dark: '#6a99f1' },
  'colors.brand.border': { _light: '{colors.brand.500}', _dark: '{colors.brand.500}' },
  'colors.accent.fg': { _light: '{colors.brand.fg}', _dark: '{colors.brand.fg}' },
  'colors.accent.fg.hover': { _light: '#1554cf', _dark: '#96b8f7' },
}

describe('stock brand tokens', () => {
  const current = (name: string) => {
    const token = system.tokens.getByName(name)
    return (token?.extensions?.conditions as Record<string, string> | undefined) ?? token?.value
  }

  it.each(Object.keys(STOCK_BRAND_TOKENS))('keeps %s at its value', (name) => {
    expect(current(name)).toEqual(STOCK_BRAND_TOKENS[name])
  })

  it('draws no edge on a Fil fill, in either scope', () => {
    expect(current('colors.brand.solidEdge')).toEqual({ _light: 'transparent', _dark: 'transparent' })
    expect(current('colors.accent.solidEdge')).toEqual({ base: '{colors.brand.solidEdge}' })
  })
})

// Roles Fil gives their own value, split from the step they used to alias.
describe('Fil roles', () => {
  const base = (name: string) => system.tokens.getByName(name)?.extensions?.conditions

  it('give the faint text and strong border steps their own grey', () => {
    expect(base('colors.fg.faint')).toEqual({ _light: '{colors.gray.400}', _dark: '{colors.carbon.500}' })
    expect(base('colors.border.strong')).toEqual({ _light: '{colors.gray.400}', _dark: '{colors.carbon.500}' })
  })

  it('draws depth as a 1px ring, with no blur or offset', () => {
    const ring = { base: '0 0 0 1px {colors.border.emphasized}' }
    for (const name of [
      'control',
      'raised',
      'raised.popover',
      'raised.tooltip',
      'overlay',
      'floating',
      'floating.panel',
    ]) {
      const token = system.tokens.getByName(`shadows.shadow.${name}`)
      expect(JSON.stringify(token?.extensions?.conditions), name).toMatch(/\{shadows\.|border\.emphasized/)
    }
    for (const size of ['xs', 'sm', 'md', 'lg', 'xl', '2xl']) {
      expect(base(`shadows.${size}`), size).toEqual(ring)
    }
    expect(base('shadows.shadow.control')).toEqual(ring)
    expect(base('shadows.shadow.card')).toEqual({ base: 'none' })
  })

  it("maps Chakra's semantic radii onto Fil's scale", () => {
    expect(base('radii.l1')).toEqual({ base: '{radii.sm}' })
    expect(base('radii.l2')).toEqual({ base: '{radii.md}' })
    expect(base('radii.l3')).toEqual({ base: '{radii.md}' })
    expect(system.token('radii.xs')).toBe('3px')
    expect(system.token('radii.md')).toBe('6px')
    expect(system.token('radii.xl')).toBe('12px')
  })
})

describe('layout tokens', () => {
  const value = (name: string) => system.tokens.getByName(name)?.value

  it('keeps the app layers and the page widths at the values the layouts used', () => {
    expect(value('zIndex.public-header')).toBe(30)
    expect(value('zIndex.dashboard-menu')).toBe(100)
    expect(value('sizes.content.wide')).toBe('1600px')
    expect(value('sizes.content.medium')).toBe('1200px')
  })

  it('keeps the dashboard shell sizes', () => {
    expect(value('sizes.dashboard.menu.expanded')).toBe('240px')
    expect(value('sizes.dashboard.menu.collapsed')).toBe('48px')
    expect(value('sizes.dashboard.header')).toBe('47px')
    expect(value('sizes.dashboard.topbar')).toBe('52px')
    expect(value('sizes.dashboard.drawer')).toBe('296px')
    expect(value('sizes.dashboard.panel')).toBe('350px')
  })

  it('resolves the chakra names the layouts rely on to their literal values', () => {
    expect(value('zIndex.docked')).toBe(10)
    expect(value('zIndex.modal')).toBe(1400)
    expect(value('durations.fast')).toBe('150ms')
    expect(value('durations.moderate')).toBe('200ms')
    expect(value('durations.slow')).toBe('300ms')
  })
})

// The voter page (docs/ui-guidelines.md, "Voter page"): the measures of boards V4Voter* and M4Voter*.
describe('voter tokens', () => {
  const value = (name: string) => system.tokens.getByName(name)?.value
  const base = (name: string) => system.tokens.getByName(name)?.extensions?.conditions

  it('sizes the voter controls, marks and columns as the boards', () => {
    expect(value('sizes.control.ballot')).toBe('52px')
    expect(value('sizes.mark.ballot')).toBe('22px')
    expect(value('sizes.bar.thin')).toBe('3px')
    expect(value('sizes.ballot.column')).toBe('600px')
    expect(value('sizes.ballot.column.narrow')).toBe('440px')
    expect(value('sizes.ballot.column.code')).toBe('480px')
    expect(value('sizes.ballot.column.sending')).toBe('520px')
    expect(value('sizes.ballot.column.results')).toBe('640px')
    expect(value('sizes.ballot.rail')).toBe('280px')
    expect(value('sizes.ballot.logo')).toBe('30px')
    expect(value('sizes.ballot.symbol')).toBe('22px')
    expect(value('sizes.ballot.credit')).toBe('38px')
    expect(value('sizes.wordmark.credit')).toBe('13px')
  })

  it('draws a one-time code box 56 by 64, 48 by 58 below md', () => {
    expect(value('sizes.ballot.code.width')).toBe('var(--chakra-sizes-14)')
    expect(value('sizes.ballot.code.height')).toBe('var(--chakra-sizes-16)')
    expect(value('sizes.ballot.code.width.touch')).toBe('var(--chakra-sizes-12)')
    expect(value('sizes.ballot.code.height.touch')).toBe('58px')
    expect(system.token('sizes.14')).toBe('3.5rem')
    expect(system.token('sizes.16')).toBe('4rem')
    expect(system.token('sizes.12')).toBe('3rem')
  })

  it('keeps the wordmark width under its own name now that it has a child', () => {
    expect(value('sizes.wordmark')).toBe('125px')
    expect(system.css({ w: 'wordmark' })).toEqual({ width: 'var(--chakra-sizes-wordmark)' })
  })

  it('spaces the voter page as the boards', () => {
    expect(value('spacing.step')).toBe('9px')
    expect(value('spacing.ballot.gutter')).toBe('72px')
    expect(value('spacing.ballot.dock')).toBe('150px')
    expect(value('spacing.ballot.options')).toBe('22px')
  })

  it('rings a mark still to come in the track grey and a failed field in 2px of the error colour', () => {
    expect(base('colors.border.pending')).toEqual({ base: '{colors.bg.track}' })
    expect(base('shadows.shadow.mark')).toEqual({ base: 'inset 0 0 0 {borderWidths.mark} {colors.border.pending}' })
    expect(base('shadows.shadow.invalid')).toEqual({
      base: 'inset 0 0 0 {borderWidths.thick} {colors.status.error.fg}',
    })
  })
})

describe('escape hatch', () => {
  it('unwraps [value] so strictTokens opt-outs reach the CSS as plain values', () => {
    expect(system.css({ lineHeight: '[0]', cursor: '[help]', w: '[calc(100% - {sizes.8})]' })).toEqual({
      lineHeight: '0',
      cursor: 'help',
      width: 'calc(100% - var(--chakra-sizes-8))',
    })
  })

  it('has 0 and auto as tokens, so the common values need no escape', () => {
    const value = (name: string) => system.tokens.getByName(name)?.value
    expect(value('spacing.0')).toBe('0')
    expect(value('spacing.auto')).toBe('auto')
    expect(value('sizes.0')).toBe('0')
    expect(value('sizes.auto')).toBe('auto')
    expect(system.css({ p: '0', h: 'auto', mx: 'auto', minW: '0' })).toEqual({
      padding: 'var(--chakra-spacing-0)',
      height: 'var(--chakra-sizes-auto)',
      marginInline: 'var(--chakra-spacing-auto)',
      minWidth: 'var(--chakra-sizes-0)',
    })
  })

  it('still resolves tokens and leaves other values alone', () => {
    expect(system.css({ p: '4', w: 'full' })).toEqual({
      padding: 'var(--chakra-spacing-4)',
      width: 'var(--chakra-sizes-full)',
    })
  })
})

// A raw token whose dashed name equals a nested semantic path (raw `elevation-rest`, semantic `elevation.rest`)
// shares its CSS variable and white-screens the app at runtime, while lint, typegen and the other tests pass.
type TokenTree = { [key: string]: unknown }

const cssVarOwners = (trees: Record<'raw' | 'semantic', TokenTree | undefined>) => {
  const owners = new Map<string, Set<string>>()
  const dashed = (segment: string) => segment.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()
  const visit = (node: unknown, path: string[], kind: string) => {
    if (typeof node !== 'object' || node === null) return
    if ('value' in node) {
      const name = path.join('.')
      const cssVar = path.map(dashed).join('-')
      owners.set(cssVar, (owners.get(cssVar) ?? new Set()).add(`${kind} ${name}`))
    }
    for (const [key, child] of Object.entries(node)) {
      if (key !== 'value') visit(child, key === 'DEFAULT' ? path : [...path, key], kind)
    }
  }
  visit(trees.raw, [], 'raw')
  visit(trees.semantic, [], 'semantic')
  return [...owners.values()].map((names) => [...names]).filter(isCollision)
}

// A raw and a semantic token under the same dotted name are an override, not a collision.
const isCollision = (names: string[]) => {
  const dotted = new Set(names.map((name) => name.split(' ')[1]))
  return dotted.size > 1 && names.some((name) => name.startsWith('raw '))
}

describe('token names', () => {
  it('catches a raw token named like a nested semantic path', () => {
    const raw = { shadows: { 'elevation-rest': { value: '0 1px 2px black' } } }
    const semantic = { shadows: { elevation: { rest: { value: '{shadows.sm}' } } } }
    expect(cssVarOwners({ raw, semantic })).toEqual([['raw shadows.elevation-rest', 'semantic shadows.elevation.rest']])
  })

  it.each([
    ['stock', system],
    ['branded', BRANDED],
  ])('gives every raw token a CSS variable no semantic token shares (%s system)', (_name, sys) => {
    const { tokens, semanticTokens: semantic } = sys._config.theme ?? {}
    expect(cssVarOwners({ raw: tokens as TokenTree, semantic: semantic as TokenTree })).toEqual([])
  })
})

// Custom properties inherit, so a palette without its own slots would read brand's hover and edge from <html>.
describe('palettes other than brand', () => {
  it.each(['gray', 'red', 'green', 'danger', 'success', 'warning', 'info'])(
    'gives %s its own hover and no edge',
    (name) => {
      const sys = createAppSystem('#f5d90a')
      const vars = sys.css({ colorPalette: name } as never) as Record<string, string>
      expect(vars['--chakra-colors-color-palette-solid-hover']).toBe(`var(--chakra-colors-${name}-solid-hover)`)
      expect(vars['--chakra-colors-color-palette-solid-edge']).toBe(`var(--chakra-colors-${name}-solid-edge)`)
      expect(sys.tokens.getByName(`colors.${name}.solidEdge`)?.value).toBe('transparent')
    }
  )
})

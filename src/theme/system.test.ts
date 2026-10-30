import { defaultConfig } from '@chakra-ui/react'
import { describe, expect, it } from 'vitest'
import { PAGE_BACKGROUNDS } from './colors'
import { contrastRatio, PALETTE_SLOTS } from './palette'
import { recipes, slotRecipes } from './recipes'
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

// Recipe paths whose non-color token is known to be dangling, pending their fix.
const KNOWN_INVALID = new Set<string>([])

const ALL_RECIPES: Record<string, unknown> = { ...recipes, ...slotRecipes }

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
  if (KNOWN_INVALID.has(path) || CSS_KEYWORDS.has(value) || TOKEN_PROP_KEYWORDS.has(value)) return
  // Numbers, lengths and composite values (`0 0 0 1px …`) are not token references
  if (!/^[a-zA-Z][\w-]*(\.[\w-]+)*$/.test(value)) return
  if (system.tokens.getByName(`${category}.${value}`) === undefined) {
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
    expect(colorTokenExists('card.plan.bg')).toBe(true)
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

  it.each([
    ['stock', system],
    ['branded', BRANDED],
  ])('semantic tokens only reference tokens that exist (%s system)', (_name, sys) => {
    const violations: Violation[] = []
    const visit = (node: unknown, path: string) => {
      if (typeof node === 'string') {
        for (const match of node.matchAll(/\{([\w.-]+)\}/g)) {
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
    for (const slot of PALETTE_SLOTS) {
      visit(sys.tokens.getByName(`colors.brand.${slot}`)?.extensions?.conditions, `brand.${slot}`)
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

  it('keeps the stock look when no color is configured: gray palette, black brand', () => {
    expect(system.tokens.getByName('colors.brand.500')?.value).toBe('#000000')
    expect(system._config.globalCss?.html).toMatchObject({ colorPalette: 'gray' })
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

  // Chakra's own gray.focusRing is gray.400 (#b2b2b2): 2.12:1 on white, under the
  // 3:1 WCAG asks of focus indicators. The stock theme (no PRIMARY_COLOR) draws
  // every focus ring with it, so it is locked against the real page backgrounds.
  it('keeps the stock focus ring at 3:1 or better on the page in both modes', () => {
    const ring = conditions(system, 'gray.focusRing')
    const resolve = (ref: string) => system.tokens.getByName(ref.replace(/^\{|\}$/g, ''))?.value as string
    expect(ring).toEqual({ _light: '{colors.gray.800}', _dark: '{colors.gray.400}' })
    expect(contrastRatio(resolve(ring!._light), PAGE_BACKGROUNDS.light)).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(resolve(ring!._dark), PAGE_BACKGROUNDS.dark)).toBeGreaterThanOrEqual(3)
  })

  it("keeps chakra's other gray semantic slots when overriding the focus ring", () => {
    for (const slot of ['solid', 'fg', 'muted', 'subtle', 'emphasized', 'contrast', 'border']) {
      expect(colorTokenExists(`gray.${slot}`), `gray.${slot}`).toBe(true)
    }
  })

  it('leaves dark-mode surfaces on the neutral ink scale rather than tinting them', () => {
    expect(conditions(BRANDED, 'bg')).toEqual({ _light: '{colors.white}', _dark: '{colors.ink.650}' })
    expect(BRANDED.tokens.getByName('colors.ink.650')?.value).toBe('#0a0a0a')
  })

  it('treats an invalid color as unset', () => {
    const sys = createAppSystem('not-a-color')
    expect(sys.tokens.getByName('colors.brand.500')?.value).toBe('#000000')
    expect(sys._config.globalCss?.html).toMatchObject({ colorPalette: 'gray' })
  })

  it('memoizes systems per normalized color', () => {
    expect(getAppSystem()).toBe(system)
    expect(getAppSystem(undefined)).toBe(system)
    expect(getAppSystem('#1A73E8')).toBe(getAppSystem('1a73e8'))
    expect(getAppSystem('#1a73e8')).not.toBe(system)
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
    expect(value('sizes.dashboard.menu.expanded')).toBe('255px')
    expect(value('sizes.dashboard.menu.collapsed')).toBe('48px')
    expect(value('sizes.dashboard.header')).toBe('47px')
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

describe('escape hatch', () => {
  it('unwraps [value] so strictTokens opt-outs reach the CSS as plain values', () => {
    expect(system.css({ p: '[0]', mx: '[auto]', w: '[calc(100% - {sizes.8})]' })).toEqual({
      padding: '0',
      marginInline: 'auto',
      width: 'calc(100% - var(--chakra-sizes-8))',
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

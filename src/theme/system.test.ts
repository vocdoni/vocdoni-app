import { defaultConfig } from '@chakra-ui/react'
import { describe, expect, it } from 'vitest'
import { PALETTE_SLOTS } from './palette'
import { resultsProgressRecipe } from './recipes/election'
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
const RAW_LITERAL_ALLOWLIST = new Set<string>([])

const ALL_RECIPES: Record<string, unknown> = { ...recipes, ...slotRecipes, resultsProgress: resultsProgressRecipe }

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

const walk = (node: unknown, path: string, colorProp: boolean, violations: Violation[], slotNames: Set<string>) => {
  if (typeof node === 'string') {
    if (colorProp) checkColorValue(node, path, violations)
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
    node.forEach((item, i) => walk(item, `${path}[${i}]`, colorProp, violations, slotNames))
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
      walk(value, childPath, false, violations, slotNames)
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
    expect(colorTokenExists('card.pricing.bg')).toBe(true)
    expect(colorTokenExists('bg.panel')).toBe(true)
    expect(colorTokenExists('fg.muted')).toBe(true)
    expect(colorTokenExists('colorPalette.solid')).toBe(true)
    expect(colorTokenExists('nope.does.not.exist')).toBe(false)
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

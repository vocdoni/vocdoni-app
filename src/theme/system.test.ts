import { describe, expect, it } from 'vitest'
import { resultsProgressRecipe } from './recipes/election'
import { recipes, slotRecipes } from './recipes'
import semanticTokens from './semantic'
import { system } from './system'

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

const colorTokenExists = (path: string) => system.tokens.getByName(`colors.${path}`) !== undefined

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

  it('semantic tokens only reference tokens that exist', () => {
    const violations: Violation[] = []
    const visit = (node: unknown, path: string) => {
      if (typeof node === 'string') {
        for (const match of node.matchAll(/\{([\w.-]+)\}/g)) {
          if (system.tokens.getByName(match[1]) === undefined) {
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
    expect(violations, `\n${formatViolations(violations)}`).toEqual([])
  })
})

import { createSystem, defaultConfig } from '@chakra-ui/react'
import { describe, expect, it } from 'vitest'
import { createAppSystem, system } from './system'

type Sys = ReturnType<typeof createSystem>
type Mode = 'light' | 'dark'

const BRANDED = createAppSystem('#1a73e8')
const MODES: Mode[] = ['light', 'dark']

// The token a value points at in one mode, or the literal itself
const hop = (sys: Sys, name: string, mode: Mode): string | undefined => {
  const token = sys.tokens.getByName(name)
  if (!token) return undefined
  const conditions = token.extensions?.conditions as Record<string, string> | undefined
  return conditions ? (conditions[`_${mode}`] ?? conditions.base) : token.value
}

// Follows `{…}` references down to raw values; alpha references (`{colors.gray.900/10}`) stay as written.
const resolve = (sys: Sys, name: string, mode: Mode): string | undefined => {
  const value = hop(sys, name, mode)
  return value?.replace(/\{([\w.-]+)\}/g, (ref, path) =>
    sys.tokens.getByName(path) ? (resolve(sys, path, mode) ?? ref) : ref
  )
}

// Each role's first hop per mode: the layer it stands in for, or a literal.
const ROLES: Record<string, Record<Mode, string>> = {
  'colors.surface.canvas': { light: '{colors.bg}', dark: '{colors.bg}' },
  'colors.surface.sidebar': { light: '{colors.dashboardMenu.light}', dark: '{colors.dashboardMenu.dark}' },
  'colors.surface.content': { light: '{colors.bg}', dark: '{colors.bg}' },
  'colors.surface.card': { light: '{colors.bg.panel}', dark: '{colors.bg.panel}' },
  'colors.surface.sunken': { light: '{colors.bg.subtle}', dark: '{colors.whiteAlpha.50}' },
  'colors.surface.raised': { light: '{colors.bg}', dark: '{colors.bg}' },
  'colors.surface.raised.tooltip': { light: '{colors.bg.panel}', dark: '{colors.bg.panel}' },
  'colors.surface.overlay': { light: '{colors.bg.panel}', dark: '{colors.bg.panel}' },
  'colors.surface.overlay.drawer': { light: '{colors.surface.sidebar}', dark: '{colors.surface.sidebar}' },
  'colors.surface.inverse': { light: '{colors.gray.800}', dark: '{colors.gray.800}' },
  'shadows.shadow.card': { light: 'none', dark: 'none' },
  'shadows.shadow.raised': { light: '{shadows.md}', dark: '{shadows.md}' },
  'shadows.shadow.raised.popover': { light: '{shadows.lg}', dark: '{shadows.lg}' },
  'shadows.shadow.raised.tooltip': { light: '{shadows.xs}', dark: '{shadows.xs}' },
  'shadows.shadow.floating': { light: '{shadows.lg}', dark: '{shadows.lg}' },
  'shadows.shadow.floating.panel': { light: '{shadows.xl}', dark: '{shadows.xl}' },
  'shadows.shadow.overlay': { light: '{shadows.lg}', dark: '{shadows.lg}' },
}

// Tokens whose dashed CSS variable is also another token's, the collision that white-screens the app
const cssVarCollisions = (sys: Sys) => {
  const names = new Map<string, Set<string>>()
  for (const token of sys.tokens.allTokens) {
    const cssVar = token.extensions?.cssVar?.var
    // Chakra's negative spacing shares its positive step's variable on purpose
    if (!cssVar || token.name.includes('.-')) continue
    if (!names.has(cssVar)) names.set(cssVar, new Set())
    names.get(cssVar)!.add(token.name)
  }
  return [...names].filter(([, set]) => set.size > 1).map(([cssVar, set]) => `${cssVar}: ${[...set].join(', ')}`)
}

describe.each([
  ['stock', system],
  ['branded', BRANDED],
])('surface and elevation roles (%s system)', (_name, sys) => {
  it.each(Object.entries(ROLES))('%s points at what that layer paints today', (role, expected) => {
    for (const mode of MODES) {
      expect(hop(sys, role, mode), `${role} (${mode})`).toBe(expected[mode])
      expect(resolve(sys, role, mode), `${role} (${mode})`).not.toMatch(/\{(?![\w.-]+\/\d+\})/)
    }
  })

  it('resolves the layers that do not come from a Chakra slot to their raw values', () => {
    expect(resolve(sys, 'colors.surface.sidebar', 'light')).toBe('#fbfbfb')
    expect(resolve(sys, 'colors.surface.sidebar', 'dark')).toBe('#18181b')
    expect(resolve(sys, 'colors.surface.overlay.drawer', 'dark')).toBe('#18181b')
    expect(resolve(sys, 'colors.surface.sunken', 'dark')).toBe(resolve(sys, 'colors.whiteAlpha.50', 'dark'))
    expect(resolve(sys, 'colors.dashboard.menu', 'light')).toBe('#fbfbfb')
  })

  it('has no two tokens sharing a CSS variable', () => {
    expect(cssVarCollisions(sys)).toEqual([])
  })
})

describe('cssVarCollisions', () => {
  it('flags a raw token whose dashed name equals a nested semantic path', () => {
    const colliding = createSystem(defaultConfig, {
      theme: {
        tokens: { colors: { 'elevation-rest': { value: '#000000' } } },
        semanticTokens: { colors: { elevation: { rest: { value: '{colors.white}' } } } },
      },
    })
    expect(cssVarCollisions(colliding)).toEqual([
      '--chakra-colors-elevation-rest: colors.elevation-rest, colors.elevation.rest',
    ])
  })
})

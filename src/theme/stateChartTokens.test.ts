import { describe, expect, it } from 'vitest'
import { Table } from './recipes/table'
import { createAppSystem, system } from './system'

type Mode = 'light' | 'dark'

// Follows `{colors.…}` references down to the raw value for a color mode.
const resolve = (sys: typeof system, name: string, mode: Mode): string => {
  const token = sys.tokens.getByName(`colors.${name}`)
  if (!token) throw new Error(`missing token ${name}`)
  const conditions = (token.extensions as unknown as { conditions?: Record<string, string> }).conditions
  if (!conditions) return String(token.value)
  const ref = conditions[mode === 'dark' ? '_dark' : '_light'] ?? conditions.base
  const match = /^\{colors\.(.+)\}$/.exec(ref)
  return match ? resolve(sys, match[1], mode) : ref
}

const systems = { stock: system, branded: createAppSystem('#1a73e8') }

describe.each(Object.entries(systems))('interaction-state and chart tokens (%s)', (_label, sys) => {
  it.each<[string, string, string]>([
    ['state.hover.bg', 'gray.50', 'bg.muted'],
    ['state.selected.bg', 'rgb(0 0 0 / 0.06)', 'ink.700'],
    ['state.selected.fg', 'gray.900', 'white'],
    ['state.hover.fg', 'gray.900', 'white'],
    ['state.current.bg', 'rgb(0 0 0 / 0.06)', 'gray.800'],
    ['chart.track', 'bg.emphasized', 'bg.emphasized'],
    ['meter.warning', '#875500', 'orange.500'],
    ['meter.critical', '#ca2a30', 'red.600'],
    ['meter.ok', 'gray.solid', 'gray.solid'],
  ])('%s resolves to the value the consumer had before', (token, light, dark) => {
    // A literal (Fil's translucent selection) is compared as written; anything else is a token name.
    const expected = (value: string, mode: Mode) =>
      value.startsWith('rgb') || value.startsWith('#') ? value : resolve(sys, value, mode)
    expect(resolve(sys, token, 'light')).toBe(expected(light, 'light'))
    expect(resolve(sys, token, 'dark')).toBe(expected(dark, 'dark'))
  })

  it('keeps the first two chart colors on the usage-meter hues', () => {
    const hues = ['blue', 'purple']
    hues.forEach((hue, index) => {
      for (const mode of ['light', 'dark'] as const) {
        expect(resolve(sys, `chart.${index + 1}`, mode)).toBe(resolve(sys, `${hue}.600`, mode))
        expect(resolve(sys, `chart.${index + 1}.icon`, mode)).toBe(resolve(sys, `${hue}.500`, mode))
      }
    })
  })

  it('defines eight distinct categorical colors', () => {
    const fills = Array.from({ length: 8 }, (_, i) => resolve(sys, `chart.${i + 1}`, 'light'))
    expect(new Set(fills).size).toBe(8)
  })

  it('defines the pressed pair', () => {
    expect(sys.tokens.getByName('colors.state.pressed.bg')).toBeDefined()
    expect(sys.tokens.getByName('colors.state.pressed.fg')).toBeDefined()
  })
})

describe('table row states', () => {
  it('are an opt-in variant reading the state tokens, absent from the base style', () => {
    expect(JSON.stringify(Table.base)).not.toContain('state.')
    const row = (Table.variants as unknown as { rowStates: { true: { row: Record<string, Record<string, string>> } } })
      .rowStates.true.row
    expect(row._hover.bg).toBe('state.hover.bg')
    // A selected row is a choice, so it takes the accent tint rather than the "where you are" tone.
    expect(row._selected.bg).toBe('accent.subtle')
  })
})

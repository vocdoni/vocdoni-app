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
    ['state.hover.bg', 'bg.muted', 'bg.muted'],
    ['state.selected.bg', 'gray.100', 'ink.700'],
    ['state.selected.fg', 'black', 'white'],
    ['state.hover.fg', 'black', 'white'],
    ['state.current.bg', 'gray.200', 'gray.800'],
    ['chart.track', 'bg.emphasized', 'bg.emphasized'],
    ['meter.warning', 'orange.600', 'orange.500'],
    ['meter.critical', 'red.600', 'red.600'],
    ['meter.ok', 'blue.600', 'blue.600'],
  ])('%s resolves to the value the consumer had before', (token, light, dark) => {
    expect(resolve(sys, token, 'light')).toBe(resolve(sys, light, 'light'))
    expect(resolve(sys, token, 'dark')).toBe(resolve(sys, dark, 'dark'))
  })

  it('keeps the first four chart colors on the usage-meter hues', () => {
    const hues = ['blue', 'purple', 'green', 'cyan']
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
    expect(row._selected.bg).toBe('state.selected.bg')
    expect(row._selected.color).toBe('state.selected.fg')
  })
})

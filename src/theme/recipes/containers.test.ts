import { describe, expect, it } from 'vitest'
import { system } from '../system'

// The declarations a slot gets from the recipe layer.
const layer = (styles: unknown) => (styles as Record<string, Record<string, unknown>>)['@layer recipes']
const text = (styles: unknown) => JSON.stringify(layer(styles))

describe('Fil container recipes', () => {
  it('draws status as a dot and a word, with no fill', () => {
    const status = system.sva(system.getSlotRecipe('status'))
    const live = status({ size: 'sm', tone: 'success' })
    expect(layer(live.root)).toMatchObject({ color: 'var(--chakra-colors-status-success-fg)', lineHeight: '1.25rem' })
    expect(layer(live.indicator)).toMatchObject({
      width: 'var(--chakra-sizes-dot)',
      height: 'var(--chakra-sizes-dot)',
    })
    expect(text(live.root)).not.toContain('background')
  })

  it('outlines tags without a fill and dashes the proposal look', () => {
    const tag = system.sva(system.getSlotRecipe('tag'))
    expect(layer(tag({ variant: 'solid' }).root)).toMatchObject({ background: 'var(--chakra-colors-transparent)' })
    expect(layer(tag({ variant: 'proposal' }).root)).toMatchObject({ borderStyle: 'dashed' })
  })

  it('tints only warning and error alerts', () => {
    const alert = system.sva(system.getSlotRecipe('alert'))
    expect(text(alert({ status: 'error' }).root)).toContain('--chakra-colors-status-error-bg')
    expect(text(alert({ status: 'success' }).root)).not.toContain('status-success-bg')
    expect(text(alert({ status: 'success' }).root)).toContain('--chakra-colors-bg-subtle')
  })

  it('puts a 2px accent line (the text blue in dark) on the left of a selected table row', () => {
    const table = system.sva(system.getSlotRecipe('table'))
    expect(text(table().row)).toContain('inset 2px 0 0 var(--chakra-colors-accent-line)')
  })

  it('underlines the current tab in ink and makes the line look the default', () => {
    const tabs = system.sva(system.getSlotRecipe('tabs'))
    expect(text(tabs().trigger)).toContain('"--indicator-color":"var(--chakra-colors-fg)"')
  })
})

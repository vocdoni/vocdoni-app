import { describe, expect, it } from 'vitest'
import { system } from '../system'

// The declarations a recipe layer ends up with, as text so a nested selector can be searched.
const layer = (styles: unknown) => (styles as Record<string, Record<string, unknown>>)['@layer recipes']
const text = (styles: unknown) => JSON.stringify(layer(styles))

describe('votes theme additions', () => {
  it('has an ink tone and a hollow one for the status dot', () => {
    const status = system.sva(system.getSlotRecipe('status'))
    const ink = status({ tone: 'ink' })
    expect(layer(ink.root)).toMatchObject({ color: 'var(--chakra-colors-fg)' })
    expect(layer(ink.indicator)).toMatchObject({ background: 'var(--chakra-colors-fg)' })

    const hollow = status({ tone: 'hollow' })
    expect(layer(hollow.indicator)).toMatchObject({ background: 'var(--chakra-colors-transparent)' })
    expect(text(hollow.indicator)).toContain('inset 0 0 0')
  })

  it('sets the headline figure on the hero stat size', () => {
    const stat = system.sva(system.getSlotRecipe('stat'))
    const hero = stat({ size: 'hero' })
    expect(text(hero.valueText)).toContain('figure-hero')
    expect(text(hero.valueUnit)).toContain('--chakra-letter-spacings-figure-unit')
  })

  it('resolves the figure-hero text style from its tokens', () => {
    const css = JSON.stringify(system.css({ textStyle: 'figure-hero' }))
    expect(css).toContain('--chakra-font-sizes-figure-hero')
    expect(css).toContain('--chakra-line-heights-hero')
    expect(css).toContain('--chakra-letter-spacings-figure-hero')
  })

  it('paints a pressed chip with the selected state', () => {
    const button = system.cva(system.getRecipe('button'))
    expect(text(button({ variant: 'chip' }))).toContain('--chakra-colors-state-selected-bg')
  })

  it('marks the current card row with an accent rule and has a dashed note card', () => {
    const card = system.sva(system.getSlotRecipe('card'))
    expect(text(card().body)).toContain('data-current')
    expect(text(card().body)).toContain('accent-solid')
    expect(layer(card({ variant: 'note' }).root)).toMatchObject({ borderStyle: 'dashed' })
  })

  it('makes the key hint the default kbd look', () => {
    const kbd = system.cva(system.getRecipe('kbd'))
    expect(text(kbd())).toBe(text(kbd({ variant: 'hint' })))
    expect(text(kbd())).toContain('--chakra-shadows-shadow-control')
  })

  it('splits the facts rows with the muted border', () => {
    const dataList = system.sva(system.getSlotRecipe('dataList'))
    expect(text(dataList({ variant: 'facts' }).item)).toContain('--chakra-colors-border-muted')
  })

  it('keeps the ruler marker on the scale in the accent colour', () => {
    const ruler = system.sva(system.getSlotRecipe('censusRuler'))
    expect(text(ruler().marker)).toContain('--chakra-colors-accent-fg')
  })
})

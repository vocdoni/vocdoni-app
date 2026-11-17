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

  it('resolves the turnout headline and its line from their tokens', () => {
    const headline = JSON.stringify(system.css({ textStyle: 'turnout-headline' }))
    expect(headline).toContain('--chakra-font-sizes-headline')
    expect(headline).toContain('--chakra-line-heights-headline')
    expect(system.token('fontSizes.headline')).toBe('2.125rem')
    const line = JSON.stringify(system.css({ textStyle: 'turnout-line' }))
    expect(line).toContain('--chakra-letter-spacings-heading-line')
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

  it('splits the facts rows with the muted border', () => {
    const dataList = system.sva(system.getSlotRecipe('dataList'))
    expect(text(dataList({ variant: 'ruled' }).item)).toContain('--chakra-colors-border-muted')
  })

  it('draws a closed ruler in ink', () => {
    const ruler = system.sva(system.getSlotRecipe('censusRuler'))
    expect(text(ruler({ closed: true }).range)).toContain('--chakra-colors-fg')
  })
})

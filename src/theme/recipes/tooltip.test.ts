import { describe, expect, it } from 'vitest'
import { system } from '../system'

// The declarations a slot gets from the recipe layer, keyed by selector.
const layer = (styles: unknown) => (styles as Record<string, Record<string, unknown>>)['@layer recipes']
const tooltip = system.sva(system.getSlotRecipe('tooltip'))
const content = layer(tooltip({}).content)

describe('tooltip', () => {
  it('paints the box and the arrow from one background variable in both modes', () => {
    expect(content['--tooltip-bg']).toBe('var(--chakra-colors-bg-inverted)')
    expect(content.background).toBe('var(--tooltip-bg)')
  })

  it('sets the dark raised grey on the variable the arrow reads, not on the box alone', () => {
    const dark = Object.entries(content).find(([selector]) => selector.includes('dark'))?.[1]
    expect(dark).toMatchObject({ '--tooltip-bg': 'var(--chakra-colors-surface-raised)' })
    expect(dark).not.toHaveProperty('background')
    expect(dark).not.toHaveProperty('bg')
  })
})

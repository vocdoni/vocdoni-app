import { describe, expect, it } from 'vitest'
import { system } from '../system'

// The declarations a slot gets from the recipe layer.
const layer = (styles: unknown) => (styles as Record<string, Record<string, unknown>>)['@layer recipes']

describe('Card list-item variant', () => {
  const card = system.sva(system.getSlotRecipe('card'))
  const listItem = card({ variant: 'list-item', size: 'sm' })

  it('leaves no padding on the header or the body, so the root padding is the only one', () => {
    // The base slots pad with `px` and `pt`/`pb`, which the variant must override by the same keys:
    // a `p: 0` alone is emitted first and the later `px` wins.
    expect(layer(listItem.header)).toMatchObject({
      paddingInline: 'var(--chakra-spacing-0)',
      paddingTop: 'var(--chakra-spacing-0)',
      paddingBottom: 'var(--chakra-spacing-0)',
    })
    expect(layer(listItem.body)).toMatchObject({
      paddingInline: 'var(--chakra-spacing-0)',
      paddingBlock: 'var(--chakra-spacing-0)',
    })
  })

  it('draws no hairline between the header and the body', () => {
    expect(layer(listItem.body)['&:not(:first-of-type)']).toMatchObject({ borderTopWidth: '0' })
  })

  it('keeps the hairline between the body rows of the other variants', () => {
    const section = card({ variant: 'section', size: 'sm' })
    expect(layer(section.body)['&:not(:first-of-type)']).toMatchObject({
      borderTopWidth: 'var(--chakra-border-widths-hairline)',
    })
  })
})

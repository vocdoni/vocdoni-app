import { describe, expect, it } from 'vitest'
import { link } from './typography'

describe('link recipe', () => {
  // Chakra's stock `plain` hover underlines the link; the variant must cancel it so no state is underlined.
  it('never underlines the plain variant on hover', () => {
    const plain = (link.variants?.variant as Record<string, Record<string, any>>).plain
    expect(plain._hover).toMatchObject({ textDecoration: 'none' })
  })

  // The base repeats its colour on hover and under `.dark &`, which beat a variant's plain `color`.
  it.each(Object.entries(link.variants?.tone ?? {}))('tone %s sets its colour in every state', (_, styles) => {
    const { color, _hover, _dark } = styles as Record<string, any>
    expect(_hover.color).toBe(color)
    expect(_dark.color).toBe(color)
    expect(_dark._hover.color).toBe(color)
  })
})

import { describe, expect, it } from 'vitest'
import { system } from '../system'

const progress = system.sva(system.getSlotRecipe('progress'))

// The declarations a slot gets from the recipe layer.
const layer = (styles: unknown) => (styles as Record<string, Record<string, unknown>>)['@layer recipes']

describe('progress variants', () => {
  it.each(['turnout', 'meter', 'job'] as const)(
    '%s is a 3px square track with the 2px gap after the fill',
    (variant) => {
      const styles = progress({ variant })
      expect(layer(styles.track)).toMatchObject({ height: '3px', borderRadius: 'var(--chakra-radii-none)' })
      expect(JSON.stringify(layer(styles.range))).toContain('2px 0 0')
      expect(JSON.stringify(layer(styles.track))).not.toContain('inset')
    }
  )

  it('results is a 6px track with an ink fill', () => {
    const styles = progress({ variant: 'results' })
    expect(layer(styles.track)).toMatchObject({ height: 'var(--chakra-sizes-1\\.5)' })
    expect(JSON.stringify(layer(styles.range))).toContain('--chakra-colors-fg)')
  })

  it('draws no stripes, whatever the striped prop says', () => {
    const styles = progress({ variant: 'turnout', striped: true })
    expect(layer(styles.range)).toMatchObject({ backgroundImage: 'none' })
  })
})

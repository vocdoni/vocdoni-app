import { describe, expect, it } from 'vitest'
import { system } from '../system'
import { BallotDescription } from './ballotDescription'

const layer = (styles: unknown) => (styles as Record<string, Record<string, unknown>>)['@layer recipes']

describe('ballot description recipe', () => {
  it('sets the description in the muted body, regular weight, with no margin after the last paragraph', () => {
    const styles = layer(system.cva(BallotDescription)({}))
    expect(styles).toMatchObject({ color: 'var(--chakra-colors-fg-muted)' })
    expect(styles['& p']).toMatchObject({ fontWeight: 'var(--chakra-font-weights-normal)' })
    expect(styles['& p:last-of-type']).toMatchObject({ marginBottom: 'var(--chakra-spacing-0)' })
  })
})

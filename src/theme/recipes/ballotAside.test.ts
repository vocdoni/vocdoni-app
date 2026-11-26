import { describe, expect, it } from 'vitest'
import { system } from '../system'
import { BallotAside } from './ballotAside'

const layer = (styles: unknown) => (styles as Record<string, Record<string, unknown>>)['@layer recipes']

describe('ballot aside recipe', () => {
  it('sets a choice apart under the answers: 22px, the light rule, 16px, in the hint size', () => {
    expect(layer(system.cva(BallotAside)({}))).toMatchObject({
      marginTop: 'var(--chakra-spacing-ballot-aside)',
      paddingTop: 'var(--chakra-spacing-4)',
      borderTopWidth: 'var(--chakra-border-widths-hairline)',
      borderColor: 'var(--chakra-colors-border-muted)',
    })
    // The aside's gap is the options' own (22px), by alias.
    expect(system.token('spacing.ballot.aside')).toBe('var(--chakra-spacing-ballot-options)')
    expect(system.token('spacing.ballot.options')).toBe('22px')
  })
})

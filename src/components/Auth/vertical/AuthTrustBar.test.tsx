import { describe, expect, it } from 'vitest'
import { render, screen } from '~src/test-utils'
import AuthTrustBar from './AuthTrustBar'
import { getTrustLogos } from './logos'
import { GenericAccent } from './registry'
import type { ResolvedVertical } from './types'

const buildVertical = (overrides: Partial<ResolvedVertical> = {}): ResolvedVertical => ({
  key: 'professional-associations',
  isGeneric: false,
  accent: GenericAccent,
  copy: {
    label: 'Professional associations',
    headline: 'Every member votes, wherever they are',
    trustBar: 'Many professional associations already trust it:',
  },
  testimonial: null,
  logos: getTrustLogos(['coib', 'eic', 'icoes']),
  usesGenericLogos: false,
  ...overrides,
})

describe('AuthTrustBar', () => {
  it('introduces the logo row with the vertical sentence', () => {
    render(<AuthTrustBar vertical={buildVertical()} />)

    expect(screen.getByText('Many professional associations already trust it:')).toBeInTheDocument()
  })

  it('gives every logo an accessible name', () => {
    render(<AuthTrustBar vertical={buildVertical()} />)

    const logos = screen.getAllByRole('img')
    expect(logos).toHaveLength(3)
    for (const logo of logos) {
      expect(logo).toHaveAccessibleName(/ logo$/)
    }
  })

  it('renders nothing without logos', () => {
    render(<AuthTrustBar vertical={buildVertical({ logos: [] })} />)

    expect(screen.queryByText('Many professional associations already trust it:')).not.toBeInTheDocument()
    expect(screen.queryAllByRole('img')).toHaveLength(0)
  })
})

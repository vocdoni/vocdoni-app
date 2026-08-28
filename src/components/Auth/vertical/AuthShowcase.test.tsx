import { describe, expect, it } from 'vitest'
import { render, screen } from '~src/test-utils'
import AuthShowcase from './AuthShowcase'
import { GenericAccent } from './registry'
import type { AuthTestimonial, ResolvedVertical } from './types'

const testimonial: AuthTestimonial = {
  id: 'test',
  author: 'Ada Lovelace',
  position: 'President',
  company: 'Analytical Society',
  quote: 'We finally ran our AGM without counting a single paper ballot.',
  verticals: ['professional-associations'],
  logo: 'coib',
}

const buildVertical = (overrides: Partial<ResolvedVertical> = {}): ResolvedVertical => ({
  key: 'professional-associations',
  isGeneric: false,
  accent: GenericAccent,
  copy: {
    label: 'Professional associations',
    headline: 'Every member votes, wherever they are',
    trustBar: 'Many already trust it:',
  },
  testimonial,
  logos: [],
  usesGenericLogos: false,
  ...overrides,
})

/**
 * The panel is `display={{ base: 'none', md: 'flex' }}` and jsdom does not evaluate media queries,
 * so everything inside it counts as hidden here. Role queries have to opt in — this says nothing
 * about visibility in a real browser, which the tests deliberately don't try to assert.
 */
const hidden = { hidden: true } as const

describe('AuthShowcase', () => {
  it('labels the quote with the vertical sector instead of a marketing headline', () => {
    render(<AuthShowcase vertical={buildVertical()} />)

    expect(screen.getByText('Professional associations')).toBeInTheDocument()
    expect(screen.queryByText('Every member votes, wherever they are')).not.toBeInTheDocument()
  })

  it('renders the quote and its attribution', () => {
    render(<AuthShowcase vertical={buildVertical()} />)

    expect(screen.getByText(testimonial.quote)).toBeInTheDocument()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText(/President · Analytical Society/)).toBeInTheDocument()
  })

  it('shows the organization logo beside the attribution', () => {
    render(<AuthShowcase vertical={buildVertical()} />)

    expect(screen.getByRole('img', { name: /Col·legi Oficial.* logo/, ...hidden })).toBeInTheDocument()
  })

  it('never renders the author portrait, even for the organizations that have one', () => {
    render(
      <AuthShowcase
        vertical={buildVertical({ testimonial: { ...testimonial, portrait: '/assets/testimonials/eic.png' } })}
      />
    )

    expect(screen.queryByRole('img', { name: /Portrait of/, ...hidden })).not.toBeInTheDocument()
  })

  it('renders the headline alone when there is no testimonial', () => {
    render(<AuthShowcase vertical={buildVertical({ testimonial: null })} />)

    expect(
      screen.getByRole('heading', { name: 'Every member votes, wherever they are', ...hidden })
    ).toBeInTheDocument()
    expect(screen.queryAllByRole('img', hidden)).toHaveLength(0)
  })
})

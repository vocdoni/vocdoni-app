import { ReactNode } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { renderHook, TestMemoryRouter } from '~src/test-utils'
import { GenericLogos } from './logos'
import { GenericAccent, VerticalRegistry } from './registry'
import { useAuthVertical } from './useAuthVertical'

const renderAt = (path: string) =>
  renderHook(() => useAuthVertical(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <TestMemoryRouter initialEntries={[path]}>{children}</TestMemoryRouter>
    ),
  })

const professional = VerticalRegistry['professional-associations']!

beforeEach(() => {
  window.sessionStorage.clear()
})

describe('useAuthVertical', () => {
  it('personalizes a populated vertical', () => {
    const { result } = renderAt('/account/signin?type=professional-associations')

    expect(result.current.key).toBe('professional-associations')
    expect(result.current.isGeneric).toBe(false)
    expect(result.current.accent).toBe(professional.accent)
    expect(result.current.usesGenericLogos).toBe(false)
    expect(result.current.logos.map((logo) => logo.id)).toEqual(professional.logos)
    expect(result.current.testimonial?.verticals).toContain('professional-associations')
    expect(result.current.copy.trustBar).toContain('professional association')
  })

  it('falls back to the generic experience with no param', () => {
    const { result } = renderAt('/account/signin')

    expect(result.current.key).toBe('generic')
    expect(result.current.isGeneric).toBe(true)
    expect(result.current.accent).toBe(GenericAccent)
    expect(result.current.usesGenericLogos).toBe(true)
    expect(result.current.logos.map((logo) => logo.id)).toEqual([...GenericLogos])
    expect(result.current.testimonial).not.toBeNull()
  })

  it('degrades unknown values to generic instead of throwing', () => {
    for (const value of ['banana', 'companies-agm', '__proto__', '../../etc/passwd']) {
      const { result } = renderAt(`/account/signin?type=${encodeURIComponent(value)}`)

      expect(result.current.key).toBe('generic')
      expect(result.current.copy.trustBar).toContain('every sector')
    }
  })

  it('accepts the marketing site slug', () => {
    const { result } = renderAt('/account/signin?type=professional-colleges')

    expect(result.current.key).toBe('professional-associations')
  })

  // cooperatives resolves but has no customer of its own, so it borrows both the quote pool and the
  // logo row — and takes the generic sentence with them rather than claiming the sector trusts us.
  it('keeps a vertical with no customers of its own on the generic row and sentence', () => {
    const { result } = renderAt('/account/signin?type=cooperatives')

    expect(result.current.key).toBe('cooperatives')
    expect(result.current.usesGenericLogos).toBe(true)
    expect(result.current.copy.trustBar).toContain('every sector')
  })

  // The counterpart: a vertical with customers of its own shows them, however few. Two names from
  // the sector under a sentence about that sector beat ten borrowed from everyone else.
  it('gives a vertical with customers of its own its logo row and sentence', () => {
    const { result } = renderAt('/account/signin?type=trade-unions')

    expect(result.current.key).toBe('trade-unions')
    expect(result.current.usesGenericLogos).toBe(false)
    expect(result.current.logos.map((logo) => logo.id)).toEqual(['intersindical', 'ustec'])
    expect(result.current.copy.trustBar).toContain('union')
    expect(result.current.testimonial?.verticals).toContain('trade-unions')
  })

  it('carries the vertical across a screen that lost the query string', () => {
    renderAt('/account/signup?type=professional-associations')

    const { result } = renderAt('/account/verify')

    expect(result.current.key).toBe('professional-associations')
  })

  it('degrades an invalid param to generic rather than reusing the stored vertical', () => {
    renderAt('/account/signin?type=professional-associations')

    const { result } = renderAt('/account/signin?type=banana')

    expect(result.current.key).toBe('generic')
  })

  it('lets the url override a stale stored vertical', () => {
    renderAt('/account/signin?type=professional-associations')

    const { result } = renderAt('/account/signin?type=trade-unions')

    expect(result.current.key).toBe('trade-unions')
  })
})

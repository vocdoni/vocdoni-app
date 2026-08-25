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

  it('keeps a vertical with no logos of its own on the generic sentence', () => {
    // trade-unions has quotes but is not in the registry yet
    const { result } = renderAt('/account/signin?type=trade-unions')

    expect(result.current.key).toBe('trade-unions')
    expect(result.current.usesGenericLogos).toBe(true)
    expect(result.current.copy.trustBar).toContain('every sector')
    expect(result.current.testimonial?.verticals).toContain('trade-unions')
  })

  it('carries the vertical across a screen that lost the query string', () => {
    renderAt('/account/signup?type=professional-associations')

    const { result } = renderAt('/account/verify')

    expect(result.current.key).toBe('professional-associations')
  })

  it('lets the url override a stale stored vertical', () => {
    renderAt('/account/signin?type=professional-associations')

    const { result } = renderAt('/account/signin?type=trade-unions')

    expect(result.current.key).toBe('trade-unions')
  })
})

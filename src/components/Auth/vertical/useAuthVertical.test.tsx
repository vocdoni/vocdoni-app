import i18n from 'i18next'
import { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { VerticalSlugs } from '~constants/verticals'
import { act, renderHook, TestMemoryRouter } from '~src/test-utils'
import { useVerticalCopy } from './copy'
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
const genericCopy = renderHook(() => useVerticalCopy()).result.current.generic

beforeEach(() => {
  window.sessionStorage.clear()
})

afterEach(async () => {
  vi.restoreAllMocks()
  if (i18n.language !== 'en') await i18n.changeLanguage('en')
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
    expect(result.current.copy.trustBar).toMatch(/professional associations/i)
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
      expect(result.current.copy.trustBar).toMatch(/every sector/i)
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
    expect(result.current.copy.trustBar).toMatch(/every sector/i)
    // The eyebrow and accent fall back too — nothing on the panel names a sector we cannot back
    expect(result.current.copy.label).toBe(genericCopy.label)
    expect(result.current.accent).toBe(GenericAccent)
  })

  // The eyebrow sits directly above the quote, so it reads as attribution. Whenever the panel had
  // nothing of this sector's own to quote and borrowed from the wider pool, the eyebrow has to let
  // go with it — otherwise another sector's words appear under this one's name.
  it('never labels a borrowed quote with a sector', () => {
    for (const slug of VerticalSlugs) {
      const { result } = renderAt(`/account/signin?type=${slug}`)
      const borrowed = !result.current.testimonial?.verticals.includes(slug)

      if (borrowed) {
        expect(result.current.copy.label, `"${slug}" names a sector over a borrowed quote`).toBe(genericCopy.label)
      }
    }
  })

  // The counterpart: a vertical with customers of its own shows them, however few. Two names from
  // the sector under a sentence about that sector beat ten borrowed from everyone else.
  it('gives a vertical with customers of its own its logo row and sentence', () => {
    const { result } = renderAt('/account/signin?type=trade-unions')

    expect(result.current.key).toBe('trade-unions')
    expect(result.current.usesGenericLogos).toBe(false)
    expect(result.current.logos.map((logo) => logo.id)).toEqual(['intersindical', 'ustec'])
    expect(result.current.copy.trustBar).toMatch(/unions/i)
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

  // The auth layout mounts once and survives every in-app navigation, so the stored fallback has to
  // be read per render — a mount-time snapshot is forever the value from before the visitor arrived,
  // and the layout would drop to generic the moment a navigation loses the param.
  it('keeps the vertical on a caller that outlives the navigation that drops the param', async () => {
    const { result } = renderHook(() => ({ vertical: useAuthVertical(), navigate: useNavigate() }), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <TestMemoryRouter initialEntries={['/account/signup?type=professional-associations']}>
          {children}
        </TestMemoryRouter>
      ),
    })

    expect(result.current.vertical.key).toBe('professional-associations')

    await act(async () => result.current.navigate('/account/signin'))

    expect(result.current.vertical.key).toBe('professional-associations')
  })

  // The seed picks over the language-independent list, so a locale switch that withholds *other*
  // quotes must not re-roll the one on screen.
  it('keeps the quote steady across a language switch when the pick survives it', async () => {
    // The test instance only carries `en`; `resolvedLanguage` only moves to a language with at least
    // one translation, and without it the withheld filter would never engage.
    i18n.addResourceBundle('es', 'common', { language_probe: 'es' })
    // 0.7 lands past the two es-withheld quotes (indexes 7 and 8), on one no language withholds —
    // the case that must hold steady. Indexing a withheld-filtered list instead would shift this
    // pick on a switch to Spanish, because the list shrinks by two below it.
    vi.spyOn(Math, 'random').mockReturnValue(0.7)
    const { result } = renderAt('/account/signin')
    const before = result.current.testimonial?.logo
    expect(before).toBeDefined()

    await act(async () => {
      await i18n.changeLanguage('es')
    })

    expect(result.current.testimonial?.logo).toBe(before)
  })
})

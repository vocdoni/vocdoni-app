import type { PublicProcessPageData } from '~src/ssr/public-pages'
import { getHeaderOrganizationLogo } from './headerOrganizationLogo'

const meta = (language = 'en') => ({ language }) as PublicProcessPageData['meta']

const saas = (organization: any, language = 'en') =>
  ({ era: 'saas', id: 'p1', election: {} as any, organization, meta: meta(language) }) as PublicProcessPageData

const archive = (legacyOrganization: any, language = 'en') =>
  ({
    era: 'archive',
    id: 'p1',
    legacyElection: {} as any,
    legacyOrganization,
    meta: meta(language),
  }) as PublicProcessPageData

describe('getHeaderOrganizationLogo', () => {
  it('returns nothing without page data', () => {
    expect(getHeaderOrganizationLogo(undefined)).toBeUndefined()
  })

  it('reads the SaaS organization logo and name locale maps', () => {
    expect(
      getHeaderOrganizationLogo(
        saas({ address: '0x1', logo: { default: 'https://cdn/logo.png' }, name: { default: 'Acme' } })
      )
    ).toEqual({ src: 'https://cdn/logo.png', name: 'Acme' })
  })

  it('prefers the page language over the default entry', () => {
    expect(
      getHeaderOrganizationLogo(
        saas(
          {
            address: '0x1',
            logo: { default: 'https://cdn/en.png', ca: 'https://cdn/ca.png' },
            name: { default: 'Acme', ca: 'Acme CAT' },
          },
          'ca'
        )
      )
    ).toEqual({ src: 'https://cdn/ca.png', name: 'Acme CAT' })
  })

  it('falls back from a regional language to its base language', () => {
    expect(getHeaderOrganizationLogo(saas({ address: '0x1', logo: { pt: 'https://cdn/pt.png' } }, 'pt-br'))?.src).toBe(
      'https://cdn/pt.png'
    )
  })

  it('keeps the Vocdoni logo when the organization has no logo', () => {
    expect(getHeaderOrganizationLogo(saas({ address: '0x1', name: { default: 'Acme' } }))).toBeUndefined()
    expect(getHeaderOrganizationLogo(saas({ address: '0x1', logo: {} }))).toBeUndefined()
    expect(getHeaderOrganizationLogo(saas({ address: '0x1', logo: { default: '   ' } }))).toBeUndefined()
    expect(getHeaderOrganizationLogo(saas(undefined))).toBeUndefined()
  })

  it('reads the single avatar URL of archive-era organizations', () => {
    expect(
      getHeaderOrganizationLogo(
        archive({ address: '0x1', account: { avatar: 'https://cdn/old.png', name: { default: 'Old' } } })
      )
    ).toEqual({ src: 'https://cdn/old.png', name: 'Old' })
  })

  it('keeps the Vocdoni logo for archive-era processes without an organization', () => {
    expect(getHeaderOrganizationLogo(archive(undefined))).toBeUndefined()
    expect(getHeaderOrganizationLogo(archive({ address: '0x1', account: {} }))).toBeUndefined()
  })

  it('returns the logo even when the organization has no name, so alt text can fall back', () => {
    expect(getHeaderOrganizationLogo(saas({ address: '0x1', logo: { default: 'https://cdn/logo.png' } }))).toEqual({
      src: 'https://cdn/logo.png',
      name: undefined,
    })
  })
})

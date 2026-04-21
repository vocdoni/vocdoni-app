import { ErrAccountNotFound, ErrElectionNotFound, PublishedElection } from '@vocdoni/sdk'
import {
  buildOrganizationMeta,
  buildProcessMeta,
  getDefaultPublicLanguage,
  getLocalizedPublicRedirectTarget,
  getPublicLanguageAlternates,
  getPublicLocalizedOrganizationRouteMatch,
  getPublicLocalizedProcessRouteMatch,
  getPublicOrganizationPath,
  getPublicProcessPath,
  isPublicPageNotFoundError,
  loadOrganizationPageData,
  loadProcessPageData,
  resolvePublicLanguage,
  serializePublicPageErrorDetails,
} from './public-pages'

type MockClient = {
  fetchAccountInfo: ReturnType<typeof vi.fn>
  fetchElections: ReturnType<typeof vi.fn>
  fetchElection: ReturnType<typeof vi.fn>
}

const createOrganization = (overrides: Record<string, unknown> = {}) =>
  ({
    address: '0xabc',
    account: {
      name: { default: 'Vocdoni Association' },
      description: { default: 'A digital voting organization for tests.' },
    },
    ...overrides,
  }) as any

const createElection = (overrides: Record<string, unknown> = {}) =>
  new PublishedElection({
    id: '0xprocess',
    organizationId: '0xabc',
    title: { default: 'Board election 2026' },
    description: { default: 'Vote for the next board members.' },
    status: 'READY',
    startDate: new Date('2026-01-01T00:00:00.000Z'),
    endDate: new Date('2026-01-02T00:00:00.000Z'),
    electionType: {
      anonymous: false,
      interruptible: true,
      dynamicCensus: false,
      secretUntilTheEnd: false,
    },
    census: null,
    questions: [],
    ...overrides,
  } as any)

const createPaginatedElections = () =>
  ({
    elections: [createElection()],
    pagination: {
      totalItems: 1,
      previousPage: null,
      currentPage: 0,
      nextPage: null,
      lastPage: 0,
    },
  }) as any

describe('loadOrganizationPageData', () => {
  it('loads the organization and the first elections page', async () => {
    const organization = createOrganization()
    const elections = createPaginatedElections()
    const client: MockClient = {
      fetchAccountInfo: vi.fn().mockResolvedValue(organization),
      fetchElections: vi.fn().mockResolvedValue(elections),
      fetchElection: vi.fn(),
    }

    const pageData = await loadOrganizationPageData({
      client: client as any,
      address: '0xabc',
      canonicalUrl: 'https://app.example.org/organization/0xabc',
      language: 'en',
      alternates: [],
    })

    expect(client.fetchAccountInfo).toHaveBeenCalledWith('0xabc')
    expect(client.fetchElections).toHaveBeenCalledWith({ organizationId: '0xabc', page: 0 })
    expect(pageData.address).toBe('0xabc')
    expect(pageData.organization).toBe(organization)
    expect(pageData.electionsPage).toBe(elections)
    expect(pageData.meta.canonicalUrl).toBe('https://app.example.org/organization/0xabc')
  })
})

describe('loadProcessPageData', () => {
  it('loads the election and related organization', async () => {
    const election = createElection()
    const organization = createOrganization()
    const client: MockClient = {
      fetchAccountInfo: vi.fn().mockResolvedValue(organization),
      fetchElections: vi.fn(),
      fetchElection: vi.fn().mockResolvedValue(election),
    }

    const pageData = await loadProcessPageData({
      client: client as any,
      id: '0xprocess',
      canonicalUrl: 'https://app.example.org/processes/0xprocess',
      language: 'en',
      alternates: [],
    })

    expect(client.fetchElection).toHaveBeenCalledWith('0xprocess')
    expect(client.fetchAccountInfo).toHaveBeenCalledWith('0xabc')
    expect(pageData.id).toBe('0xprocess')
    expect(pageData.election).toBe(election)
    expect(pageData.organization).toBe(organization)
    expect(pageData.meta.title).toContain('Board election 2026')
  })
})

describe('metadata builders', () => {
  it('uses localized organization urls as canonical pages and points x-default to the default-language organization page', () => {
    const meta = buildOrganizationMeta({
      organization: createOrganization(),
      canonicalUrl: 'https://app.example.org/en/organization/0xabc',
      language: 'en',
      alternates: getPublicLanguageAlternates({
        languages: ['en', 'es', 'ca'],
        pathnameByLanguage: {
          en: '/en/organization/0xabc',
          es: '/es/organization/0xabc',
          ca: '/ca/organization/0xabc',
        },
        origin: 'https://app.example.org',
      }),
    })

    expect(meta.canonicalUrl).toBe('https://app.example.org/en/organization/0xabc')
    expect(meta.alternates).toEqual([
      { hrefLang: 'en', href: 'https://app.example.org/en/organization/0xabc' },
      { hrefLang: 'es', href: 'https://app.example.org/es/organization/0xabc' },
      { hrefLang: 'ca', href: 'https://app.example.org/ca/organization/0xabc' },
      { hrefLang: 'x-default', href: 'https://app.example.org/en/organization/0xabc' },
    ])
  })

  it('keeps bare english organization aliases non-canonical while pointing metadata to the prefixed canonical url', () => {
    const meta = buildOrganizationMeta({
      organization: createOrganization(),
      canonicalUrl: 'https://app.example.org/en/organization/0xabc',
      language: 'en',
      alternates: getPublicLanguageAlternates({
        languages: ['en', 'es', 'ca'],
        pathnameByLanguage: {
          en: '/en/organization/0xabc',
          es: '/es/organization/0xabc',
          ca: '/ca/organization/0xabc',
        },
        origin: 'https://app.example.org',
      }),
    })

    expect(meta.canonicalUrl).toBe('https://app.example.org/en/organization/0xabc')
    expect(meta.openGraph.url).toBe('https://app.example.org/en/organization/0xabc')
  })

  it('keeps localized process urls canonical to themselves', () => {
    const meta = buildProcessMeta({
      election: createElection(),
      organization: createOrganization(),
      canonicalUrl: 'https://app.example.org/es/processes/0xprocess',
      language: 'es',
      alternates: getPublicLanguageAlternates({
        languages: ['en', 'es'],
        pathnameByLanguage: {
          en: '/en/processes/0xprocess',
          es: '/es/processes/0xprocess',
        },
        origin: 'https://app.example.org',
      }),
    })

    expect(meta.canonicalUrl).toBe('https://app.example.org/es/processes/0xprocess')
    expect(meta.openGraph.url).toBe('https://app.example.org/es/processes/0xprocess')
    expect(meta.alternates).toEqual([
      { hrefLang: 'en', href: 'https://app.example.org/en/processes/0xprocess' },
      { hrefLang: 'es', href: 'https://app.example.org/es/processes/0xprocess' },
      { hrefLang: 'x-default', href: 'https://app.example.org/en/processes/0xprocess' },
    ])
  })

  it('builds organization metadata with canonical url when available', () => {
    const meta = buildOrganizationMeta({
      organization: createOrganization(),
      canonicalUrl: 'https://app.example.org/organization/0xabc',
      language: 'en',
      alternates: [],
    })

    expect(meta.title).toBe('Vocdoni Association | Vocdoni')
    expect(meta.description).toContain('digital voting organization')
    expect(meta.canonicalUrl).toBe('https://app.example.org/organization/0xabc')
    expect(meta.openGraph.title).toBe('Vocdoni Association | Vocdoni')
    expect(meta.openGraph.url).toBe('https://app.example.org/organization/0xabc')
    expect(meta.twitter.card).toBe('summary')
  })

  it('falls back to organization display data when the description is missing', () => {
    const meta = buildOrganizationMeta({
      organization: createOrganization({
        address: '0xfallback',
        account: { name: { default: 'Fallback Org' }, description: { default: '' } },
      }),
      language: 'en',
      alternates: [],
    })

    expect(meta.title).toBe('Fallback Org | Vocdoni')
    expect(meta.description).toBe('Fallback Org')
    expect(meta.canonicalUrl).toBeUndefined()
  })

  it('falls back to organization address when name and description are missing', () => {
    const meta = buildOrganizationMeta({
      organization: createOrganization({
        address: '0xfallback',
        account: { name: { default: '' }, description: { default: '' } },
      }),
      language: 'en',
      alternates: [],
    })

    expect(meta.title).toBe('0xfallback | Vocdoni')
    expect(meta.description).toBe('0xfallback')
    expect(meta.canonicalUrl).toBeUndefined()
  })

  it('keeps the original process description untouched when it exists', () => {
    const meta = buildProcessMeta({
      election: createElection(),
      organization: createOrganization(),
      canonicalUrl: 'https://app.example.org/processes/0xprocess',
      language: 'en',
      alternates: [],
    })

    expect(meta.title).toBe('Board election 2026 | Vocdoni Association | Vocdoni')
    expect(meta.description).toBe('Vote for the next board members.')
    expect(meta.openGraph.title).toBe('Board election 2026 | Vocdoni Association | Vocdoni')
    expect(meta.openGraph.url).toBe('https://app.example.org/processes/0xprocess')
  })

  it('falls back to a short process description when the election has no description', () => {
    const meta = buildProcessMeta({
      election: createElection({ description: { default: '' } }),
      organization: createOrganization(),
      language: 'en',
      alternates: [],
    })

    expect(meta.description).toBe('Board election 2026 — Vocdoni Association')
  })

  it('prefers route-language metadata values when localized text exists', () => {
    const meta = buildProcessMeta({
      election: createElection({
        title: { default: 'Board election 2026', ca: 'Elecció del consell 2026' },
        description: { default: 'Vote for the next board members.', ca: 'Vota pels nous membres del consell.' },
      }),
      organization: createOrganization({
        account: {
          name: { default: 'Vocdoni Association', ca: 'Associació Vocdoni' },
          description: { default: 'A digital voting organization for tests.', ca: 'Una organització de vot digital.' },
        },
      }),
      language: 'ca',
      alternates: [],
    })

    expect(meta.title).toBe('Elecció del consell 2026 | Associació Vocdoni | Vocdoni')
    expect(meta.description).toBe('Vota pels nous membres del consell.')
  })

  it('omits canonical data when the request origin is unavailable', () => {
    const meta = buildProcessMeta({
      election: createElection(),
      organization: createOrganization(),
      language: 'en',
      alternates: [],
    })

    expect(meta.canonicalUrl).toBeUndefined()
    expect(meta.openGraph.url).toBeUndefined()
  })
})

describe('public language helpers', () => {
  it('uses english as the bare public language when available', () => {
    expect(getDefaultPublicLanguage(['es', 'en', 'ca'])).toBe('en')
  })

  it('falls back to the first configured language when english is unavailable', () => {
    expect(getDefaultPublicLanguage(['ca', 'es'])).toBe('ca')
  })

  it('resolves a localized route language only when it is supported', () => {
    expect(resolvePublicLanguage({ routeLanguage: 'es', supportedLanguages: ['en', 'es', 'ca'] })).toBe('es')
    expect(() => resolvePublicLanguage({ routeLanguage: 'fr', supportedLanguages: ['en', 'es', 'ca'] })).toThrow(
      'Unsupported public language'
    )
  })

  it('builds canonical public page paths with a prefixed language, including english', () => {
    expect(getPublicOrganizationPath({ address: '0xabc', language: 'en' })).toBe('/en/organization/0xabc')
    expect(getPublicOrganizationPath({ address: '0xabc', language: 'es' })).toBe('/es/organization/0xabc')
    expect(getPublicProcessPath({ id: '0xprocess', language: 'en' })).toBe('/en/processes/0xprocess')
    expect(getPublicProcessPath({ id: '0xprocess', language: 'ca' })).toBe('/ca/processes/0xprocess')
  })

  it('builds localized redirect targets whenever the stored and current languages differ', () => {
    expect(
      getLocalizedPublicRedirectTarget({
        routeType: 'process',
        preferredLanguage: 'ca',
        currentLanguage: 'en',
        idOrAddress: '0xprocess',
      })
    ).toBe('/ca/processes/0xprocess')

    expect(
      getLocalizedPublicRedirectTarget({
        routeType: 'organization',
        preferredLanguage: 'ca',
        currentLanguage: 'it',
        idOrAddress: '0xabc',
      })
    ).toBe('/ca/organization/0xabc')

    expect(
      getLocalizedPublicRedirectTarget({
        routeType: 'process',
        preferredLanguage: 'ca',
        currentLanguage: 'ca',
        idOrAddress: '0xprocess',
      })
    ).toBeNull()
  })

  it('matches localized organization routes only for supported languages', () => {
    expect(
      getPublicLocalizedOrganizationRouteMatch({
        urlPathname: '/es/organization/0xabc',
        supportedLanguages: ['en', 'es', 'ca'],
      })
    ).toEqual({
      routeParams: {
        lang: 'es',
        address: '0xabc',
      },
    })

    expect(
      getPublicLocalizedOrganizationRouteMatch({
        urlPathname: '/admin/processes/0xprocess',
        supportedLanguages: ['en', 'es', 'ca'],
      })
    ).toBe(false)

    expect(
      getPublicLocalizedOrganizationRouteMatch({
        urlPathname: '/fr/organization/0xabc',
        supportedLanguages: ['en', 'es', 'ca'],
      })
    ).toBe(false)

    expect(
      getPublicLocalizedOrganizationRouteMatch({
        urlPathname: '/es/dashboard',
        supportedLanguages: ['en', 'es', 'ca'],
      })
    ).toBe(false)
  })

  it('matches localized process routes only for supported languages', () => {
    expect(
      getPublicLocalizedProcessRouteMatch({
        urlPathname: '/es/processes/0xprocess',
        supportedLanguages: ['en', 'es', 'ca'],
      })
    ).toEqual({
      routeParams: {
        lang: 'es',
        id: '0xprocess',
      },
    })

    expect(
      getPublicLocalizedProcessRouteMatch({
        urlPathname: '/es/organization/0xabc',
        supportedLanguages: ['en', 'es', 'ca'],
      })
    ).toBe(false)

    expect(
      getPublicLocalizedProcessRouteMatch({
        urlPathname: '/ca/processes/6be21a5a9dc034ede83966b661e6a648854bd92b7d209d2c97c202000000003f',
        supportedLanguages: ['en', 'es', 'ca'],
      })
    ).toEqual({
      routeParams: {
        lang: 'ca',
        id: '6be21a5a9dc034ede83966b661e6a648854bd92b7d209d2c97c202000000003f',
      },
    })
  })
})

describe('isPublicPageNotFoundError', () => {
  it('recognizes SDK public-page not-found errors', () => {
    expect(isPublicPageNotFoundError(new ErrElectionNotFound())).toBe(true)
    expect(isPublicPageNotFoundError(new ErrAccountNotFound())).toBe(true)
    expect(isPublicPageNotFoundError(new Error('other error'))).toBe(false)
  })
})

describe('serializePublicPageErrorDetails', () => {
  it('keeps nested SDK-style error fields for server logging', () => {
    const cause = { status: 404, response: { status: 404, data: { error: 'missing' } } }
    const error = Object.assign(new Error('election not found'), {
      name: 'ErrElectionNotFound',
      electionId: '0xprocess',
      cause,
    })

    expect(serializePublicPageErrorDetails(error)).toEqual({
      name: 'ErrElectionNotFound',
      message: 'election not found',
      stack: expect.any(String),
      electionId: '0xprocess',
      cause: {
        status: 404,
        response: {
          status: 404,
          data: {
            error: 'missing',
          },
        },
      },
    })
  })
})

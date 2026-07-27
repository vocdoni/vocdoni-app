import { VocdoniApiError } from '@vocdoni/api-client'
import {
  buildOrganizationMeta,
  buildProcessMeta,
  getDefaultPublicLanguage,
  getLocalizedPublicRedirectTarget,
  getPublicLanguageAlternates,
  getPublicLocalizedOrganizationRouteMatch,
  getPublicLocalizedProcessRouteMatch,
  getPublicLocalizedProcessSummaryRouteMatch,
  getPublicOrganizationPath,
  getPublicProcessPath,
  getPublicProcessSummaryPath,
  isPublicPageNotFoundError,
  loadOrganizationPageData,
  loadProcessPageData,
  resolvePublicLanguage,
  serializePublicPageErrorDetails,
} from './public-pages'

type MockClient = {
  organizations: { get: ReturnType<typeof vi.fn> }
  elections: { get: ReturnType<typeof vi.fn>; list: ReturnType<typeof vi.fn> }
}

const createMockClient = (overrides: Partial<{ organizationsGet: any; electionsGet: any; electionsList: any }> = {}) =>
  ({
    organizations: { get: overrides.organizationsGet ?? vi.fn() },
    elections: {
      get: overrides.electionsGet ?? vi.fn(),
      list: overrides.electionsList ?? vi.fn(),
    },
  }) satisfies MockClient

const createOrganization = (overrides: Record<string, unknown> = {}) =>
  ({
    address: '0xabc',
    name: { default: 'Vocdoni Association' },
    description: { default: 'A digital voting organization for tests.' },
    ...overrides,
  }) as any

const createElection = (overrides: Record<string, unknown> = {}) =>
  ({
    id: '0xprocess',
    orgAddress: 'abc',
    title: { default: 'Board election 2026' },
    description: { default: 'Vote for the next board members.' },
    census: {},
    questions: [],
    published: true,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-01-02T00:00:00.000Z',
    ...overrides,
  }) as any

const createProcessList = () =>
  ({
    processes: [createElection()],
    pagination: {
      totalItems: 1,
      previousPage: null,
      currentPage: 1,
      nextPage: null,
      lastPage: 1,
    },
  }) as any

describe('loadOrganizationPageData', () => {
  it('loads the organization and the first elections page', async () => {
    const organization = createOrganization()
    const list = createProcessList()
    const client = createMockClient({
      organizationsGet: vi.fn().mockResolvedValue(organization),
      electionsList: vi.fn().mockResolvedValue(list),
    })

    const pageData = await loadOrganizationPageData({
      client: client as any,
      address: '0xabc',
      canonicalUrl: 'https://app.example.org/organization/0xabc',
      language: 'en',
      alternates: [],
    })

    expect(client.organizations.get).toHaveBeenCalledWith('0xabc')
    expect(client.elections.list).toHaveBeenCalledWith({ orgAddress: '0xabc', page: 1 })
    expect(pageData.address).toBe('0xabc')
    expect(pageData.organization).toBe(organization)
    expect(pageData.electionsPage).toEqual({ elections: list.processes, pagination: list.pagination })
    expect(pageData.meta.canonicalUrl).toBe('https://app.example.org/organization/0xabc')
  })
})

describe('loadProcessPageData', () => {
  it('loads the election and related organization', async () => {
    const election = createElection()
    const organization = createOrganization()
    const client = createMockClient({
      organizationsGet: vi.fn().mockResolvedValue(organization),
      electionsGet: vi.fn().mockResolvedValue(election),
    })

    const pageData = await loadProcessPageData({
      client: client as any,
      id: '0xprocess',
      canonicalUrl: 'https://app.example.org/processes/0xprocess',
      language: 'en',
      alternates: [],
    })

    expect(client.elections.get).toHaveBeenCalledWith('0xprocess')
    expect(client.organizations.get).toHaveBeenCalledWith('0xabc')
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
        name: { default: 'Fallback Org' },
        description: { default: '' },
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
        name: { default: '' },
        description: { default: '' },
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
        name: { default: 'Vocdoni Association', ca: 'Associació Vocdoni' },
        description: { default: 'A digital voting organization for tests.', ca: 'Una organització de vot digital.' },
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
    expect(getPublicProcessSummaryPath({ id: '0xprocess', language: 'en' })).toBe('/en/processes/0xprocess/summary')
    expect(getPublicProcessSummaryPath({ id: '0xprocess', language: 'ca' })).toBe('/ca/processes/0xprocess/summary')
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

  it('matches localized process summary routes and ignores the bare process route', () => {
    expect(
      getPublicLocalizedProcessSummaryRouteMatch({
        urlPathname: '/es/processes/0xprocess/summary',
        supportedLanguages: ['en', 'es', 'ca'],
      })
    ).toEqual({
      routeParams: {
        lang: 'es',
        id: '0xprocess',
      },
    })

    expect(
      getPublicLocalizedProcessSummaryRouteMatch({
        urlPathname: '/es/processes/0xprocess',
        supportedLanguages: ['en', 'es', 'ca'],
      })
    ).toBe(false)

    expect(
      getPublicLocalizedProcessSummaryRouteMatch({
        urlPathname: '/fr/processes/0xprocess/summary',
        supportedLanguages: ['en', 'es', 'ca'],
      })
    ).toBe(false)
  })

  it('does not match the summary route with the bare process matcher', () => {
    expect(
      getPublicLocalizedProcessRouteMatch({
        urlPathname: '/es/processes/0xprocess/summary',
        supportedLanguages: ['en', 'es', 'ca'],
      })
    ).toBe(false)
  })
})

describe('isPublicPageNotFoundError', () => {
  it('recognizes SaaS not-found and malformed-id errors', () => {
    expect(isPublicPageNotFoundError(new VocdoniApiError(404, {}, 'process not found'))).toBe(true)
    expect(isPublicPageNotFoundError(new VocdoniApiError(400, {}, 'invalid id'))).toBe(true)
    expect(isPublicPageNotFoundError(new VocdoniApiError(500, {}, 'boom'))).toBe(false)
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

import { PublishedElection } from '@vocdoni/sdk'
import {
  buildOrganizationMeta,
  buildProcessMeta,
  loadOrganizationPageData,
  loadProcessPageData,
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
    })

    expect(client.fetchAccountInfo).toHaveBeenCalledWith('0xabc')
    expect(client.fetchElections).toHaveBeenCalledWith({ organizationId: '0xabc', page: 0 })
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
    })

    expect(client.fetchElection).toHaveBeenCalledWith('0xprocess')
    expect(client.fetchAccountInfo).toHaveBeenCalledWith('0xabc')
    expect(pageData.election).toBe(election)
    expect(pageData.organization).toBe(organization)
    expect(pageData.meta.title).toContain('Board election 2026')
  })
})

describe('metadata builders', () => {
  it('builds organization metadata with canonical url when available', () => {
    const meta = buildOrganizationMeta({
      organization: createOrganization(),
      canonicalUrl: 'https://app.example.org/organization/0xabc',
    })

    expect(meta.title).toContain('Vocdoni Association')
    expect(meta.description).toContain('digital voting organization')
    expect(meta.canonicalUrl).toBe('https://app.example.org/organization/0xabc')
    expect(meta.openGraph.url).toBe('https://app.example.org/organization/0xabc')
    expect(meta.twitter.card).toBe('summary_large_image')
  })

  it('falls back to organization address when name and description are missing', () => {
    const meta = buildOrganizationMeta({
      organization: createOrganization({
        address: '0xfallback',
        account: { name: { default: '' }, description: { default: '' } },
      }),
    })

    expect(meta.title).toContain('0xfallback')
    expect(meta.description).toContain('0xfallback')
    expect(meta.canonicalUrl).toBeUndefined()
  })

  it('builds process metadata with organization context', () => {
    const meta = buildProcessMeta({
      election: createElection(),
      organization: createOrganization(),
      canonicalUrl: 'https://app.example.org/processes/0xprocess',
    })

    expect(meta.title).toContain('Board election 2026')
    expect(meta.description).toContain('Vocdoni Association')
    expect(meta.openGraph.url).toBe('https://app.example.org/processes/0xprocess')
  })

  it('omits canonical data when the request origin is unavailable', () => {
    const meta = buildProcessMeta({
      election: createElection(),
      organization: createOrganization(),
    })

    expect(meta.canonicalUrl).toBeUndefined()
    expect(meta.openGraph.url).toBeUndefined()
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

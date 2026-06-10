import { ErrAccountNotFound, ErrCantParseElectionID } from '@vocdoni/sdk'

const { createVocdoniSdkClient } = vi.hoisted(() => ({
  createVocdoniSdkClient: vi.fn(),
}))

vi.mock('~src/app-env-server', () => ({
  // Read APP_URL live from process.env so per-test overrides take effect
  // (the real getServerAppEnv memoizes for the process lifetime).
  getServerAppEnv: () => ({
    LANGUAGES: { en: 'English', ca: 'Catalan' },
    APP_URL: process.env.APP_URL,
  }),
}))

vi.mock('~src/providers/vocdoni-client-config', () => ({
  createVocdoniSdkClient,
}))

import { loadOrganizationPublicPageData, loadProcessPublicPageData } from './publicPageData'

describe('public page data loaders', () => {
  beforeEach(() => {
    createVocdoniSdkClient.mockReset()
  })

  afterEach(() => {
    delete process.env.APP_URL
  })

  it('renders a 404 when the organization does not exist', async () => {
    createVocdoniSdkClient.mockReturnValue({
      fetchAccountInfo: vi.fn().mockRejectedValue(new ErrAccountNotFound()),
      fetchElections: vi.fn(),
      fetchElection: vi.fn(),
    })

    try {
      await loadOrganizationPublicPageData({
        routeParams: { lang: 'en', address: '0xmissing' },
        headers: { host: 'app.example.org', 'x-forwarded-proto': 'https' },
      } as any)
      throw new Error('Expected loadOrganizationPublicPageData() to throw')
    } catch (error) {
      expect((error as any)._pageContextAbort.abortStatusCode).toBe(404)
      expect((error as any)._pageContextAbort.abortReason).toBe('account not found')
    }
  })

  it('renders a 404 when the process id is malformed', async () => {
    createVocdoniSdkClient.mockReturnValue({
      fetchAccountInfo: vi.fn(),
      fetchElections: vi.fn(),
      fetchElection: vi.fn().mockRejectedValue(new ErrCantParseElectionID()),
    })

    try {
      await loadProcessPublicPageData({
        routeParams: { lang: 'en', id: 'broken-id' },
        headers: { host: 'app.example.org', 'x-forwarded-proto': 'https' },
      } as any)
      throw new Error('Expected loadProcessPublicPageData() to throw')
    } catch (error) {
      expect((error as any)._pageContextAbort.abortStatusCode).toBe(404)
      expect((error as any)._pageContextAbort.abortReason).toBe('cannot parse electionId')
    }
  })

  it('keeps non-not-found errors untouched', async () => {
    const upstreamError = new Error('upstream failed')

    createVocdoniSdkClient.mockReturnValue({
      fetchAccountInfo: vi.fn(),
      fetchElections: vi.fn(),
      fetchElection: vi.fn().mockRejectedValue(upstreamError),
    })

    await expect(
      loadProcessPublicPageData({
        routeParams: { lang: 'en', id: '0xprocess' },
        headers: { host: 'app.example.org', 'x-forwarded-proto': 'https' },
      } as any)
    ).rejects.toBe(upstreamError)
  })

  it('prefers APP_URL over request headers when building public URLs', async () => {
    process.env.APP_URL = 'https://app.vocdoni.io'

    createVocdoniSdkClient.mockReturnValue({
      fetchAccountInfo: vi.fn().mockResolvedValue({
        address: '0xorganization',
        account: {
          name: { en: 'Example Org' },
          description: { en: 'Example description' },
        },
      }),
      fetchElections: vi.fn().mockResolvedValue({
        elections: [],
        pagination: {
          currentPage: 0,
          lastPage: 0,
        },
      }),
      fetchElection: vi.fn(),
    })

    const result = await loadOrganizationPublicPageData({
      routeParams: { lang: 'en', address: '0xorganization' },
      headers: { host: 'evil.example.org', 'x-forwarded-proto': 'https' },
    } as any)

    expect(result.meta.canonicalUrl).toBe('https://app.vocdoni.io/en/organization/0xorganization')
    expect(result.meta.alternates.every((alternate) => alternate.href.startsWith('https://app.vocdoni.io'))).toBe(true)
  })
})

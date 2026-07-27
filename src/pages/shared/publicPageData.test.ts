import { VocdoniApiError } from '@vocdoni/api-client'

const { createVocdoniApiClient } = vi.hoisted(() => ({
  createVocdoniApiClient: vi.fn(),
}))

vi.mock('~src/app-env-server', () => ({
  // Read APP_URL live from process.env so per-test overrides take effect
  // (the real getServerAppEnv memoizes for the process lifetime).
  getServerAppEnv: () => ({
    LANGUAGES: { en: 'English', ca: 'Catalan' },
    APP_URL: process.env.APP_URL,
    SAAS_URL: 'https://saas-api.example.test',
  }),
}))

vi.mock('~src/providers/vocdoni-client-config', () => ({
  createVocdoniApiClient,
}))

import { loadOrganizationPublicPageData, loadProcessPublicPageData } from './publicPageData'

describe('public page data loaders', () => {
  beforeEach(() => {
    createVocdoniApiClient.mockReset()
  })

  afterEach(() => {
    delete process.env.APP_URL
  })

  it('renders a 404 when the organization does not exist', async () => {
    createVocdoniApiClient.mockReturnValue({
      organizations: { get: vi.fn().mockRejectedValue(new VocdoniApiError(404, {}, 'account not found')) },
      elections: { get: vi.fn(), list: vi.fn() },
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
    createVocdoniApiClient.mockReturnValue({
      organizations: { get: vi.fn() },
      elections: {
        get: vi.fn().mockRejectedValue(new VocdoniApiError(400, {}, 'cannot parse electionId')),
        list: vi.fn(),
      },
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

    createVocdoniApiClient.mockReturnValue({
      organizations: { get: vi.fn() },
      elections: { get: vi.fn().mockRejectedValue(upstreamError), list: vi.fn() },
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

    createVocdoniApiClient.mockReturnValue({
      organizations: {
        get: vi.fn().mockResolvedValue({
          address: '0xorganization',
          name: { en: 'Example Org' },
          description: { en: 'Example description' },
        }),
      },
      elections: {
        get: vi.fn(),
        list: vi.fn().mockResolvedValue({
          processes: [],
          pagination: {
            currentPage: 1,
            lastPage: 1,
          },
        }),
      },
    })

    const result = await loadOrganizationPublicPageData({
      routeParams: { lang: 'en', address: '0xorganization' },
      headers: { host: 'evil.example.org', 'x-forwarded-proto': 'https' },
    } as any)

    expect(result.meta.canonicalUrl).toBe('https://app.vocdoni.io/en/organization/0xorganization')
    expect(result.meta.alternates.every((alternate) => alternate.href.startsWith('https://app.vocdoni.io'))).toBe(true)
  })
})

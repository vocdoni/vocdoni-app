import { configureApiBaseUrl } from '~components/Auth/api'
import { CertAuthError } from './types'
import { httpCertificateAuthApi } from './client'

const { create, redeem, probe } = httpCertificateAuthApi

const PROCESS_ID = '6650f0c0a1b2c3d4e5f60718'

const createResponse = {
  state: 'q3Jd0zR9xQe1v0bHkq2n8m1tY6cW4pLa7sFuEoZiXgA',
  authUrl: 'https://nonce.cert.auth-dev.vocdoni.io/v1/authenticate?state=q3Jd',
  expiresAt: '2026-11-13T09:15:00Z',
}

const redeemResponse = {
  purpose: 'vote' as const,
  authToken: 'token-abc',
  weight: '01',
  voterRef: 'mock-voter-ref',
  holder: { fullName: 'Maria García López', documentType: 'DNI' as const, documentEnding: '678Z' },
  reference: '3f9a07c2e41b8d5c2a6f90b3c7e14d28',
}

const mockFetch = (response: Response) => vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response))
const mockFetchReject = (error: unknown) => vi.stubGlobal('fetch', vi.fn().mockRejectedValue(error))

beforeEach(() => {
  configureApiBaseUrl('https://api.test')
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('httpCertificateAuthApi', () => {
  it('create POSTs to the cert auth endpoint and resolves the body', async () => {
    mockFetch(new Response(JSON.stringify(createResponse), { status: 200 }))
    const result = await create(PROCESS_ID, {
      challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
      challengeMethod: 'S256',
      returnUrl: 'https://app.vocdoni.io/ca/processes/6650f0c0a1b2c3d4e5f60718',
      purpose: 'vote',
    })
    const [url] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string]
    expect(url).toBe(`https://api.test/processes/${PROCESS_ID}/auth/cert?lang=en`)
    expect(result).toEqual(createResponse)
  })

  it('redeem POSTs to the redeem endpoint and passes signal', async () => {
    mockFetch(new Response(JSON.stringify(redeemResponse), { status: 200 }))
    const signal = new AbortController().signal
    await redeem(PROCESS_ID, { code: 'code-abc', verifier: 'verifier-abc' }, signal)
    const [url, opts] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
    expect(url).toContain(`/processes/${PROCESS_ID}/auth/cert/redeem`)
    expect(opts.signal).toBe(signal)
  })

  it('rejects with CertAuthError reason dni_not_in_census and keeps holder on 403', async () => {
    mockFetch(
      new Response(
        JSON.stringify({
          error: 'certificate is not in the census',
          code: 40950,
          data: {
            reason: 'dni_not_in_census',
            holder: { fullName: 'Jordi Puig Serra', documentType: 'NIE', documentEnding: '567L' },
          },
        }),
        { status: 403 }
      )
    )
    await expect(redeem(PROCESS_ID, { code: 'c', verifier: 'v' })).rejects.toMatchObject({
      reason: 'dni_not_in_census',
      data: { holder: { fullName: 'Jordi Puig Serra' } },
    })
  })

  it('rejects with reason internal when 400 response has no data.reason', async () => {
    mockFetch(new Response(JSON.stringify({ error: 'bad request', code: 400 }), { status: 400 }))
    await expect(
      create(PROCESS_ID, { challenge: 'c', challengeMethod: 'S256', returnUrl: 'https://r', purpose: 'vote' })
    ).rejects.toMatchObject({
      reason: 'internal',
    })
  })

  it('rejects with reason network when fetch throws TypeError', async () => {
    mockFetchReject(new TypeError('Failed to fetch'))
    await expect(redeem(PROCESS_ID, { code: 'c', verifier: 'v' })).rejects.toMatchObject({
      reason: 'network',
    })
  })

  it('re-throws TimeoutError DOMException from redeem without wrapping', async () => {
    const timeout = new DOMException('x', 'TimeoutError')
    mockFetchReject(timeout)
    await expect(redeem(PROCESS_ID, { code: 'c', verifier: 'v' })).rejects.toBe(timeout)
  })

  describe('probe', () => {
    it('resolves on 200', async () => {
      mockFetch(new Response('{"ok":true}', { status: 200 }))
      await expect(probe('https://probe.example')).resolves.toBeUndefined()
    })

    it('rejects with reason network on 500', async () => {
      mockFetch(new Response('error', { status: 500 }))
      await expect(probe('https://probe.example')).rejects.toMatchObject({ reason: 'network' })
    })

    it('rejects with reason network when fetch throws', async () => {
      mockFetchReject(new TypeError('net fail'))
      await expect(probe('https://probe.example')).rejects.toMatchObject({ reason: 'network' })
    })

    it('calls fetch with cors/no-store/omit options', async () => {
      mockFetch(new Response('{"ok":true}', { status: 200 }))
      await probe('https://probe.example')
      const [, opts] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [string, RequestInit]
      expect(opts).toMatchObject({ mode: 'cors', cache: 'no-store', credentials: 'omit' })
    })
  })
})

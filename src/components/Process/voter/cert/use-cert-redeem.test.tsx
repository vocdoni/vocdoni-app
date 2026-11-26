import { act, renderHook } from '@testing-library/react'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { ReactNode } from 'react'
import { AllProviders } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { useCertRedeem } from './use-cert-redeem'

const auth0 = vi.fn()
const request = { certCode: 'c'.repeat(43), codeVerifier: 'v'.repeat(43) }
const refused = (code: number, data?: Record<string, unknown>) =>
  new VocdoniApiError(400, { error: 'auth failed', code, data }, 'auth failed', code)

const wrapper = ({ children }: { children: ReactNode }) => <AllProviders>{children}</AllProviders>

/** The message the redeem rejects with, for a step-0 request that the SDK answers with `error`. */
const failureOf = async (sent: object, error: unknown) => {
  auth0.mockRejectedValueOnce(error)
  const { result } = renderHook(() => useCertRedeem(), { wrapper })
  let message = ''
  await act(async () => {
    await result.current.mutateAsync(sent as Parameters<typeof result.current.mutateAsync>[0]).catch((e: Error) => {
      message = e.message
    })
  })
  return message
}

beforeEach(() => {
  auth0.mockReset().mockResolvedValue(undefined)
  setReactProvidersMock({ useElectionAuth: () => ({ connected: false, auth0 }) })
})
afterEach(() => resetReactProvidersMock())

describe('useCertRedeem', () => {
  it('sends the code with its verifier, the contact of a 2FA census included', async () => {
    const { result } = renderHook(() => useCertRedeem(), { wrapper })
    await act(() => result.current.mutateAsync({ ...request, email: 'voter@example.com' }))
    expect(auth0).toHaveBeenCalledWith({ ...request, email: 'voter@example.com' })
  })

  it('a refused code (40802) says the certificate sign-in expired, with no census claim', async () => {
    expect(await failureOf(request, refused(40802))).toBe('csp.cert.errors.code_refused')
  })

  it('a refused code (40802) with a contact also blames the contact, which may not match', async () => {
    expect(await failureOf({ ...request, phone: '+34600000000' }, refused(40802))).toBe(
      'csp.cert.errors.code_refused_contact'
    )
  })

  it('an older backend answers a refused code with 40029, read the same way', async () => {
    expect(await failureOf({ ...request, email: 'voter@example.com' }, refused(40029))).toBe(
      'csp.cert.errors.code_refused_contact'
    )
  })

  it('rate limits keep their own sentence (40017)', async () => {
    expect(await failureOf(request, refused(40017))).toBe('Too many attempts. Please try again later.')
  })

  it('a failure the app does not word keeps the generic certificate sentence, and is logged', async () => {
    const logged = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(await failureOf(request, new Error('network down'))).toBe('csp.cert.errors.generic')
    expect(logged).toHaveBeenCalled()
    logged.mockRestore()
  })
})

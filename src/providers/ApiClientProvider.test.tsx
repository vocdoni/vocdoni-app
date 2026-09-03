import { act, renderHook } from '@testing-library/react'
import { AuthProvider as SdkAuthProvider, useAuth as useSdkAuth } from '@vocdoni/react-providers'
import type { ReactNode } from 'react'
import { AppEnvProvider } from '~src/app-env'
import { buildAppEnv } from '~src/app-env-build'
import { ApiClientProvider, AUTH_STORAGE_KEY, useApiClient } from '~src/providers/ApiClientProvider'

// The global setup stubs the react-providers `useClient` (which `useApiClient`
// re-exports) so component tests don't need a real ClientProvider. This suite is
// exactly about that real wiring, so restore the actual module.
vi.unmock('@vocdoni/react-providers')

const jsonResponse = (body: unknown) =>
  new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } })

// Mirrors the app tree (Providers.tsx): the API client mounts outside the auth
// provider and reads the persisted token through its by-reference getter.
const wrapper = ({ children }: { children: ReactNode }) => (
  <AppEnvProvider value={buildAppEnv({})}>
    <ApiClientProvider>
      <SdkAuthProvider storageKey={AUTH_STORAGE_KEY}>{children}</SdkAuthProvider>
    </ApiClientProvider>
  </AppEnvProvider>
)

const authorizationOfLastRequest = (fetchSpy: ReturnType<typeof vi.spyOn>) => {
  const [, init] = fetchSpy.mock.calls.at(-1) as [RequestInfo, RequestInit | undefined]
  return new Headers(init?.headers).get('Authorization')
}

describe('ApiClientProvider + SdkAuthProvider token wiring', () => {
  let fetchSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    localStorage.clear()
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ addresses: [] }))
  })

  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('sends the session token set through setSession (login) on API client requests', async () => {
    const { result } = renderHook(() => ({ auth: useSdkAuth(), api: useApiClient() }), { wrapper })

    act(() => {
      result.current.auth.setSession({ token: 'fresh-login-token', expirity: '2030-01-01T00:00:00Z' })
    })

    // The session is persisted under the shared storage key…
    expect(localStorage.getItem(`${AUTH_STORAGE_KEY}.token`)).toBe('fresh-login-token')

    // …and the client (mounted before/outside the auth provider) picks it up.
    await result.current.api.client.auth.addresses()
    expect(authorizationOfLastRequest(fetchSpy)).toBe('Bearer fresh-login-token')
  })

  it('authenticates with a previously persisted session (page reload)', async () => {
    localStorage.setItem(`${AUTH_STORAGE_KEY}.token`, 'restored-token')
    localStorage.setItem(`${AUTH_STORAGE_KEY}.expiry`, '2030-01-01T00:00:00Z')

    const { result } = renderHook(() => ({ auth: useSdkAuth(), api: useApiClient() }), { wrapper })

    expect(result.current.auth.isAuthenticated).toBe(true)

    await result.current.api.client.auth.addresses()
    expect(authorizationOfLastRequest(fetchSpy)).toBe('Bearer restored-token')
  })

  it('stops sending the token after logout', async () => {
    const { result } = renderHook(() => ({ auth: useSdkAuth(), api: useApiClient() }), { wrapper })

    act(() => {
      result.current.auth.setSession({ token: 'short-lived-token', expirity: '2030-01-01T00:00:00Z' })
    })
    act(() => {
      result.current.auth.logout()
    })

    expect(localStorage.getItem(`${AUTH_STORAGE_KEY}.token`)).toBeNull()

    await result.current.api.client.auth.addresses()
    expect(authorizationOfLastRequest(fetchSpy)).toBeNull()
  })
})

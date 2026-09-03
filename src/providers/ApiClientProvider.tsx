import { ClientProvider, useClient } from '@vocdoni/react-providers'
import { PropsWithChildren } from 'react'
import { useAppEnv } from '~src/app-env'

// Base key the react-providers AuthProvider persists the session under: it writes
// `${AUTH_STORAGE_KEY}.token` and `${AUTH_STORAGE_KEY}.expiry`. Kept in one place so
// the token getter below and the <AuthProvider storageKey> in Providers stay in sync.
export const AUTH_STORAGE_KEY = 'auth'

// Token getter for the integrator-sdk client. It is passed by reference to
// ClientProvider and evaluated on every request, so it always reads the freshest
// bearer written by the AuthProvider (login / setSession). SSR-safe.
const readToken = () => (typeof localStorage === 'undefined' ? null : localStorage.getItem(`${AUTH_STORAGE_KEY}.token`))

/**
 * Mounts the new integrator-sdk `VocdoniApiClient` (from @vocdoni/react-providers)
 * for the whole authenticated app. Exposed through `useApiClient()` to avoid the
 * name clash with the legacy `useClient()` from @vocdoni/react-components.
 */
export const ApiClientProvider = ({ children }: PropsWithChildren) => {
  const { SAAS_URL } = useAppEnv()

  return (
    <ClientProvider apiUrl={SAAS_URL} authToken={readToken}>
      {children}
    </ClientProvider>
  )
}

// Re-exported under an app-specific name so consumers never confuse it with the
// legacy SDK client hook.
export { useClient as useApiClient } from '@vocdoni/react-providers'

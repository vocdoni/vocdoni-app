import { useQuery, useQueryClient } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import { AuthStorageKeys, clearAuthStorageKeys } from '@vocdoni/rainbowkit-wallets'
import { useAuth as useSdkAuth } from '@vocdoni/react-providers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDisconnect } from 'wagmi'
import { api, ApiEndpoints, ApiParams } from '~components/Auth/api'
import { useLogin, useRegister, useVerifyMail } from '~components/Auth/authQueries'
import { useToast } from '~components/Toast'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { sameAddress } from '~utils/address'

export enum LocalStorageKeys {
  // The organization address the session is currently acting as (multi-org accounts).
  SignerAddress = 'signerAddress',
}

/**
 * Whether the API answered with a 4xx, i.e. a definitive "no" rather than a
 * failure to reach it. Retrying those only delays the answer.
 */
export const isClientError = (error: unknown) =>
  error instanceof VocdoniApiError && error.status >= 400 && error.status < 500

const getStorageItem = (key: string) => (typeof localStorage === 'undefined' ? null : localStorage.getItem(key))
const setStorageItem = (key: string, value: string) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(key, value)
}
export const useAuthProvider = () => {
  // Token lifecycle (token, expiry, persistence, refresh, logout) is owned by the
  // react-providers AuthProvider. This hook layers the app-specific pieces on top:
  // register/verify/password REST, OAuth token injection, the active organization
  // address (formerly resolved through the SDK RemoteSigner) and routing.
  const { token: bearer, expiry, isAuthenticated, setSession, logout: sdkLogout } = useSdkAuth()
  const { client: apiClient } = useApiClient()
  const toast = useToast()
  const { disconnect } = useDisconnect()
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const login = useLogin({
    onSuccess: (data) => {
      setSession(data)
    },
  })
  const register = useRegister({
    onSuccess: () =>
      toast({
        type: 'success',
        title: t('registration_successful', { defaultValue: 'Registration successful' }),
        description: t('please_check_email_to_verify', {
          defaultValue: 'Please check your email to verify your account',
        }),
      }),
    onError: (error) => {
      toast({
        type: 'error',
        title: t('registration_failed', { defaultValue: 'Registration failed' }),
        description: error.message,
      })
    },
  })
  const mailVerify = useVerifyMail({
    onSuccess: (data) => {
      setSession(data)
    },
  })

  const bearedFetch = useCallback(
    <T>(path: string, { headers = new Headers({}), ...params }: ApiParams = {}) => {
      if (bearer) {
        headers.append('Authorization', `Bearer ${bearer}`)
      }
      return api<T>(path, { headers, ...params })
    },
    [bearer]
  )

  // --- Active organization address -------------------------------------------------
  // Replaces the RemoteSigner: the list of org addresses the logged-in user owns comes
  // from the SaaS API via the new client, and the "selected" one is persisted so a
  // multi-org user resumes their last-used organization.
  const {
    data: addressesData,
    isLoading: addressesLoading,
    error: addressesError,
    refetch: refetchAddresses,
  } = useQuery({
    queryKey: ['auth', 'addresses', bearer],
    queryFn: () => apiClient.auth.addresses(),
    enabled: !!bearer,
    // "This account owns no organizations" and "we could not find out" must not
    // collapse into the same outcome: the first sends the user to onboarding,
    // the second is a transient failure. The API answers the first with a 4xx,
    // so those resolve immediately; a 5xx or a dropped connection is retried,
    // and if it still fails `addressesError` lets consumers say so instead of
    // showing an org-owning user the "you have no organizations" screen.
    retry: (failureCount, error) => failureCount < 2 && !isClientError(error),
    // A user with no organization yet legitimately has no addresses; don't surface it.
    throwOnError: false,
  })
  const addresses = useMemo(() => addressesData?.addresses ?? [], [addressesData])

  // Bumped by refreshAddresses so the selection re-reads SignerAddress even when the
  // refetched list is structurally identical (same data object, so the memo would not rerun).
  const [selectionVersion, setSelectionVersion] = useState(0)

  // `currentAddress` must never surface a value that hasn't been checked against the
  // logged-in account's address list: the stored SignerAddress key survives logout (by
  // design, see `logout` below) so it can belong to a *previous* user on this browser.
  // It is derived from the address list of the current session (no list, no address), and
  // in the same render the list arrives, so a loaded session never lacks its address.
  // Prefer the stored selection when the user still owns it, otherwise the first address.
  const selection = useMemo(() => {
    const stored = getStorageItem(LocalStorageKeys.SignerAddress) ?? undefined
    const list = addressesData?.addresses ?? []
    // Normalized comparison: the stored value may differ from the API list in case or
    // `0x` prefix (checksummed wallets, unprefixed SAAS reads). Always persist and
    // expose the canonical value from the list, not the stored variant.
    const address =
      addressesData && list.length ? list.find((a) => stored && sameAddress(a, stored)) || list[0] : undefined
    // Settled: the list arrived, or the API gave a definitive "no" (a 4xx, e.g. 404 "user has no
    // organizations"). A stored value that is not the selected address was then not confirmed, so
    // anything fetched for it while the list was pending (see `unconfirmedAddress`) must go.
    const settled = !!addressesData || isClientError(addressesError)
    const rejected = settled && stored && stored !== address ? stored : undefined
    return { address, rejected, version: selectionVersion }
  }, [addressesData, addressesError, selectionVersion])
  const currentAddress = selection.address

  useEffect(() => {
    if (selection.rejected) {
      const rejected = selection.rejected
      queryClient.removeQueries({ predicate: (query) => query.queryKey.includes(rejected) })
    }
    if (selection.address) setStorageItem(LocalStorageKeys.SignerAddress, selection.address)
  }, [selection, queryClient])

  // The stored selection while the address list for this session is still pending. The
  // private app prefetches it so its data is ready when the list confirms it. Unconfirmed:
  // never render data keyed by it; render through `currentAddress` only.
  const unconfirmedAddress =
    bearer && !addressesData && !addressesError
      ? (getStorageItem(LocalStorageKeys.SignerAddress) ?? undefined)
      : undefined

  // Re-fetch the address list and re-apply the selection. Callers that change the active
  // org (org switcher, freshly created/provisioned org) set SignerAddress first, then call
  // this so currentAddress and every address-keyed query pick up the new selection.
  const refreshAddresses = useCallback(async () => {
    await refetchAddresses()
    setSelectionVersion((version) => version + 1)
  }, [refetchAddresses])

  const logout = useCallback(() => {
    clearAuthStorageKeys()
    sdkLogout()
    disconnect()
    // Wipe the query cache so a different account logging in afterwards doesn't inherit the
    // previous user's profile (the profile key is static). Without this, e.g. an integrator's
    // cached org survives logout and the next non-integrator login is misrouted to /integrators.
    // We intentionally keep signerAddress: the same user resumes their last-selected org, and
    // refreshAddresses overwrites it when a different user doesn't own that address.
    queryClient.clear()
  }, [disconnect, queryClient, sdkLogout])

  // The stored token is trusted blindly on load (`isAuthenticated` is just "a token exists"),
  // so the address list doubles as the session probe. The backend only answers it with a 401
  // when its auth middleware rejects the token itself (revoked, expired, user gone), so drop
  // the dead session here. Staying "authenticated" with a token every request rejects leaves
  // the guards stuck on the loading screen. Other 401s are not a signal: the API also uses
  // them for per-resource permission denials, which must not log anyone out.
  useEffect(() => {
    if (bearer && addressesError instanceof VocdoniApiError && addressesError.status === 401) {
      logout()
    }
  }, [addressesError, bearer, logout])

  const isAuthLoading = useMemo(() => isAuthenticated && addressesLoading, [isAuthenticated, addressesLoading])

  return {
    isAuthenticated,
    bearer,
    expiry,
    login,
    register,
    mailVerify,
    logout,
    bearedFetch,
    isAuthLoading,
    // Active organization address surface (replaces the former RemoteSigner helpers
    // updateSigner / signerRefresh / setBearer).
    addresses,
    currentAddress,
    unconfirmedAddress,
    refreshAddresses,
    // Set only when the address list could not be read at all (after retries).
    // Distinguishes "this account owns no organizations" from "we don't know".
    addressesError,
    // Inject a session obtained out-of-band (OAuth). Reads token + expiry from the
    // rainbowkit storage the OAuth wallet wrote.
    setSession,
  }
}

/**
 * Injects a token obtained out-of-band (e.g. the Google OAuth wallet, which persists it
 * under the rainbowkit AuthStorageKeys) into the react-providers session.
 */
export const readOAuthSession = () => {
  const token = getStorageItem(AuthStorageKeys.Token)
  if (!token) return null
  return { token, expirity: getStorageItem(AuthStorageKeys.Expiry) ?? '' }
}

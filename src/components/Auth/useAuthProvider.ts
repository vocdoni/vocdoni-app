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

  // `currentAddress` must never surface a value that hasn't been checked against the
  // logged-in account's address list: the stored SignerAddress key survives logout (by
  // design, see `logout` below) so it can belong to a *previous* user on this browser.
  // Seeding it here as the initial state used to expose that stale value to every
  // address-keyed query (org info, subscription, ...) for the whole window until the
  // `auth/addresses` query resolved. Start unset instead; `applySelection` below is the
  // only place allowed to set it, and it only runs once the address list is known.
  const [currentAddress, setCurrentAddress] = useState<string | undefined>(undefined)

  // Pick the active address from an address list: prefer the stored selection when it is
  // still owned by the user, otherwise fall back to the first one. Persists the choice.
  // Only called once the address list for the current session is known, so the address it
  // sets has always been validated as belonging to the logged-in account.
  const applySelection = useCallback((list: string[]) => {
    if (!list.length) {
      setCurrentAddress(undefined)
      return
    }
    // Normalized comparison: the stored value may differ from the API list in case or
    // `0x` prefix (checksummed wallets, unprefixed SAAS reads). Always persist and
    // expose the canonical value from the list, not the stored variant.
    const stored = getStorageItem(LocalStorageKeys.SignerAddress)
    const selected = (stored && list.find((address) => sameAddress(address, stored))) || list[0]
    setStorageItem(LocalStorageKeys.SignerAddress, selected)
    setCurrentAddress(selected)
  }, [])

  useEffect(() => {
    if (!addressesData) return
    applySelection(addressesData.addresses ?? [])
  }, [addressesData, applySelection])

  // Re-fetch the address list and re-apply the selection. Callers that change the active
  // org (org switcher, freshly created/provisioned org) set SignerAddress first, then call
  // this so currentAddress and every address-keyed query pick up the new selection.
  const refreshAddresses = useCallback(async () => {
    const res = await refetchAddresses()
    applySelection(res.data?.addresses ?? [])
  }, [refetchAddresses, applySelection])

  const logout = useCallback(() => {
    clearAuthStorageKeys()
    sdkLogout()
    setCurrentAddress(undefined)
    disconnect()
    // Wipe the query cache so a different account logging in afterwards doesn't inherit the
    // previous user's profile (the profile key is static). Without this, e.g. an integrator's
    // cached org survives logout and the next non-integrator login is misrouted to /integrators.
    // We intentionally keep signerAddress: the same user resumes their last-selected org, and
    // refreshAddresses overwrites it when a different user doesn't own that address.
    queryClient.clear()
  }, [disconnect, queryClient, sdkLogout])

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

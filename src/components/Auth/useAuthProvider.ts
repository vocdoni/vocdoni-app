import { useMutation } from '@tanstack/react-query'
import { clearAuthStorageKeys } from '@vocdoni/rainbowkit-wallets'
import { useClient } from '@vocdoni/react-components'
import { NoOrganizationsError, RemoteSigner, UnauthorizedError } from '@vocdoni/sdk'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDisconnect } from 'wagmi'
import { clearProcessAuthenticatedIdentifiers } from '~components/Process/authenticatedVoterLabel'
import { AppEnv } from '~src/app-env'
import { api, ApiEndpoints, ApiParams } from '~components/Auth/api'
import { LoginResponse, useLogin, useRegister, useVerifyMail } from '~components/Auth/authQueries'
import { useToast } from '~components/Toast'

export enum LocalStorageKeys {
  Token = 'authToken',
  Expiry = 'authExpiry',
  RenewSession = 'authRenewSession',
  SignerAddress = 'signerAddress',
}

// One week in milliseconds
const OneWeek = 7 * 24 * 60 * 60 * 1000

const getStorageItem = (key: string) => (typeof localStorage === 'undefined' ? null : localStorage.getItem(key))
const setStorageItem = (key: string, value: string) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(key, value)
}
const removeStorageItem = (key: string) => {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(key)
}

/**
 * Mutation to set the RemoteSigner and check its address
 * This hook is used as state to determine if an address is associated to the Signer to redirect
 * to create organization page if not.
 */
const useSigner = () => {
  const { setSigner } = useClient()

  const updateSigner = useCallback(
    async (token?: string) => {
      const t = token || getStorageItem(LocalStorageKeys.Token)

      const signer = new RemoteSigner({
        url: AppEnv.SAAS_URL,
        token: t,
      })

      // Once the signer is set, try to get the signer address
      try {
        const addresses = await signer.remoteSignerService.addresses()
        if (!addresses.length) {
          throw new Error('No addresses available')
        }

        // Get stored address from local storage
        const storedAddress = getStorageItem(LocalStorageKeys.SignerAddress)

        // Use stored address if it exists and is in the available addresses, otherwise use first address
        const selectedAddress = storedAddress && addresses.includes(storedAddress) ? storedAddress : addresses[0]

        // Store the selected address
        setStorageItem(LocalStorageKeys.SignerAddress, selectedAddress)

        // Set the signer address and update the client
        signer.address = selectedAddress
        setSigner(signer)

        return signer
      } catch (e) {
        // If is NoOrganizationsError ignore the error
        if (!(e instanceof NoOrganizationsError)) {
          throw e
        }
      }
    },
    [setSigner]
  )

  return useMutation<RemoteSigner, Error, string>({ mutationFn: updateSigner })
}

export const useAuthProvider = () => {
  const { signer: clientSigner, clear } = useClient()
  const [bearer, setBearer] = useState<string | null>(() => getStorageItem(LocalStorageKeys.Token))
  const toast = useToast()
  const { disconnect } = useDisconnect()
  const { t } = useTranslation()

  const login = useLogin({
    onSuccess: (data) => {
      storeLogin(data)
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
      storeLogin(data)
    },
  })
  const { mutateAsync: updateSigner, isIdle: signerIdle, isPending: signerPending } = useSigner()

  const bearedFetch = useCallback(
    <T>(path: string, { headers = new Headers({}), ...params }: ApiParams = {}) => {
      if (bearer) {
        headers.append('Authorization', `Bearer ${bearer}`)
      }
      return api<T>(path, { headers, ...params })
    },
    [bearer]
  )

  const storeLogin = useCallback(
    ({ token, expirity }: LoginResponse, renewSession = false) => {
      setStorageItem(LocalStorageKeys.Token, token)
      setStorageItem(LocalStorageKeys.Expiry, expirity)
      if (renewSession) {
        setStorageItem(LocalStorageKeys.RenewSession, 'true')
      }
      setBearer(token)
      updateSigner(token)
    },
    [updateSigner]
  )

  const logout = useCallback(() => {
    clearAuthStorageKeys()
    clearProcessAuthenticatedIdentifiers()
    removeStorageItem(LocalStorageKeys.RenewSession)
    setBearer(null)
    clear()
    disconnect()
  }, [clear, disconnect])

  const refreshToken = useCallback(async () => {
    try {
      const response = await api<LoginResponse>(ApiEndpoints.Refresh, { method: 'POST' })
      storeLogin(response)
    } catch (e) {
      toast({
        type: 'error',
        title: t('session_expired', { defaultValue: 'Session expired' }),
        description: t('session_expired_description', {
          defaultValue: 'Session may have been expired and it could not be refreshed, please login again',
        }),
      })
      logout()
      throw e
    }
  }, [logout, storeLogin, t, toast])

  // Handle token refresh
  useEffect(() => {
    if (!bearer) return

    const expiry = getStorageItem(LocalStorageKeys.Expiry)
    const renewSession = getStorageItem(LocalStorageKeys.RenewSession)

    if (!expiry || !renewSession) return

    const expiryDate = new Date(expiry)
    const now = new Date()
    const timeUntilExpiry = expiryDate.getTime() - now.getTime()

    // If token is expired, logout
    if (timeUntilExpiry <= 0) {
      logout()
      return
    }

    // If token expires in less than a week, refresh it
    if (timeUntilExpiry <= OneWeek) {
      refreshToken()
    }
  }, [bearer, logout, refreshToken])

  const signerRefresh = useCallback(async () => {
    if (bearer) {
      try {
        return await updateSigner(bearer)
      } catch (e) {
        if (e instanceof UnauthorizedError) {
          logout()
        }
      }
    }
  }, [bearer, logout, updateSigner])

  // If no signer but berarer instantiate the signer
  // For example when bearer is on local storage but no login was done to instantiate the signer
  useEffect(() => {
    if (!clientSigner) {
      signerRefresh()
    }
  }, [clientSigner, signerRefresh])

  const isAuthenticated = useMemo(() => !!bearer, [bearer])
  const isAuthLoading = useMemo(
    () => (isAuthenticated && signerIdle) || (isAuthenticated && !signerIdle && signerPending),
    [isAuthenticated, signerIdle, signerPending]
  )

  return {
    isAuthenticated,
    bearer,
    setBearer,
    updateSigner,
    login,
    register,
    mailVerify,
    logout,
    bearedFetch,
    isAuthLoading,
    signerRefresh,
  }
}

import { useToast } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { useClient } from '@vocdoni/react-providers'
import { NoOrganizationsError, RemoteSigner, UnauthorizedError } from '@vocdoni/sdk'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDisconnect } from 'wagmi'
import { api, ApiEndpoints, ApiParams } from '~components/Auth/api'
import { LoginResponse, useLogin, useRegister, useVerifyMail } from '~components/Auth/authQueries'

export enum LocalStorageKeys {
  Token = 'authToken',
  Expiry = 'authExpiry',
  RenewSession = 'authRenewSession',
  SignerAddress = 'signerAddress',
}

// One week in milliseconds
const OneWeek = 7 * 24 * 60 * 60 * 1000

/**
 * Mutation to set the RemoteSigner and check its address
 * This hook is used as state to determine if an address is associated to the Signer to redirect
 * to create organization page if not.
 */
const useSigner = () => {
  const { setSigner, fetchAccount, client, setClient } = useClient()

  const updateSigner = useCallback(async (token?: string) => {
    const t = token || localStorage.getItem(LocalStorageKeys.Token)

    const signer = new RemoteSigner({
      url: import.meta.env.SAAS_URL,
      token: t,
    })

    // Once the signer is set, try to get the signer address
    try {
      const addresses = await signer.remoteSignerService.addresses()
      if (!addresses.length) {
        throw new Error('No addresses available')
      }

      // Get stored address from local storage
      const storedAddress = localStorage.getItem(LocalStorageKeys.SignerAddress)

      // Use stored address if it exists and is in the available addresses, otherwise use first address
      const selectedAddress = storedAddress && addresses.includes(storedAddress) ? storedAddress : addresses[0]

      // Store the selected address
      localStorage.setItem(LocalStorageKeys.SignerAddress, selectedAddress)

      // Set the signer address and update the client
      signer.address = selectedAddress
      setSigner(signer)

      // update client, since it's the one used for some queries
      client.wallet = signer
      setClient(client)

      await fetchAccount()

      return signer
    } catch (e) {
      // If is NoOrganizationsError ignore the error
      if (!(e instanceof NoOrganizationsError)) {
        throw e
      }
    }
  }, [])

  return useMutation<RemoteSigner, Error, string>({ mutationFn: updateSigner })
}

export const useAuthProvider = () => {
  const { signer: clientSigner, clear } = useClient()
  const [bearer, setBearer] = useState<string | null>(localStorage.getItem(LocalStorageKeys.Token))
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
        status: 'success',
        title: t('registration_successful', { defaultValue: 'Registration successful' }),
        description: t('please_check_email_to_verify', {
          defaultValue: 'Please check your email to verify your account',
        }),
      }),
    onError: (error) => {
      toast({
        status: 'error',
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

  const storeLogin = useCallback(({ token, expirity }: LoginResponse, renewSession = false) => {
    localStorage.setItem(LocalStorageKeys.Token, token)
    localStorage.setItem(LocalStorageKeys.Expiry, expirity)
    if (renewSession) {
      localStorage.setItem(LocalStorageKeys.RenewSession, 'true')
    }
    setBearer(token)
    updateSigner(token)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(LocalStorageKeys.Token)
    localStorage.removeItem(LocalStorageKeys.Expiry)
    localStorage.removeItem(LocalStorageKeys.RenewSession)
    setBearer(null)
    clear()
    disconnect()
  }, [])

  const refreshToken = useCallback(async () => {
    try {
      const response = await api<LoginResponse>(ApiEndpoints.Refresh, { method: 'POST' })
      storeLogin(response)
    } catch (e) {
      toast({
        status: 'error',
        title: t('session_expired', { defaultValue: 'Session expired' }),
        description: t('session_expired_description', {
          defaultValue: 'Session may have been expired and it could not be refreshed, please login again',
        }),
      })
      logout()
      throw e
    }
  }, [])

  // Handle token refresh
  useEffect(() => {
    if (!bearer) return

    const expiry = localStorage.getItem(LocalStorageKeys.Expiry)
    const renewSession = localStorage.getItem(LocalStorageKeys.RenewSession)

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
  }, [bearer])

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
  }, [bearer, clientSigner])

  // If no signer but berarer instantiate the signer
  // For example when bearer is on local storage but no login was done to instantiate the signer
  useEffect(() => {
    if (!clientSigner) {
      signerRefresh()
    }
  }, [bearer, clientSigner])

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

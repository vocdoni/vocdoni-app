import { Button, Icon } from '@chakra-ui/react'
import { AuthStorageKeys, saasOAuthWallet } from '@vocdoni/rainbowkit-wallets'
import { readOAuthSession } from '~components/Auth/useAuthProvider'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BsGoogle } from 'react-icons/bs'
import { useNavigate } from 'react-router'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useToast } from '~components/Toast'
import { useAppEnv } from '~src/app-env'
import { Routes } from '~src/router/routes'
import { useAuth } from './useAuth'

const GoogleAuth = () => {
  const { setSession, refreshAddresses } = useAuth()
  const appEnv = useAppEnv()
  const navigate = useNavigate()
  const { isConnected, connector } = useAccount()
  const { disconnect } = useDisconnect()
  const { t } = useTranslation()
  const toast = useToast()

  const { connect, isPending, isError, error } = useConnect()

  useEffect(() => {
    if (isError) {
      console.error('Google OAuth error', error?.message || '')
      const isOAuthConflictError = error?.message.indexOf('OAuthAccountConflictError') !== -1
      toast({
        type: 'error',
        title: t('google_oauth_error', { defaultValue: 'Google OAuth Error' }),
        description: isOAuthConflictError
          ? t('google_oauth_conflict_error', {
              defaultValue: 'An account with this email already exists. Please sign in using your existing method.',
            })
          : t('google_oauth_error_description', {
              defaultValue: 'Google OAuth error, please try again',
            }),
      })
      return
    }
    if (isConnected && connector?.id === 'google') {
      // The OAuth wallet persists the token (and expiry) under the rainbowkit keys;
      // inject it into the react-providers session and resolve the org address(es).
      const session = readOAuthSession()
      if (session) {
        setSession(session)
        refreshAddresses()
      }
      const registered = localStorage.getItem(AuthStorageKeys.Registered)
      const isRegistered = registered === 'true' || registered === '1' || (registered as unknown) === true
      if (isRegistered) {
        localStorage.removeItem(AuthStorageKeys.Registered)
        navigate(Routes.auth.organizationCreate)
      }
      disconnect() // Disconnect the wallet after successful authentication (session is maintained via token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isError, connector])

  return (
    <Button
      variant='outline'
      loading={isPending}
      onClick={() => {
        const wallet = saasOAuthWallet({
          id: 'google',
          name: 'Google',
          iconUrl: 'https://authjs.dev/img/providers/google.svg',
          options: {
            oAuthServiceUrl: appEnv.OAUTH_URL,
            oAuthServiceProvider: 'google',
            saasBackendUrl: appEnv.SAAS_URL,
          },
        })
        connect({ connector: wallet.createConnector({} as any) })
      }}
      w='full'
      fontWeight={'bold'}
    >
      <Icon as={BsGoogle} />
      {t('signin_google')}
    </Button>
  )
}

export default GoogleAuth

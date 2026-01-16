import { Button, Icon, useToast } from '@chakra-ui/react'
import { AuthStorageKeys, saasOAuthWallet } from '@vocdoni/rainbowkit-wallets'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BsGoogle } from 'react-icons/bs'
import { useNavigate } from 'react-router-dom'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Routes } from '~src/router/routes'
import { useAuth } from './useAuth'

const GoogleAuth = () => {
  const { setBearer, updateSigner } = useAuth()
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
        status: 'error',
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
      const token = localStorage.getItem(AuthStorageKeys.Token)
      setBearer(token)
      updateSigner(token)
      const registered = localStorage.getItem(AuthStorageKeys.Registered)
      if (registered === 'true') {
        localStorage.removeItem(AuthStorageKeys.Registered)
        navigate(Routes.auth.organizationCreate)
      }
      disconnect() // Disconnect the wallet after successful authentication (session is maintained via token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, isError, connector])

  return (
    <Button
      variant={'outline'}
      isLoading={isPending}
      shouldWrapChildren
      onClick={() => {
        const wallet = saasOAuthWallet({
          id: 'google',
          name: 'Google',
          iconUrl: 'https://authjs.dev/img/providers/google.svg',
          options: {
            oAuthServiceUrl: import.meta.env.OAUTH_URL,
            oAuthServiceProvider: 'google',
            saasBackendUrl: import.meta.env.SAAS_URL,
          },
        })
        connect({ connector: wallet.createConnector({} as any) })
      }}
      w='full'
      fontWeight={'bold'}
      leftIcon={<Icon as={BsGoogle} />}
    >
      {t('signin_google')}
    </Button>
  )
}

export default GoogleAuth

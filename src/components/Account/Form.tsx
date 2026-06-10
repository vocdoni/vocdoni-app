import {
  Button,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  FieldLabel as FormLabel,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { linkSaasOAuth } from '@vocdoni/rainbowkit-wallets'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { BsGoogle, BsLink } from 'react-icons/bs'
import { api, ApiEndpoints, getApiErrorMessage } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { useToast } from '~components/Toast'
import { OAuthProvider, OAuthProviders } from '~constants'
import { QueryKeys } from '~queries/keys'
import { useAppEnv } from '~src/app-env'
import { User, useUpdateProfile } from '~src/queries/account'
import { ChangePasswordButton } from './Password'

interface ProfileFormData {
  firstName: string
  lastName: string
  email: string
}

const AccountForm = ({ profile }: { profile?: User }) => {
  const { t } = useTranslation()
  const toast = useToast()
  const appEnv = useAppEnv()
  const updateProfile = useUpdateProfile()
  const queryClient = useQueryClient()
  const { bearedFetch, bearer } = useAuth()
  const [linkingProvider, setLinkingProvider] = useState<OAuthProvider | null>(null)
  const [unlinkingProvider, setUnlinkingProvider] = useState<OAuthProvider | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    values: profile
      ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
        }
      : undefined,
  })

  const hasPassword = profile?.hasPassword ?? true
  const linkedProviders = useMemo(() => new Set(profile?.providers ?? []), [profile?.providers])

  const providerIcons: Partial<Record<OAuthProvider, typeof BsGoogle>> = {
    google: BsGoogle,
  }

  const linkProvider = useMutation({
    mutationFn: async (provider: OAuthProvider) => {
      if (!bearer) throw new Error('Missing auth token')
      return linkSaasOAuth({
        oAuthServiceUrl: appEnv.OAUTH_URL,
        oAuthServiceProvider: provider,
        saasBackendUrl: appEnv.SAAS_URL,
        provider,
        authToken: bearer,
      })
    },
    onMutate: (provider) => {
      setLinkingProvider(provider)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.profile })
      toast({
        title: t('oauth.link.success', { defaultValue: 'Provider linked successfully' }),
        status: 'success',
      })
    },
    onError: (error: Error) => {
      toast({
        title: t('oauth.link.error', { defaultValue: 'Failed to link provider' }),
        description: error.message,
        status: 'error',
      })
    },
    onSettled: () => {
      setLinkingProvider(null)
    },
  })

  const unlinkProvider = useMutation({
    mutationFn: (provider: OAuthProvider) =>
      bearedFetch<void>(ApiEndpoints.OAuthUnlink.replace('{provider}', provider), { method: 'DELETE' }),
    onMutate: (provider) => {
      setUnlinkingProvider(provider)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.profile })
      toast({
        title: t('oauth.unlink.success', { defaultValue: 'Provider unlinked successfully' }),
        status: 'success',
      })
    },
    onError: (error: Error) => {
      toast({
        title: t('oauth.unlink.error', { defaultValue: 'Failed to unlink provider' }),
        description: getApiErrorMessage(error),
        status: 'error',
      })
    },
    onSettled: () => {
      setUnlinkingProvider(null)
    },
  })

  const requestPasswordReset = useMutation({
    mutationFn: (email: string) =>
      api(ApiEndpoints.PasswordRecovery, {
        method: 'POST',
        body: { email },
      }),
    onSuccess: () => {
      toast({
        title: t('password_request.success', { defaultValue: 'Password reset email sent' }),
        status: 'success',
      })
    },
    onError: (error: Error) => {
      toast({
        title: t('password_request.error', { defaultValue: 'Failed to request password reset' }),
        description: error.message,
        status: 'error',
      })
    },
  })

  const formatProviderLabel = (provider: string) => provider.charAt(0).toUpperCase() + provider.slice(1)

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
      })

      toast({
        title: t('profile.success', { defaultValue: 'Profile updated successfully' }),
        type: 'success',
      })
    } catch (error) {
      toast({
        title: t('profile.error', { defaultValue: 'Failed to update profile' }),
        type: 'error',
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Text fontSize={'2xl'} fontWeight='bold' mb={1.5}>
        {t('account.title', { defaultValue: 'Account Information' })}
      </Text>
      <Text fontSize={'sm'} color={'rgb(115, 115, 115)'} mb={6}>
        {t('account.subtitle', { defaultValue: 'Update your account details and personal information' })}{' '}
      </Text>
      <VStack gap={8} align='stretch'>
        <HStack>
          <FormControl invalid={!!errors.firstName}>
            <FormLabel fontSize={'14px'}>{t('name', { defaultValue: 'Name' })}</FormLabel>
            <Input
              {...register('firstName', {
                required: t('form.error.field_is_required'),
              })}
            />
            <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
          </FormControl>
          <FormControl invalid={!!errors.lastName}>
            <FormLabel fontSize={'14px'}>{t('lastname', { defaultValue: 'Last name' })}</FormLabel>
            <Input
              {...register('lastName', {
                required: t('form.error.field_is_required'),
              })}
            />
            <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
          </FormControl>
        </HStack>

        <FormControl invalid={!!errors.email}>
          <FormLabel fontSize={'14px'}>{t('email', { defaultValue: 'Email' })}</FormLabel>
          <Input {...register('email')} disabled type='email' />
          <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel fontSize={'14px'}>{t('password', { defaultValue: 'Password' })}</FormLabel>
          {hasPassword ? (
            <HStack gap={2}>
              <Input placeholder={'• • • • • • • •'} type='password' disabled />
              <ChangePasswordButton />
            </HStack>
          ) : (
            <Button
              onClick={() => profile?.email && requestPasswordReset.mutate(profile.email)}
              size='sm'
              variant='outline'
              loading={requestPasswordReset.isPending}
              alignSelf='start'
            >
              {t('password_request.action', { defaultValue: 'Request password change' })}
            </Button>
          )}
        </FormControl>

        <VStack gap={3} align='stretch'>
          <Text fontSize={'14px'} fontWeight='600'>
            {t('oauth.title', { defaultValue: 'Connect accounts' })}
          </Text>
          {OAuthProviders.map((provider) => {
            const providerLabel = formatProviderLabel(provider)
            const isLinked = linkedProviders.has(provider)
            const isUnlinking = unlinkingProvider === provider && unlinkProvider.isPending
            const isLinking = linkingProvider === provider && linkProvider.isPending
            const linkLabel = t('oauth.link.action', {
              defaultValue: 'Link {{provider}} account',
              provider: providerLabel,
            })
            const unlinkLabel = t('oauth.unlink.action', {
              defaultValue: 'Unlink {{provider}}',
              provider: providerLabel,
            })
            const providerIcon = providerIcons[provider] || BsLink

            return (
              <HStack key={provider} justify='space-between' flexWrap='wrap' gap={3}>
                {isLinked ? (
                  <Button
                    size='sm'
                    variant='outline'
                    colorPalette='red'
                    onClick={() => {
                      const confirmed = window.confirm(
                        t('oauth.unlink.confirm', {
                          defaultValue: `Unlink {{provider}}?`,
                          provider: providerLabel,
                        })
                      )
                      if (!confirmed) return
                      unlinkProvider.mutate(provider)
                    }}
                    loading={isUnlinking}
                  >
                    <Icon as={providerIcon} /> {unlinkLabel}
                  </Button>
                ) : (
                  <Button
                    variant='outline'
                    loading={isLinking}
                    onClick={() => linkProvider.mutate(provider)}
                    fontWeight={'bold'}
                  >
                    <Icon as={providerIcon} /> {linkLabel}
                  </Button>
                )}
              </HStack>
            )
          })}
        </VStack>

        <Button type='submit' loading={isSubmitting || updateProfile.isPending} alignSelf={'flex-end'}>
          {t('actions.save_changes', { defaultValue: 'Save changes' })}
        </Button>
      </VStack>
    </form>
  )
}

export default AccountForm

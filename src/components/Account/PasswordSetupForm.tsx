import { Button, Flex } from '@chakra-ui/react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { apiErrorDetails, ApiEndpoints, ErrorCode, getApiErrorMessage } from '~components/Auth/api'
import type { LoginResponse } from '~components/Auth/authQueries'
import { useAuth } from '~components/Auth/useAuth'
import InputBasic from '~components/Form/InputBasic'
import InputPassword from '~components/Form/InputPassword'
import { useToast } from '~components/Toast'
import { QueryKeys } from '~queries/keys'
import { Routes } from '~src/router/routes'

type PasswordSetupFormProps = {
  // Code from the emailed link, prefilled but editable; absent when the user signed in first (the redirect drops the query string)
  code?: string
}

type PasswordSetupFormValues = {
  code: string
  newPassword: string
  confirmPassword: string
}

type PasswordSetupParams = {
  code: string
  newPassword: string
}

const PasswordSetupForm = ({ code }: PasswordSetupFormProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { bearedFetch, setSession } = useAuth()
  const methods = useForm<PasswordSetupFormValues>({
    defaultValues: { code: code || '', newPassword: '', confirmPassword: '' },
  })

  const setupPassword = useMutation<LoginResponse, Error, PasswordSetupParams>({
    mutationFn: (body) => bearedFetch<LoginResponse>(ApiEndpoints.PasswordSetupVerify, { method: 'POST', body }),
  })

  const onSubmit = (data: PasswordSetupFormValues) => {
    setupPassword.mutate(
      { code: data.code, newPassword: data.newPassword },
      {
        // setting the password revokes every session, this one included, and answers with a fresh token
        onSuccess: (session) => {
          setSession(session)
          // the bearer still in scope was just revoked: only mark the profile stale, so the profile page
          // refetches it once it renders with the new token
          queryClient.invalidateQueries({ queryKey: QueryKeys.profile, refetchType: 'none' })
          toast({ title: t('password_setup.success', { defaultValue: 'Password set successfully' }), type: 'success' })
          navigate(Routes.dashboard.profile)
        },
        onError: (error) => {
          if (apiErrorDetails(error)?.code === ErrorCode.UserAlreadyHasPassword) {
            queryClient.invalidateQueries({ queryKey: QueryKeys.profile })
            toast({
              title: t('password_setup.already_set', { defaultValue: 'Your account already has a password' }),
              type: 'info',
            })
            navigate(Routes.dashboard.profile)
            return
          }
          toast({
            title: t('password_setup.error', { defaultValue: 'Failed to set the password' }),
            description: getApiErrorMessage(error),
            type: 'error',
          })
        },
      }
    )
  }

  return (
    <FormProvider {...methods}>
      <Flex as='form' onSubmit={methods.handleSubmit(onSubmit)} flexDirection='column' gap='6'>
        <InputBasic
          formValue='code'
          label={t('verification_code', { defaultValue: 'Verification Code' })}
          placeholder={t('verification_code_placeholder', { defaultValue: 'Enter the verification code' })}
          type='text'
          required
        />
        <InputPassword
          formValue='newPassword'
          label={t('new_password', { defaultValue: 'New Password' })}
          placeholder={t('new_password_placeholder', { defaultValue: 'Enter your new password' })}
          required
          validation={{
            minLength: {
              value: 8,
              message: t('password_update.new.minLength', { defaultValue: 'Password must be at least 8 characters' }),
            },
          }}
        />
        <InputPassword
          formValue='confirmPassword'
          label={t('confirm_password', { defaultValue: 'Confirm Password' })}
          placeholder={t('confirm_password_placeholder', { defaultValue: 'Confirm your new password' })}
          required
          validation={{
            validate: (value: string) => value === methods.getValues('newPassword') || t('passwords_do_not_match'),
          }}
        />
        <Button type='submit' w='full' loading={setupPassword.isPending}>
          {t('password_setup.submit', { defaultValue: 'Set password' })}
        </Button>
      </Flex>
    </FormProvider>
  )
}

export default PasswordSetupForm

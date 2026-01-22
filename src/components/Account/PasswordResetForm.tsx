import { Button, Flex, useToast } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { FormProvider, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import InputPassword from '~shared/Form/InputPassword'
import { Routes } from '~src/router/routes'
import { api, ApiEndpoints } from '../Auth/api'
import InputBasic from '../shared/Form/InputBasic'

type PasswordResetFormProps = {
  code?: string
  email?: string
}

type PasswordResetFormValues = {
  code: string
  email: string
  newPassword: string
  confirmPassword: string
}

const PasswordResetForm: React.FC<PasswordResetFormProps> = ({ code, email }) => {
  const toast = useToast()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const methods = useForm<PasswordResetFormValues>({
    defaultValues: {
      code: code || '',
      email: email || '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const resetPasswordMutation = useMutation({
    mutationFn: ({ email, code, newPassword }: PasswordResetFormValues) =>
      api(ApiEndpoints.PasswordReset, {
        method: 'POST',
        body: { email, code, newPassword },
      }),
  })

  const onSubmit = (data: PasswordResetFormValues) => {
    resetPasswordMutation.mutate(data, {
      onSuccess: () => {
        navigate(Routes.auth.signIn)
        toast({
          title: t('password_reset_successful', { defaultValue: 'Password reset successful' }),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      },
      onError: (error) => {
        toast({
          title: t('password_reset_failed', { defaultValue: 'Password reset failed' }),
          description: (error as Error).message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      },
    })
  }

  return (
    <FormProvider {...methods}>
      <Flex as='form' onSubmit={methods.handleSubmit(onSubmit)} flexDirection='column' gap={6}>
        <InputBasic
          formValue='email'
          label={t('email')}
          placeholder={t('email_placeholder', { defaultValue: 'your@email.com' })}
          type='email'
          required
          isDisabled={!!email}
        />
        <InputBasic
          formValue='code'
          label={t('verification_code', { defaultValue: 'Verification Code' })}
          placeholder={t('verification_code_placeholder', { defaultValue: 'Enter the verification code' })}
          type='text'
          required
          isDisabled={!!code}
        />
        <InputPassword
          formValue='newPassword'
          label={t('new_password', { defaultValue: 'New Password' })}
          placeholder={t('new_password_placeholder', { defaultValue: 'Enter your new password' })}
          required
        />
        <InputPassword
          formValue='confirmPassword'
          label={t('confirm_password', { defaultValue: 'Confirm Password' })}
          placeholder={t('confirm_password_placeholder', { defaultValue: 'Confirm your new password' })}
          required
          validation={{
            validate: (value) => value === methods.getValues('newPassword') || t('passwords_do_not_match'),
          }}
        />
        <Button type='submit' fontSize='sm' colorScheme='black' fontWeight='500' w='100%' h={50}>
          <Trans i18nKey='reset_password_button'>Reset Password</Trans>
        </Button>
      </Flex>
    </FormProvider>
  )
}

export default PasswordResetForm

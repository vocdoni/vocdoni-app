import { Button, Flex, useToast } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Routes } from '~src/router/routes'
import { api, ApiEndpoints } from '../Auth/api'
import InputBasic from '../shared/Form/InputBasic'

type ForgotPasswordFormValues = {
  email: string
}

const PasswordForgotForm: React.FC = () => {
  const toast = useToast()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const methods = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: '',
    },
  })

  // Mutation for password recovery using bearedFetch and ApiEndpoints
  const passwordRecoveryMutation = useMutation({
    mutationFn: ({ email }: ForgotPasswordFormValues) =>
      api(ApiEndpoints.PasswordRecovery, {
        method: 'POST',
        body: { email },
      }),
  })

  const onSubmit = (data: ForgotPasswordFormValues) =>
    passwordRecoveryMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: t('password_recovery_sent', { defaultValue: 'Recovery email sent' }),
          description: t('password_recovery_sent_description', {
            defaultValue: 'Check your inbox for the reset link.',
          }),
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        navigate(`${Routes.auth.passwordReset}?email=${encodeURIComponent(data.email)}`)
      },
      onError: (error) => {
        // we actually should not have errors except for internal server errors
        methods.setError('email', { type: 'manual', message: error.message })
        toast({
          title: t('password_recovery_failed', { defaultValue: 'Password recovery failed' }),
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      },
    })

  return (
    <>
      <FormProvider {...methods}>
        <Flex as='form' onSubmit={methods.handleSubmit(onSubmit)} flexDirection='column' gap={6}>
          <InputBasic
            formValue='email'
            label={t('email')}
            placeholder={t('email_placeholder', { defaultValue: 'your@email.com' })}
            type='email'
            required
          />
          <Button type='submit' fontSize='sm' fontWeight='500' w='100%' h={50}>
            {t('forgot_password_reset_link')}
          </Button>
        </Flex>
      </FormProvider>
    </>
  )
}

export default PasswordForgotForm

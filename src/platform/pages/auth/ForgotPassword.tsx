import { Button, Field, Input, Stack, Text } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '~platform/api/client'
import { usePasswordRecovery } from '~platform/auth/authQueries'
import { AuthLayout } from '~platform/components/Layout/AuthLayout'
import { toaster } from '~platform/components/ui/toaster'
import { Routes } from '~platform/routes'

type ForgotFormValues = { email: string }

const ForgotPassword = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotFormValues>()

  const recovery = usePasswordRecovery({
    onSuccess: () => {
      toaster.create({
        type: 'success',
        title: 'Recovery email sent',
        description: 'If the email exists, you will receive a reset code.',
        closable: true,
      })
      navigate(`${Routes.auth.resetPassword}?email=${encodeURIComponent(getValues('email'))}`)
    },
    onError: (error) =>
      toaster.create({
        type: 'error',
        title: 'Could not send recovery email',
        description: getApiErrorMessage(error),
        closable: true,
      }),
  })

  const onSubmit = (values: ForgotFormValues) => recovery.mutate(values)

  return (
    <AuthLayout
      title='Forgot password'
      subtitle='We will email you a code to reset your password.'
      footer={
        <Text>
          Remembered it? <RouterLink to={Routes.auth.login}>Back to sign in</RouterLink>
        </Text>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={4}>
          <Field.Root invalid={!!errors.email} required>
            <Field.Label>Email</Field.Label>
            <Input type='email' {...register('email', { required: 'Email is required' })} />
            <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
          </Field.Root>
          <Button type='submit' loading={recovery.isPending}>
            Send reset code
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  )
}

export default ForgotPassword

import { Button, Field, Input, Stack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '~platform/api/client'
import { usePasswordReset } from '~platform/auth/authQueries'
import { AuthLayout } from '~platform/components/Layout/AuthLayout'
import { toaster } from '~platform/components/ui/toaster'
import { Routes } from '~platform/routes'

type ResetFormValues = {
  email: string
  code: string
  newPassword: string
  confirmPassword: string
}

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ResetFormValues>({
    defaultValues: {
      email: searchParams.get('email') || '',
      code: searchParams.get('code') || '',
    },
  })

  const reset = usePasswordReset({
    onSuccess: () => {
      toaster.create({
        type: 'success',
        title: 'Password updated',
        description: 'You can now sign in.',
        closable: true,
      })
      navigate(Routes.auth.login, { replace: true })
    },
    onError: (error) =>
      toaster.create({
        type: 'error',
        title: 'Could not reset password',
        description: getApiErrorMessage(error),
        closable: true,
      }),
  })

  const onSubmit = (values: ResetFormValues) =>
    reset.mutate({ email: values.email, code: values.code, newPassword: values.newPassword })

  return (
    <AuthLayout title='Reset password' subtitle='Enter the code from your email and choose a new password.'>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={4}>
          <Field.Root invalid={!!errors.email} required>
            <Field.Label>Email</Field.Label>
            <Input type='email' {...register('email', { required: 'Email is required' })} />
            <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!errors.code} required>
            <Field.Label>Reset code</Field.Label>
            <Input {...register('code', { required: 'Code is required' })} />
            <Field.ErrorText>{errors.code?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!errors.newPassword} required>
            <Field.Label>New password</Field.Label>
            <Input
              type='password'
              {...register('newPassword', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
            <Field.ErrorText>{errors.newPassword?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!errors.confirmPassword} required>
            <Field.Label>Confirm new password</Field.Label>
            <Input
              type='password'
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === getValues('newPassword') || 'Passwords do not match',
              })}
            />
            <Field.ErrorText>{errors.confirmPassword?.message}</Field.ErrorText>
          </Field.Root>
          <Button type='submit' loading={reset.isPending}>
            Reset password
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword

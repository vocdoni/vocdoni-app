import { Button, Field, HStack, Input, Stack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { getApiErrorMessage } from '~platform/api/client'
import { IRegisterParams, useRegister } from '~platform/auth/authQueries'
import { AuthLayout } from '~platform/components/Layout/AuthLayout'
import { toaster } from '~platform/components/ui/toaster'
import { Routes } from '~platform/routes'

type RegisterFormValues = IRegisterParams

const Register = () => {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormValues>()

  const registerMutation = useRegister({
    onSuccess: () => {
      toaster.create({
        type: 'success',
        title: 'Account created',
        description: 'Check your email for a verification code.',
        closable: true,
      })
      navigate(`${Routes.auth.verify}?email=${encodeURIComponent(getValues('email'))}`)
    },
    onError: (error) => {
      toaster.create({
        type: 'error',
        title: 'Registration failed',
        description: getApiErrorMessage(error),
        closable: true,
      })
    },
  })

  // Note: no organization-details step — integrators are enabled on an existing org by Vocdoni.
  const onSubmit = (values: RegisterFormValues) => registerMutation.mutate(values)

  return (
    <AuthLayout
      title='Create your account'
      subtitle='Sign up to manage organizations as an integrator.'
      footer={
        <span>
          Already have an account? <RouterLink to={Routes.auth.login}>Sign in</RouterLink>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={4}>
          <HStack gap={4} align='start'>
            <Field.Root invalid={!!errors.firstName} required>
              <Field.Label>First name</Field.Label>
              <Input {...register('firstName', { required: 'Required' })} />
              <Field.ErrorText>{errors.firstName?.message}</Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={!!errors.lastName} required>
              <Field.Label>Last name</Field.Label>
              <Input {...register('lastName', { required: 'Required' })} />
              <Field.ErrorText>{errors.lastName?.message}</Field.ErrorText>
            </Field.Root>
          </HStack>
          <Field.Root invalid={!!errors.email} required>
            <Field.Label>Email</Field.Label>
            <Input type='email' {...register('email', { required: 'Email is required' })} />
            <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!errors.password} required>
            <Field.Label>Password</Field.Label>
            <Input
              type='password'
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!errors.confirm_password} required>
            <Field.Label>Confirm password</Field.Label>
            <Input
              type='password'
              {...register('confirm_password', {
                required: 'Please confirm your password',
                validate: (value) => value === getValues('password') || 'Passwords do not match',
              })}
            />
            <Field.ErrorText>{errors.confirm_password?.message}</Field.ErrorText>
          </Field.Root>
          <Button type='submit' loading={registerMutation.isPending}>
            Create account
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  )
}

export default Register

import { Button, Field, Input, Stack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { getApiErrorMessage, UnverifiedApiError } from '~platform/api/client'
import { useAuth } from '~platform/auth/AuthContext'
import { ILoginParams, useLogin } from '~platform/auth/authQueries'
import { AuthLayout } from '~platform/components/Layout/AuthLayout'
import { toaster } from '~platform/components/ui/toaster'
import { Routes } from '~platform/routes'

const Login = () => {
  const navigate = useNavigate()
  const { storeLogin } = useAuth()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ILoginParams>()

  const login = useLogin({
    onSuccess: (data) => {
      storeLogin(data)
      navigate(Routes.dashboard.overview, { replace: true })
    },
    onError: (error) => {
      // Unverified accounts need to confirm their email first.
      if (error instanceof UnverifiedApiError) {
        navigate(`${Routes.auth.verify}?email=${encodeURIComponent(getValues('email'))}`)
        return
      }
      toaster.create({ type: 'error', title: 'Login failed', description: getApiErrorMessage(error), closable: true })
    },
  })

  const onSubmit = (values: ILoginParams) => login.mutate(values)

  return (
    <AuthLayout
      title='Sign in'
      subtitle='Access your integrator dashboard.'
      footer={
        <Stack gap={1}>
          <span>
            No account? <RouterLink to={Routes.auth.register}>Create one</RouterLink>
          </span>
          <RouterLink to={Routes.auth.forgotPassword}>Forgot your password?</RouterLink>
        </Stack>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={4}>
          <Field.Root invalid={!!errors.email} required>
            <Field.Label>Email</Field.Label>
            <Input type='email' {...register('email', { required: 'Email is required' })} />
            <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
          </Field.Root>
          <Field.Root invalid={!!errors.password} required>
            <Field.Label>Password</Field.Label>
            <Input type='password' {...register('password', { required: 'Password is required' })} />
            <Field.ErrorText>{errors.password?.message}</Field.ErrorText>
          </Field.Root>
          <Button type='submit' loading={login.isPending}>
            Sign in
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  )
}

export default Login

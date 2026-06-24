import { Button, Field, Input, Stack } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getApiErrorMessage } from '~platform/api/client'
import { useAuth } from '~platform/auth/AuthContext'
import { useResendVerificationMail, useVerifyMail } from '~platform/auth/authQueries'
import { AuthLayout } from '~platform/components/Layout/AuthLayout'
import { toaster } from '~platform/components/ui/toaster'
import { Routes } from '~platform/routes'

type VerifyFormValues = { code: string }

const Verify = () => {
  const navigate = useNavigate()
  const { storeLogin } = useAuth()
  const [searchParams] = useSearchParams()
  const email = searchParams.get('email') || ''

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyFormValues>()

  const verify = useVerifyMail({
    onSuccess: (data) => {
      storeLogin(data)
      navigate(Routes.dashboard.overview, { replace: true })
    },
    onError: (error) => {
      toaster.create({
        type: 'error',
        title: 'Verification failed',
        description: getApiErrorMessage(error),
        closable: true,
      })
    },
  })

  const resend = useResendVerificationMail({
    onSuccess: () => toaster.create({ type: 'success', title: 'Verification code sent', closable: true }),
    onError: (error) =>
      toaster.create({
        type: 'error',
        title: 'Could not resend code',
        description: getApiErrorMessage(error),
        closable: true,
      }),
  })

  const onSubmit = ({ code }: VerifyFormValues) => verify.mutate({ email, code })

  return (
    <AuthLayout
      title='Verify your email'
      subtitle={email ? `Enter the code we sent to ${email}.` : 'Enter the verification code we sent to your email.'}
      footer={
        <Button
          variant='plain'
          size='sm'
          onClick={() => resend.mutate({ email })}
          loading={resend.isPending}
          disabled={!email}
        >
          Resend code
        </Button>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={4}>
          <Field.Root invalid={!!errors.code} required>
            <Field.Label>Verification code</Field.Label>
            <Input {...register('code', { required: 'Code is required' })} />
            <Field.ErrorText>{errors.code?.message}</Field.ErrorText>
          </Field.Root>
          <Button type='submit' loading={verify.isPending} disabled={!email}>
            Verify
          </Button>
        </Stack>
      </form>
    </AuthLayout>
  )
}

export default Verify

import { Box, Button, Flex, Link, Text, useToast } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate, useOutletContext } from 'react-router-dom'
import { useAnalytics } from '~components/AnalyticsProvider'
import { api, ApiEndpoints, UnverifiedApiError } from '~components/Auth/api'
import { ILoginParams } from '~components/Auth/authQueries'
import { useAuth } from '~components/Auth/useAuth'
import { VerificationPending } from '~components/Auth/Verify'
import { OrSeparator } from '~components/shared/Layout/Separators'
import { AuthOutletContextType } from '~elements/LayoutAuth'
import InputPassword from '~shared/Form/InputPassword'
import { Routes } from '~src/router/routes'
import { AnalyticsEvent } from '~utils/analytics'
import InputBasic from '../shared/Form/InputBasic'
import GoogleAuth from './GoogleAuth'

type FormData = {
  keepLogedIn: boolean
} & ILoginParams

const useVerificationCodeStatus = () =>
  useMutation({
    mutationFn: async (email: string) => {
      return await api<{ email: string; expiration: string; valid: boolean }>(
        `${ApiEndpoints.VerifyCode}?email=${encodeURIComponent(email)}`
      )
    },
  })

const useResendVerificationCode = () =>
  useMutation({
    mutationFn: async (email: string) => {
      await api(ApiEndpoints.VerifyCode, {
        method: 'POST',
        body: { email },
      })
    },
  })

const SignIn = ({ email: emailProp }: { email?: string }) => {
  const { t } = useTranslation()
  const toast = useToast()
  const navigate = useNavigate()
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()
  const { trackPlausibleEvent } = useAnalytics()
  const methods = useForm<FormData>({
    defaultValues: { email: emailProp },
  })
  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods
  const email = watch('email', emailProp)

  const {
    login: { mutateAsync: login, isError, error, reset },
  } = useAuth()
  const [verifyNeeded, setVerifyNeeded] = useState(false)
  const { mutateAsync: checkVerificationCodeStatus } = useVerificationCodeStatus()
  const { mutateAsync: resendVerificationCode } = useResendVerificationCode()

  useEffect(() => {
    // set SignUp title and description
    setTitle(t('signin_title'))
    setSubtitle(t('signin_subtitle'))

    // reset the form to clear the errors
    reset()
  }, [])

  const onSubmit = async (data: FormData) => {
    await login(data)
      .then(() => {
        trackPlausibleEvent({ name: AnalyticsEvent.UserLoggedIn })
        const redirect = localStorage.getItem('redirectTo')
        localStorage.removeItem('redirectTo')
        navigate(redirect || Routes.dashboard.base)
      })
      .catch(async (e) => {
        if (e instanceof UnverifiedApiError && email) {
          try {
            const verificationData = await checkVerificationCodeStatus(email)
            if (verificationData.valid) {
              setVerifyNeeded(true)
              return
            }
            // Code expired, resend verification code
            await resendVerificationCode(email)
            setVerifyNeeded(true)
            toast({
              title: t('verification_code_resent', { defaultValue: 'Verification code resent!' }),
              status: 'success',
              duration: 5000,
              isClosable: true,
            })
          } catch (error) {
            toast({
              title: t('error.title', { defaultValue: 'Error' }),
              description: (error as Error).message,
              status: 'error',
              duration: 5000,
              isClosable: true,
            })
          }
        } else {
          throw e
        }
      })
  }

  if (verifyNeeded) {
    return <VerificationPending email={email} />
  }

  return (
    <>
      <FormProvider {...methods}>
        <Box as='form' onSubmit={handleSubmit(onSubmit)} mb={6}>
          <Flex flexDirection='column' gap={4} mb={4}>
            <InputBasic
              formValue='email'
              label={t('email')}
              placeholder={t('email_placeholder', { defaultValue: 'your@email.com' })}
              type='email'
            />
            <Flex flexDir='column' gap={0}>
              <InputPassword
                formValue='password'
                label={t('password')}
                placeholder={t('password_placeholder', { defaultValue: 'Enter your password' })}
                required
              />
              <Link as={NavLink} to={Routes.auth.recovery} fontSize='xs' fontWeight='bold' alignSelf='end'>
                {t('forgot_password_title')}
              </Link>
            </Flex>
          </Flex>
          <Button type='submit' w='full' isLoading={isSubmitting} shouldWrapChildren>
            {t('signin')}
          </Button>
          <OrSeparator my={6} />
        </Box>
      </FormProvider>
      <GoogleAuth />

      <Text display={'flex'} justifyContent={'center'} alignItems={'center'} fontWeight='bold' fontSize='sm' mt={6}>
        {t('not_registred_yet')}
        <Link as={NavLink} to={Routes.auth.signUp} ml={1} fontWeight={'bold'} fontSize='sm'>
          {t('signup_title')}
        </Link>
      </Text>
    </>
  )
}

export default SignIn

import { Box, Button, Flex, Link, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate, useOutletContext } from 'react-router-dom'
import { useAnalytics } from '~components/AnalyticsProvider'
import { getApiErrorMessage, UnverifiedApiError } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { VerificationPending } from '~components/Auth/Verify'
import InputBasic from '~components/Form/InputBasic'
import InputPassword from '~components/Form/InputPassword'
import { OrSeparator } from '~components/Layout/Separators'
import { useToast } from '~components/Toast'
import { AuthOutletContextType } from '~elements/LayoutAuth'
import { ILoginParams, useResendVerificationCode, useVerificationCodeStatus } from '~queries/auth'
import { Routes } from '~src/router/routes'
import { AnalyticsEvents } from '~utils/analytics'
import GoogleAuth from './GoogleAuth'

type FormData = {
  keepLogedIn: boolean
} & ILoginParams

type SignInProps = {
  email?: string
  // Navigation targets, overridable so the integrators app can reuse this component with its
  // own routes. Defaults preserve the regular /account flow behavior.
  successRoute?: string
  signUpRoute?: string
  recoveryRoute?: string
  verifyNextRoute?: string
}

const SignIn = ({
  email: emailProp,
  successRoute = Routes.dashboard.base,
  signUpRoute = Routes.auth.signUp,
  recoveryRoute = Routes.auth.recovery,
  verifyNextRoute,
}: SignInProps) => {
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
    login: { mutateAsync: login, reset },
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
        trackPlausibleEvent({ name: AnalyticsEvents.UserLoggedIn })
        const redirect = localStorage.getItem('redirectTo')
        localStorage.removeItem('redirectTo')
        navigate(redirect || successRoute)
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
              type: 'success',
              duration: 5000,
              closable: true,
            })
          } catch (error) {
            toast({
              title: t('error.title', { defaultValue: 'Error' }),
              description: getApiErrorMessage(error),
              type: 'error',
              duration: 5000,
              closable: true,
            })
          }
        } else {
          toast({
            title: t('error.title', { defaultValue: 'Error' }),
            description: getApiErrorMessage(e),
            type: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
      })
  }

  if (verifyNeeded) {
    return <VerificationPending email={email} nextRoute={verifyNextRoute} />
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
              <Link asChild fontSize='xs' fontWeight='bold' alignSelf='end'>
                <NavLink to={recoveryRoute}>{t('forgot_password_title')}</NavLink>
              </Link>
            </Flex>
          </Flex>
          <Button type='submit' w='full' loading={isSubmitting}>
            {t('signin')}
          </Button>
          <OrSeparator my={6} />
        </Box>
      </FormProvider>
      <GoogleAuth />

      <Text display={'flex'} justifyContent={'center'} alignItems={'center'} fontWeight='bold' fontSize='sm' mt={6}>
        {t('not_registred_yet')}
        <Link asChild ml={1} fontWeight={'bold'} fontSize='sm'>
          <NavLink to={signUpRoute}>{t('signup_title')}</NavLink>
        </Link>
      </Text>
    </>
  )
}

export default SignIn

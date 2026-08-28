import {
  Button,
  CheckboxControl,
  CheckboxHiddenInput,
  CheckboxLabel,
  CheckboxRoot,
  Flex,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  Link,
  Text,
} from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Navigate, NavLink, useOutletContext } from 'react-router'
import { useAnalytics } from '~components/AnalyticsProvider'
import { IRegisterParams } from '~components/Auth/authQueries'
import { useAuth } from '~components/Auth/useAuth'
import { VerificationPending } from '~components/Auth/Verify'
import { default as InputBasic } from '~components/Form/InputBasic'
import InputPassword from '~components/Form/InputPassword'
import { OrSeparator } from '~components/Layout/Separators'
import { AuthOutletContextType } from '~elements/LayoutAuth'
import { useAppEnv } from '~src/app-env'
import { useSignupFromInvite } from '~src/queries/account'
import { Routes } from '~src/router/routes'
import { AnalyticsEvents } from '~utils/analytics'
import { withParam } from '~utils/url'
import GoogleAuth from './GoogleAuth'

export type InviteFields = {
  code: string
  address: string
  email: string
}

export type SignupProps = {
  invite?: InviteFields
  // Navigation targets, overridable so the integrators app can reuse this component with its
  // own routes. Defaults preserve the regular /account flow behavior.
  signInRoute?: string
  afterRegisterRoute?: string
  // When true, render the verification form inline right after registering instead of routing
  // to a separate verify page. Used by the integrators app, which has no standalone verify
  // route — the user verifies without leaving the sign-up screen.
  verifyInline?: boolean
  verifyNextRoute?: string
}

type FormData = {
  terms: boolean
  promotions: boolean
} & IRegisterParams

const SignUp = ({
  invite,
  signInRoute = Routes.auth.signIn,
  afterRegisterRoute = Routes.auth.verify,
  verifyInline = false,
  verifyNextRoute,
}: SignupProps) => {
  const { t } = useTranslation()
  const { register: signup } = useAuth()
  const inviteSignup = useSignupFromInvite(invite?.address)
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()
  const { trackEvent } = useAnalytics()

  const methods = useForm<FormData>({
    defaultValues: {
      terms: false,
      email: invite?.email,
    },
  })
  const {
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = methods
  const email = watch('email')
  // Holds the email being verified once registration succeeds in inline-verify mode.
  const [verifyingEmail, setVerifyingEmail] = useState<string | null>(null)
  // Holds the email once registration succeeds in the regular flow, so tracking and the
  // mutation reset can run in an effect instead of during render (StrictMode double-fires).
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null)

  // Both mutations surface their own errors via toast (see useAuthProvider's
  // register and useSignupFromInvite), so we only track the pending state here.
  const isPending = signup.isPending || inviteSignup.isPending

  const appEnv = useAppEnv()
  const privacyPolicyUrl = appEnv.PRIVACY_POLICY_URL
  const termsOfServiceUrl = appEnv.TERMS_OF_SERVICE_URL

  useEffect(() => {
    // set SignUp title and description
    setTitle(t('signup_title'))
    setSubtitle(t('signup_subtitle'))
    signup.reset()
  }, [])

  const onSubmit = (user: FormData) => {
    if (!invite) {
      return signup.mutate(user)
    }

    // if there's an invite, the process' a bit different
    return inviteSignup.mutate({
      code: invite.code,
      user,
    })
  }

  // Inline verification (integrators have no standalone verify route): capture the email once
  // registration succeeds so the verify form below can render without leaving the page.
  useEffect(() => {
    if (verifyInline && signup.isSuccess && !verifyingEmail) {
      trackEvent({ name: AnalyticsEvents.AccountSignup, props: { method: 'password' } })
      setVerifyingEmail(email)
      signup.reset()
    }
  }, [verifyInline, signup.isSuccess, verifyingEmail, email, trackEvent, signup])

  useEffect(() => {
    if (!verifyInline && signup.isSuccess && !registeredEmail) {
      trackEvent({ name: AnalyticsEvents.AccountSignup, props: { method: 'password' } })
      setRegisteredEmail(email)
      signup.reset()
    }
  }, [verifyInline, signup.isSuccess, registeredEmail, email, trackEvent, signup])

  useEffect(() => {
    if (inviteSignup.isSuccess) {
      trackEvent({ name: AnalyticsEvents.AccountSignup, props: { method: 'invite' } })
    }
  }, [inviteSignup.isSuccess, trackEvent])

  if (verifyInline && (signup.isSuccess || verifyingEmail)) {
    return <VerificationPending email={verifyingEmail ?? email} nextRoute={verifyNextRoute} />
  }

  // normally registered accounts need verification (separate verify page)
  if (registeredEmail) {
    return <Navigate to={withParam(afterRegisterRoute, 'email', registeredEmail)} replace />
  }

  // registration succeeded but the effect above hasn't staged the redirect yet
  if (signup.isSuccess) {
    return null
  }

  // accounts coming from invites don't need verification
  if (inviteSignup.isSuccess) {
    return <Navigate to={Routes.auth.signIn} replace />
  }

  return (
    <>
      <FormProvider {...methods}>
        <Flex as='form' onSubmit={handleSubmit(onSubmit)} flexDirection='column' gap={6}>
          <Flex flexDirection={'column'} gap={4} mb={4}>
            <InputBasic formValue='firstName' label={t('signup_firstname')} placeholder='John' required />
            <InputBasic formValue='lastName' label={t('signup_lastname')} placeholder='Doe' required />

            <InputBasic
              formValue='email'
              label={t('email')}
              placeholder={'johndoe@example.com'}
              required
              validation={{
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Regex para validar emails
                  message: t('form.error.email_invalid', { defaultValue: 'Invalid email address' }),
                },
              }}
              disabled={!!invite}
            />
            <InputPassword
              formValue='password'
              label={t('password')}
              placeholder={'• • • • • • • •'}
              type='password'
              required
              validation={{
                minLength: {
                  value: 8,
                  message: t('form.error.password_min_length', { defaultValue: 'Min. 8 characters' }),
                },
              }}
            />
            <FormControl as='fieldset'>
              <Controller
                control={control}
                name='promotions'
                render={({ field }) => (
                  <CheckboxRoot checked={field.value} onCheckedChange={(details) => field.onChange(details.checked)}>
                    <CheckboxHiddenInput name={field.name} />
                    <CheckboxControl />
                    <CheckboxLabel>
                      <Text fontSize={'14px'}>
                        <Trans
                          i18nKey='signup_agree_promotions'
                          defaultValue='I agree to receive promotions and offers for digital voting services offered by Vocdoni.'
                        />
                      </Text>
                    </CheckboxLabel>
                  </CheckboxRoot>
                )}
              />
              <FormErrorMessage>{errors?.terms?.message.toString()}</FormErrorMessage>
            </FormControl>
            <FormControl as='fieldset' invalid={!!errors?.terms}>
              <Controller
                control={control}
                name='terms'
                rules={{ required: t('validation.required') }}
                render={({ field }) => (
                  <CheckboxRoot checked={field.value} onCheckedChange={(details) => field.onChange(details.checked)}>
                    <CheckboxHiddenInput name={field.name} />
                    <CheckboxControl />
                    <CheckboxLabel>
                      <Text fontSize={'14px'}>
                        <Trans
                          i18nKey='signup_agree_terms'
                          components={{
                            termsLink: (
                              <Link
                                href={termsOfServiceUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                fontSize={'14px'}
                              />
                            ),
                            privacyLink: (
                              <Link
                                href={privacyPolicyUrl}
                                target='_blank'
                                rel='noopener noreferrer'
                                fontSize={'14px'}
                              />
                            ),
                          }}
                        />
                      </Text>
                    </CheckboxLabel>
                  </CheckboxRoot>
                )}
              />
              <FormErrorMessage>{errors?.terms?.message.toString()}</FormErrorMessage>
            </FormControl>
          </Flex>
          <Button loading={isPending} type='submit' w='100%'>
            {t('signup_create_account')}
          </Button>
          <OrSeparator />
        </Flex>
      </FormProvider>
      <GoogleAuth />

      <Text
        color='account.description'
        display={'flex'}
        justifyContent='center'
        alignItems='start'
        maxW='100%'
        mt={6}
        fontSize='sm'
        fontWeight={'bold'}
      >
        {t('already_member')}
        <Link asChild ml={1} fontWeight={'bold'} fontSize='sm'>
          <NavLink to={signInRoute}>{t('signin')}</NavLink>
        </Link>
      </Text>
    </>
  )
}
export default SignUp

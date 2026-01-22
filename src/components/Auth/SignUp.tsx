import { Button, Checkbox, Flex, FormControl, FormErrorMessage, Link, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Navigate, NavLink, useOutletContext } from 'react-router-dom'
import { useAnalytics } from '~components/AnalyticsProvider'
import { IRegisterParams } from '~components/Auth/authQueries'
import { useAuth } from '~components/Auth/useAuth'
import { AuthOutletContextType } from '~elements/LayoutAuth'
import InputPassword from '~shared/Form/InputPassword'
import { useSignupFromInvite } from '~src/queries/account'
import { Routes } from '~src/router/routes'
import { AnalyticsEvent } from '~utils/analytics'
import { default as InputBasic } from '../shared/Form/InputBasic'

export type InviteFields = {
  code: string
  address: string
  email: string
}

export type SignupProps = {
  invite?: InviteFields
}

type FormData = {
  terms: boolean
  promotions: boolean
} & IRegisterParams

const SignUp = ({ invite }: SignupProps) => {
  const { t } = useTranslation()
  const { register: signup } = useAuth()
  const inviteSignup = useSignupFromInvite(invite?.address)
  const { setTitle, setSubtitle } = useOutletContext<AuthOutletContextType>()
  const { trackPlausibleEvent } = useAnalytics()

  const methods = useForm<FormData>({
    defaultValues: {
      terms: false,
      email: invite?.email,
    },
  })
  const {
    handleSubmit,
    watch,
    register,
    formState: { errors },
  } = methods
  const email = watch('email')

  const isPending = signup.isPending || inviteSignup.isPending
  const isError = signup.isError || inviteSignup.isError
  const error = signup.error || inviteSignup.error

  const privacyPolicyUrl = import.meta.env.PRIVACY_POLICY_URL
  const termsOfServiceUrl = import.meta.env.TERMS_OF_SERVICE_URL

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

  // normally registered accounts need verification
  if (signup.isSuccess) {
    trackPlausibleEvent({ name: AnalyticsEvent.AccountSignup })
    signup.reset()
    return <Navigate to={`${Routes.auth.verify}?email=${encodeURIComponent(email)}`} />
  }

  // accounts coming from invites don't need verification
  if (inviteSignup.isSuccess) {
    trackPlausibleEvent({ name: AnalyticsEvent.AccountSignup })
    return <Navigate to={Routes.auth.signIn} />
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
              isDisabled={!!invite}
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
              <Checkbox {...register('promotions')}>
                <Text fontSize={'14px'}>
                  <Trans
                    i18nKey='signup_agree_promotions'
                    defaultValue='I agree to receive promotions and offers for digital voting services offered by Vocdoni.'
                  />
                </Text>
              </Checkbox>
              <FormErrorMessage>{errors?.terms?.message.toString()}</FormErrorMessage>
            </FormControl>
            <FormControl as='fieldset' isInvalid={!!errors?.terms}>
              <Checkbox {...register('terms', { required: t('cc.validation.required') })}>
                <Text fontSize={'14px'}>
                  <Trans
                    i18nKey='signup_agree_terms'
                    components={{
                      termsLink: <Link href={termsOfServiceUrl} isExternal fontSize={'14px'} />,
                      privacyLink: <Link href={privacyPolicyUrl} isExternal fontSize={'14px'} />,
                    }}
                  />
                </Text>
              </Checkbox>
              <FormErrorMessage>{errors?.terms?.message.toString()}</FormErrorMessage>
            </FormControl>
          </Flex>
          <Button isLoading={isPending} shouldWrapChildren type='submit' w='100%'>
            {t('signup_create_account')}
          </Button>
        </Flex>
      </FormProvider>

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
        <Link as={NavLink} to={Routes.auth.signIn} ml={1} fontWeight={'bold'} fontSize='sm'>
          {t('signin')}
        </Link>
      </Text>
    </>
  )
}
export default SignUp

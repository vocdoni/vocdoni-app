import {
  AlertDescription,
  AlertIndicator,
  AlertRoot as Alert,
  Button,
  CheckboxControl,
  CheckboxHiddenInput,
  CheckboxLabel,
  CheckboxRoot,
  Dialog,
  FieldHelperText as FormHelperText,
  FieldLabel as FormLabel,
  FieldRoot as FormControl,
  Input,
  Link,
  Portal,
  Spinner,
  Stack,
  Text,
} from '@chakra-ui/react'
import type { OrgMemberTwoFaField } from '@vocdoni/api-types'
import { useElection } from '@vocdoni/react-components'
import type { TFunction } from 'i18next'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { normalizePublicLanguageCandidate } from '~i18n/public-language'
import { useToast } from '~components/Toast'
import { CloseButton } from '~components/ui/CloseButton'
import { DialogHeader } from '~components/ui/DialogHeader'
import { useAppEnv, useLanguagesEnv } from '~src/app-env'
import { useCspAuth0 } from './basics'
import { RETRYABLE_CERT_ERRORS, startCertAuth, STICKY_CERT_ERRORS } from './cert-auth'
import { useCspAuthContext } from './CSPStepsProvider'
import { getContactFieldLabel } from './fields'
import { Step1Base } from './Step1'

/**
 * Starts the certificate flow: a top-level navigation to the gateway, which comes back to this
 * process' voting page (`/[lang/]processes/<id>`, also from a home-process root page).
 */
const useStartCertAuth = (navigate: (url: string) => void = (url) => window.location.assign(url)) => {
  const { election } = useElection()
  const { i18n } = useTranslation()
  const { CERT_GATEWAY_URL: gatewayUrl } = useAppEnv()
  const supportedLanguages = Object.keys(useLanguagesEnv())

  if (!gatewayUrl || !election) return null
  return async () => {
    const lang = normalizePublicLanguageCandidate(i18n.language, supportedLanguages)
    const path = `${lang ? `/${lang}` : ''}/processes/${election.id}`
    navigate(
      await startCertAuth({
        gatewayUrl,
        processId: election.id,
        returnUrl: window.location.origin + path,
        language: i18n.language,
      })
    )
  }
}

/** Step 0 of a certificate census: the terms, then the certificate button. */
export const CertAuthStart = ({ navigate }: { navigate?: (url: string) => void }) => {
  const { t } = useTranslation()
  const { PRIVACY_POLICY_URL: privacyPolicyUrl, TERMS_OF_SERVICE_URL: termsOfServiceUrl } = useAppEnv()
  const start = useStartCertAuth(navigate)
  const [accepted, setAccepted] = useState(false)
  const [starting, setStarting] = useState(false)

  // the page can come back from the back/forward cache after a failed navigation to the gateway
  useEffect(() => {
    const reset = () => setStarting(false)
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])

  if (!start) {
    return (
      <Alert status='error'>
        <AlertIndicator />
        <AlertDescription>
          {t('csp.cert.unavailable', { defaultValue: 'Signing in with a digital certificate is not available here.' })}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Stack gap='4'>
      <FormControl required>
        <CheckboxRoot checked={accepted} onCheckedChange={({ checked }) => setAccepted(checked === true)}>
          <CheckboxHiddenInput />
          <CheckboxControl />
          <CheckboxLabel>
            <Trans i18nKey='csp.terms_acceptance'>
              I have read and accept the{' '}
              <Link href={termsOfServiceUrl} target='_blank' rel='noopener noreferrer'>
                Terms and Conditions
              </Link>{' '}
              and the{' '}
              <Link href={privacyPolicyUrl} target='_blank' rel='noopener noreferrer'>
                Privacy Policy
              </Link>
              .
            </Trans>
          </CheckboxLabel>
        </CheckboxRoot>
      </FormControl>
      <Button
        w='full'
        disabled={!accepted}
        loading={starting}
        onClick={async () => {
          setStarting(true)
          try {
            await start()
          } catch {
            setStarting(false)
          }
        }}
      >
        {t('csp.cert.start', { defaultValue: 'Sign in with a digital certificate' })}
      </Button>
      <Text textStyle='body-sm' color='fg.muted'>
        {t('csp.cert.network_note', {
          defaultValue:
            "If the certificate page doesn't load, your network may block it: try again from another network, such as mobile data.",
        })}
      </Text>
    </Stack>
  )
}

/** The voter-facing message of a gateway or backend error code. */
const certErrorMessage = (t: TFunction, code: string): string => {
  switch (code) {
    case 'no_certificate':
      return t('csp.cert.errors.no_certificate', { defaultValue: 'No certificate was selected.' })
    case 'not_in_census':
      return t('csp.cert.errors.not_in_census', {
        defaultValue: "The DNI/NIE of this certificate isn't in the census of this vote.",
      })
    case 'zero_weight':
      return t('csp.cert.errors.zero_weight', {
        defaultValue: "You don't have enough voting power to access the vote.",
      })
    case 'provider_mismatch':
    case 'untrusted_issuer':
    case 'unsupported_profile':
      return t('csp.cert.errors.unsupported_certificate', {
        defaultValue:
          "This certificate isn't accepted. Use a personal certificate from FNMT, idCAT, ACCV, DIGITEL, Bewor or Sectigo.",
      })
    case 'expired':
    case 'not_yet_valid':
      return t('csp.cert.errors.expired', { defaultValue: "This certificate isn't valid today." })
    case 'revoked':
      return t('csp.cert.errors.revoked', { defaultValue: 'This certificate has been revoked.' })
    case 'revocation_unavailable':
    case 'internal':
      return t('csp.cert.errors.check_unavailable', {
        defaultValue: "We couldn't check your certificate right now. Try again in a few minutes.",
      })
    case 'backend_unavailable':
      return t('csp.cert.errors.backend_unavailable', {
        defaultValue: "The voting service didn't answer. Try again in a few minutes.",
      })
    case 'rate_limited':
      return t('csp.cert.errors.rate_limited', { defaultValue: 'Too many attempts. Try again later.' })
    case 'process_not_open':
    case 'not_cert_census':
    case 'anonymous_unavailable':
      return t('csp.cert.errors.process_unavailable', {
        defaultValue: "This vote can't be accessed with a certificate right now.",
      })
    default:
      return t('csp.cert.errors.generic', { defaultValue: "We couldn't sign you in with your certificate." })
  }
}

/** A failed certificate login: the message, then how to go on. */
export const CertAuthError = ({ code, navigate }: { code: string; navigate?: (url: string) => void }) => {
  const { t } = useTranslation()
  const start = useStartCertAuth(navigate)
  const sticky = (STICKY_CERT_ERRORS as readonly string[]).includes(code)
  const retryable = (RETRYABLE_CERT_ERRORS as readonly string[]).includes(code)

  return (
    <Stack gap='4'>
      <Alert status='error'>
        <AlertIndicator />
        <AlertDescription>{certErrorMessage(t, code)}</AlertDescription>
      </Alert>
      {sticky && (
        <Text textStyle='body-sm'>
          {t('csp.cert.restart_browser', {
            defaultValue:
              'Your browser remembers the certificate you chose. To use a different one, close every window of the browser and open the voting link again.',
          })}
        </Text>
      )}
      {retryable && start && (
        <Button w='full' onClick={() => start()}>
          {t('csp.cert.retry', { defaultValue: 'Try again' })}
        </Button>
      )}
    </Stack>
  )
}

/** After a failed step 0 the code may be spent: the way on is a new certificate login. */
const CertAuthAgain = () => {
  const { t } = useTranslation()
  const start = useStartCertAuth()
  if (!start) return null
  return (
    <Button w='full' onClick={() => start()}>
      {t('csp.cert.start', { defaultValue: 'Sign in with a digital certificate' })}
    </Button>
  )
}

/** The email or phone of a step-0 request, from the contact the voter typed. */
const contactOf = (contact: string, twoFaFields: OrgMemberTwoFaField[]) => {
  const email = twoFaFields.includes('email') && (!twoFaFields.includes('phone') || contact.includes('@'))
  return email ? { email: contact } : { phone: contact }
}

/** Redeems the code of an auth-only certificate census as soon as it is shown. */
const CertAutoLogin = ({ certCode, codeVerifier }: { certCode: string; codeVerifier: string }) => {
  const { t } = useTranslation()
  const auth = useCspAuth0()
  const sent = useRef(false)
  const { mutate } = auth

  useEffect(() => {
    // once, even under StrictMode: the code is single-use
    if (sent.current) return
    sent.current = true
    mutate({ certCode, codeVerifier })
  }, [mutate, certCode, codeVerifier])

  if (auth.isError) {
    return (
      <Stack gap='4'>
        <Alert status='error'>
          <AlertIndicator />
          <AlertDescription>{auth.error.message}</AlertDescription>
        </Alert>
        <CertAuthAgain />
      </Stack>
    )
  }
  return (
    <Stack align='center' gap='3' py='4'>
      <Spinner />
      <Text>{t('csp.cert.signing_in', { defaultValue: 'Signing you in…' })}</Text>
    </Stack>
  )
}

/** A certificate census with 2FA: the email or phone, then the existing code step. */
const CertContactForm = ({ certCode, codeVerifier }: { certCode: string; codeVerifier: string }) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { twoFaFields, setAuthData, setCurrentStep, setCertReturn } = useCspAuthContext()
  const auth = useCspAuth0()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ contact: string }>()

  const onSubmit = async ({ contact }: { contact: string }) => {
    const destination = contactOf(contact.trim(), twoFaFields)
    try {
      await auth.mutateAsync({ certCode, codeVerifier, ...destination })
    } catch {
      return // shown below; the code is spent, the voter goes through the certificate again
    }
    setAuthData(destination)
    setCertReturn({ kind: 'redeemed' })
    toast({ title: t('csp.code_sent', { defaultValue: 'Verification code sent' }), type: 'success', duration: 3000 })
    setCurrentStep(1)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack gap='4'>
        <FormControl invalid={!!errors.contact} required>
          <FormLabel>{getContactFieldLabel(t, twoFaFields)}</FormLabel>
          <Input {...register('contact', { required: true })} type='text' />
          <FormHelperText>{t('csp.contact_match_help', 'Must match the one registered in the system')}</FormHelperText>
        </FormControl>
        {auth.isError && (
          <Alert status='error'>
            <AlertIndicator />
            <AlertDescription>{auth.error.message}</AlertDescription>
          </Alert>
        )}
        {auth.isError ? (
          <CertAuthAgain />
        ) : (
          <Button type='submit' w='full' loading={auth.isPending}>
            {t('csp.receive_code', 'Receive Code')}
          </Button>
        )}
      </Stack>
    </form>
  )
}

/** Handles the certificate gateway's answer after the redirect back to the voting page. */
export const CertAuthReturnDialog = () => {
  const { t } = useTranslation()
  const { certReturn, setCertReturn, twoFaFields, currentStep } = useCspAuthContext()

  if (!certReturn) return null

  let body
  if (certReturn.kind === 'redeemed') {
    body = currentStep === 1 ? <Step1Base /> : <CertAuthStart />
  } else if (certReturn.kind !== 'code') {
    body = <CertAuthError code={certReturn.kind === 'error' ? certReturn.code : 'mismatch'} />
  } else if (twoFaFields.length === 0) {
    body = <CertAutoLogin certCode={certReturn.certCode} codeVerifier={certReturn.codeVerifier} />
  } else {
    body = <CertContactForm certCode={certReturn.certCode} codeVerifier={certReturn.codeVerifier} />
  }

  return (
    <Dialog.Root
      open
      size='sm'
      closeOnInteractOutside={false}
      onOpenChange={({ open }) => !open && setCertReturn(null)}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner p={{ base: '4', md: '6' }}>
          <Dialog.Content w='full' maxW='lg'>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
            <DialogHeader title={t('csp.cert.title', { defaultValue: 'Digital certificate' })} />
            <Dialog.Body>{body}</Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

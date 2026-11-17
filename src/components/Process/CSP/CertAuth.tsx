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
import { useElection, useOrganization } from '@vocdoni/react-components'
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
import { detectCertificateBrowser, readBrowserEnv } from './browser-support'
import { hasPendingCertAuth, RETRYABLE_CERT_ERRORS, startCertAuth, STICKY_CERT_ERRORS } from './cert-auth'
import { useCspAuthContext, useOptionalCspAuthContext } from './CSPStepsProvider'
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

/** The platform of an in-app browser (WhatsApp, Instagram, Gmail…), which can't present a certificate. */
const inAppPlatform = () => {
  if (typeof navigator === 'undefined') return null
  const browser = detectCertificateBrowser(readBrowserEnv())
  return browser.kind === 'in-app' ? browser.platform : null
}

/** This voting page without query or fragment: what the voter opens elsewhere. */
const pageUrl = () => window.location.origin + window.location.pathname

/** Copies the voting page's link, saying whether it worked. */
const CopyLinkButton = () => {
  const { t } = useTranslation()
  const [result, setResult] = useState<'copied' | 'failed' | null>(null)
  return (
    <Stack gap='1'>
      <Button
        w='full'
        variant='outline'
        onClick={() =>
          navigator.clipboard.writeText(pageUrl()).then(
            () => setResult('copied'),
            () => setResult('failed')
          )
        }
      >
        {t('csp.cert.copy_link', { defaultValue: 'Copy link' })}
      </Button>
      <Text role='status' textStyle='body-sm' color={result === 'failed' ? 'fg.error' : 'fg.muted'}>
        {result === 'copied' && t('csp.cert.link_copied', { defaultValue: 'Link copied' })}
        {result === 'failed' &&
          t('csp.cert.copy_failed', {
            defaultValue: "Couldn't copy. Copy the address from your browser's address bar.",
          })}
      </Text>
    </Stack>
  )
}

/** An in-app browser can't use certificates: the way on is the same link in the real browser. */
const OpenInBrowser = ({ platform }: { platform: 'android' | 'ios' | 'other' }) => {
  const { t } = useTranslation()
  return (
    <Stack gap='3'>
      <Alert status='warning'>
        <AlertIndicator />
        <AlertDescription>
          {t('csp.cert.in_app.explanation', {
            defaultValue:
              "You opened this link inside an app. Its built-in viewer can't use your digital certificate, but your browser can.",
          })}
        </AlertDescription>
      </Alert>
      <Text textStyle='body-sm'>
        {t('csp.cert.in_app.steps', {
          defaultValue:
            'Copy the link, then open this link in your browser. Many apps also have a menu option to open the page in your browser.',
        })}
      </Text>
      {platform === 'android' && (
        // no package: Android opens the default browser, or asks which one
        <Button asChild w='full'>
          <a href={`intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;end`}>
            {t('csp.cert.in_app.open', { defaultValue: 'Open in your browser' })}
          </a>
        </Button>
      )}
      <CopyLinkButton />
    </Stack>
  )
}

/** Step 0 of a certificate census: the terms, then the certificate button. */
export const CertAuthStart = ({ navigate }: { navigate?: (url: string) => void }) => {
  const { t } = useTranslation()
  const { PRIVACY_POLICY_URL: privacyPolicyUrl, TERMS_OF_SERVICE_URL: termsOfServiceUrl } = useAppEnv()
  const { election } = useElection()
  const certReturn = useOptionalCspAuthContext()?.certReturn
  const start = useStartCertAuth(navigate)
  const [accepted, setAccepted] = useState(false)
  const [starting, setStarting] = useState(false)
  // a login this tab started that never came back with an answer
  const pendingNow = () => !certReturn && !!election && hasPendingCertAuth(election.id)
  const [pending, setPending] = useState(pendingNow)

  // the page can come back from the back/forward cache after a failed navigation to the gateway
  useEffect(() => {
    const reset = () => {
      setStarting(false)
      setPending(pendingNow())
    }
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  })

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

  const platform = inAppPlatform()
  if (platform) return <OpenInBrowser platform={platform} />

  return (
    <Stack gap='4'>
      {pending && (
        <Stack gap='2'>
          <Alert status='warning'>
            <AlertIndicator />
            <AlertDescription>
              {t('csp.cert.not_loaded', {
                defaultValue:
                  "The certificate page didn't load? Try another network, such as mobile data, or copy the link and open it on another device.",
              })}
            </AlertDescription>
          </Alert>
          <CopyLinkButton />
        </Stack>
      )}
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
        {t('csp.cert.picker_help', {
          defaultValue:
            'Your browser will ask you to choose a certificate: choose the one with your name. We accept FNMT, idCAT, ACCV, DIGITEL, Bewor and Sectigo certificates.',
        })}
      </Text>
      <Text textStyle='body-sm' color='fg.muted'>
        {t('csp.cert.not_a_certificate', {
          defaultValue:
            'idCAT Mòbil and Cl@ve are not certificates: you need a digital certificate installed on this device.',
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
      return t('csp.cert.errors.unsupported_certificate', {
        defaultValue:
          "This certificate isn't accepted. Use a personal certificate from FNMT, idCAT, ACCV, DIGITEL, Bewor or Sectigo.",
      })
    case 'unsupported_profile':
      return t('csp.cert.errors.unsupported_profile', {
        defaultValue:
          'This certificate is for a company, a representative or an employee. Use the certificate issued to you as a person.',
      })
    case 'invalid_chain':
      return t('csp.cert.errors.invalid_chain', {
        defaultValue: "We couldn't verify this certificate. Use another certificate if you have one.",
      })
    case 'unsupported_purpose':
      return t('csp.cert.errors.unsupported_purpose', {
        defaultValue: "This certificate can't be used to sign in. Use the certificate you use to identify yourself.",
      })
    case 'weak_algorithm':
      return t('csp.cert.errors.weak_algorithm', {
        defaultValue: 'This certificate is too old to use here. Get a new one from its issuer.',
      })
    case 'test_certificate':
      return t('csp.cert.errors.test_certificate', {
        defaultValue: 'This is a test certificate. Use your real certificate.',
      })
    case 'identity_invalid':
      return t('csp.cert.errors.identity_invalid', {
        defaultValue: "We couldn't read the identity in this certificate. Use another certificate if you have one.",
      })
    case 'identity_unsupported_document':
      return t('csp.cert.errors.identity_unsupported_document', {
        defaultValue: 'This certificate has no DNI or NIE. You need a certificate issued with your DNI or NIE.',
      })
    case 'revocation_unknown':
      return t('csp.cert.errors.revocation_unknown', {
        defaultValue:
          "We couldn't confirm with its issuer that this certificate is still valid. Use another certificate if you have one.",
      })
    case 'expired':
      return t('csp.cert.errors.expired', {
        defaultValue: 'This certificate has expired. Get a new one from its issuer.',
      })
    case 'not_yet_valid':
      return t('csp.cert.errors.not_yet_valid', {
        defaultValue:
          "This certificate isn't active yet. If you got it today, try again later. If not, check your device's date and time.",
      })
    case 'revoked':
      return t('csp.cert.errors.revoked', { defaultValue: 'This certificate has been revoked.' })
    case 'mismatch':
      return t('csp.cert.errors.mismatch', {
        defaultValue: "Your certificate sign-in didn't finish in this tab. Sign in again.",
      })
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

/** A failed certificate login: the message, then how to go on. `ref`: the gateway's support reference. */
export const CertAuthError = ({
  code,
  reference,
  navigate,
}: {
  code: string
  reference?: string
  navigate?: (url: string) => void
}) => {
  const { t } = useTranslation()
  const { organization } = useOrganization()
  const start = useStartCertAuth(navigate)
  const sticky = (STICKY_CERT_ERRORS as readonly string[]).includes(code)
  const retryable = (RETRYABLE_CERT_ERRORS as readonly string[]).includes(code)
  // an in-app browser has no certificate to offer: restarting it changes nothing
  const platform = code === 'no_certificate' ? inAppPlatform() : null
  const organizationName = organization?.name?.default

  return (
    <Stack gap='4'>
      <Alert status='error'>
        <AlertIndicator />
        <AlertDescription>{certErrorMessage(t, code)}</AlertDescription>
      </Alert>
      {platform && <OpenInBrowser platform={platform} />}
      {/* a sticky code too: a retry reaches a new host, so the browser asks for the certificate again */}
      {(retryable || (sticky && !platform)) && start && (
        <Button w='full' onClick={() => start()}>
          {t('csp.cert.retry', { defaultValue: 'Try again' })}
        </Button>
      )}
      {sticky && !platform && (
        <Text textStyle='body-sm' color='fg.muted'>
          {t('csp.cert.restart_browser', {
            defaultValue:
              "If your browser doesn't ask you to choose a certificate again, close every window of the browser and open the voting link again.",
          })}
        </Text>
      )}
      {code === 'no_certificate' && !platform && (
        <>
          <Text textStyle='body-sm'>
            {t('csp.cert.other_device', {
              defaultValue: 'Is your certificate on another device? Copy the link and open it there.',
            })}
          </Text>
          <CopyLinkButton />
        </>
      )}
      {code === 'mismatch' && <CertAuthStart navigate={navigate} />}
      <Text textStyle='body-sm' color='fg.muted'>
        {organizationName
          ? t('csp.cert.contact_organization', {
              defaultValue: 'If you keep having problems, contact {{organization}}.',
              organization: organizationName,
            })
          : t('csp.cert.contact_organization_unnamed', {
              defaultValue: 'If you keep having problems, contact the organization running this vote.',
            })}
        {reference && <> {t('csp.cert.reference', { defaultValue: 'Support reference: {{reference}}', reference })}</>}
      </Text>
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
    <Stack role='status' align='center' gap='3' py='4'>
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
    body =
      certReturn.kind === 'error' ? (
        <CertAuthError code={certReturn.code} reference={certReturn.ref} />
      ) : (
        <CertAuthError code='mismatch' />
      )
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

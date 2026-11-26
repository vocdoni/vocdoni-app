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
import { useMutation } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { AuthRequest, OrgMemberTwoFaField } from '@vocdoni/api-types'
import {
  CspAuthSession,
  useComponents,
  useCspAuthSession,
  useElection,
  useElectionAuth,
  useOrganization,
  useReactComponentsLocalize,
} from '@vocdoni/react-components'
import type { TFunction } from 'i18next'
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { getContactFieldLabel } from '~components/Process/Create/VoterAuthentication/fields'
import { CloseButton } from '~components/ui/CloseButton'
import { DialogHeader } from '~components/ui/DialogHeader'
import { normalizePublicLanguageCandidate } from '~i18n/public-language'
import { useAppEnv, useLanguagesEnv } from '~src/app-env'
import { detectCertificateBrowser, readBrowserEnv } from './browser-support'
import {
  PROCESS_CERT_ERRORS,
  readCertReturn,
  RETRYABLE_CERT_ERRORS,
  startCertAuth,
  STICKY_CERT_ERRORS,
  takeUnansweredCertAuth,
  type CertReturn,
} from './cert-auth'

// The voter side of a certificate census (`census.certAuth`). The packaged CspAuth renders nothing for
// those censuses until the voter is connected, so the app draws the flow here with the same themed
// slots (CspAuthTrigger, CspAuthModal, CspAuthCodeForm) and the same CspAuthSession, which keeps
// the contact and the code step shared by every button on the page.

/** The terms the voter accepts before identifying, linked to the terms and the privacy policy. */
export const VoterTerms = () => {
  const { PRIVACY_POLICY_URL: privacyPolicyUrl, TERMS_OF_SERVICE_URL: termsOfServiceUrl } = useAppEnv()
  return (
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
  )
}

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

/**
 * Step 0 of a certificate census: the terms, then the certificate button. `showPending`: false where the
 * gateway's answer is already on screen, so the "page didn't load" hint would be wrong.
 */
export const CertAuthStart = ({
  navigate,
  showPending = true,
}: {
  navigate?: (url: string) => void
  showPending?: boolean
}) => {
  const { t } = useTranslation()
  const { election } = useElection()
  const start = useStartCertAuth(navigate)
  const [accepted, setAccepted] = useState(false)
  const [starting, setStarting] = useState(false)
  // a login this tab started moments ago that never came back with an answer
  const [pending, setPending] = useState(() => showPending && !!election && takeUnansweredCertAuth(election.id))

  // the page can come back from the back/forward cache after a navigation to the gateway
  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      setStarting(false)
      // restored by going back from the gateway page: it did load, so the login is only forgotten
      if (event.persisted) {
        if (election) takeUnansweredCertAuth(election.id, { backForward: true })
        setPending(false)
      }
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
            <VoterTerms />
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
  // a process-level code stays the same whatever certificate is chosen: no retry, no restart hint
  const sticky =
    (STICKY_CERT_ERRORS as readonly string[]).includes(code) &&
    !(PROCESS_CERT_ERRORS as readonly string[]).includes(code)
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
      {code === 'mismatch' && <CertAuthStart navigate={navigate} showPending={false} />}
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

/**
 * Step 0 with a certificate code. A refused code (40802) proves nothing about the census, which the
 * gateway already checked: it is expired, spent or bound to another verifier, or (with 2FA) the contact
 * doesn't match. The other codes read as in the packaged CspAuth.
 */
const useCertAuth0 = () => {
  const { t } = useTranslation()
  const rc = useReactComponentsLocalize()
  const { auth0 } = useElectionAuth()
  return useMutation({
    retry: false,
    mutationFn: async (request: AuthRequest) => {
      try {
        await auth0(request)
      } catch (error) {
        if (!(error instanceof VocdoniApiError)) throw error
        switch (error.code) {
          case 40029:
          case 40802:
            throw new Error(
              request.email || request.phone
                ? t('csp.cert.errors.code_refused_contact', {
                    defaultValue:
                      "Your certificate sign-in expired, or the email or phone doesn't match. Sign in again.",
                  })
                : t('csp.cert.errors.code_refused', {
                    defaultValue: 'Your certificate sign-in expired. Sign in again.',
                  })
            )
          case 40017:
            throw new Error(rc('csp.errors.too_many_attempts'))
          case 40103:
            throw new Error(rc('csp.errors.requests_on_cooldown'))
          case 40801:
            throw new Error(rc('csp.errors.zero_voting_weight'))
        }
        throw error
      }
    },
  })
}

/** Redeems the code of an auth-only certificate census as soon as it is shown. */
const CertAutoLogin = ({ certCode, codeVerifier }: { certCode: string; codeVerifier: string }) => {
  const { t } = useTranslation()
  const auth = useCertAuth0()
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

/** A certificate census with 2FA: the email or phone, sent with the code; then the code step. */
const CertContactForm = ({
  certCode,
  codeVerifier,
  onRedeemed,
}: {
  certCode: string
  codeVerifier: string
  onRedeemed: () => void
}) => {
  const { t } = useTranslation()
  const { twoFaFields, setContact, setPendingNotice, setCurrentStep } = useCspAuthSession()
  const auth = useCertAuth0()
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
    setContact(destination)
    setPendingNotice('csp.code_sent')
    setCurrentStep(1)
    onRedeemed()
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

const CODE_LENGTH = 6

/**
 * The one-time code of a certificate census with 2FA, drawn by the themed CspAuthCodeForm slot as the
 * packaged code step would. "Start over" goes back to the certificate button: the certificate code is spent.
 */
export const CertCodeStep = () => {
  const rc = useReactComponentsLocalize()
  const { CspAuthCodeForm: Slot } = useComponents()
  const { auth1, resend } = useElectionAuth()
  const { contact, pendingNotice, setPendingNotice, resetFlow } = useCspAuthSession()
  const [code, setCode] = useState('')
  const [notice, setNotice] = useState(pendingNotice)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const autoSubmitted = useRef<string>(undefined)

  // the notice shows once, on the first code step after it was set
  useEffect(() => setPendingNotice(undefined), [setPendingNotice])

  const submit = async (value: string) => {
    if (loading) return
    if (value.length < CODE_LENGTH) {
      setError(rc(value ? 'csp.step1.validation.length' : 'csp.step1.validation.required'))
      return
    }
    setError(undefined)
    setNotice(undefined)
    setLoading(true)
    try {
      await auth1(value)
    } catch (err) {
      setError(
        err instanceof VocdoniApiError && err.code === 40001
          ? rc('csp.errors.code_rejected')
          : err instanceof Error
            ? err.message
            : rc('csp.auth_failed')
      )
    } finally {
      setLoading(false)
    }
  }

  // submits by itself once every digit is in, once per code
  useEffect(() => {
    if (code.length !== CODE_LENGTH || autoSubmitted.current === code) return
    autoSubmitted.current = code
    void submit(code)
  })

  return (
    <Slot
      title={rc('csp.step1.subtitle')}
      helper={rc('csp.step1.helper')}
      code={code}
      length={CODE_LENGTH}
      onCodeChange={(next) => setCode(next.replace(/\D/g, '').slice(0, CODE_LENGTH))}
      error={error}
      notice={notice ? rc(notice) : undefined}
      loading={loading}
      submitLabel={rc('csp.authenticate')}
      onSubmit={(event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        void submit(code)
      }}
      resendLabel={rc('csp.step1.resend')}
      onResend={async () => {
        setResending(true)
        try {
          await resend(contact)
          setError(undefined)
          setNotice('csp.step1.resend_success')
        } catch (err) {
          setNotice(undefined)
          const detail = err instanceof Error ? err.message : ''
          setError(detail ? rc('csp.step1.resend_failed_detail', { detail }) : rc('csp.step1.resend_failed'))
        } finally {
          setResending(false)
        }
      }}
      resending={resending}
      startOverLabel={rc('csp.step1.start_over')}
      onStartOver={resetFlow}
      actionsDisabled={loading}
      footer={rc('csp.step1.footer')}
    />
  )
}

/** The dialog shell of the certificate flow, the same one the packaged CspAuth opens. */
const CertAuthDialog = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) => {
  const { t } = useTranslation()
  return (
    // an outside click must not drop an unspent certificate code
    <Dialog.Root open={open} size='sm' closeOnInteractOutside={false} onOpenChange={(e) => !e.open && onClose()}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner p={{ base: '4', md: '6' }}>
          <Dialog.Content w='full' maxW='lg'>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
            <DialogHeader title={t('csp.cert.title', { defaultValue: 'Digital certificate' })} />
            <Dialog.Body>{children}</Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

// useCspAuthSession throws without a session above, as on the home page's shared census button.
const useOptionalCspAuthSession = () => {
  try {
    return useCspAuthSession()
  } catch {
    return undefined
  }
}

/**
 * The identify button of a certificate census, in place of the packaged CspAuth's. It opens the
 * certificate button, or the code step while a 2FA code is due. Like CspAuth, it joins the page's
 * CspAuthSession, or opens its own when there is none.
 */
export const CertAuthConnect = () =>
  useOptionalCspAuthSession() ? (
    <CertAuthControls />
  ) : (
    <CspAuthSession>
      <CertAuthControls />
    </CspAuthSession>
  )

const CertAuthControls = () => {
  const rc = useReactComponentsLocalize()
  const { CspAuthTrigger } = useComponents()
  const { connected } = useElectionAuth()
  const { currentStep } = useCspAuthSession()
  const [open, setOpen] = useState(false)

  if (connected) return null
  return (
    <>
      <CspAuthTrigger label={rc('csp.identify')} onClick={() => setOpen(true)} />
      <CertAuthDialog open={open} onClose={() => setOpen(false)}>
        {currentStep === 1 ? <CertCodeStep /> : <CertAuthStart />}
      </CertAuthDialog>
    </>
  )
}

/**
 * Handles the certificate gateway's answer after the redirect back to the voting page: mount it once per
 * page, under the page's CspAuthSession. It reads the fragment once the process (and so whether its census
 * uses certificates) is known, then shows the sign-in, the error, or the 2FA steps.
 */
export const CertAuthReturn = () => {
  const { election } = useElection()
  const { connected } = useElectionAuth()
  const { currentStep } = useCspAuthSession()
  const [certReturn, setCertReturn] = useState<CertReturn | null>(null)
  const processId = election?.id
  const certAuth = !!election?.census?.certAuth

  useEffect(() => {
    if (!processId || !certAuth) return
    const found = readCertReturn(processId)
    if (found) setCertReturn(found)
  }, [processId, certAuth])

  useEffect(() => {
    if (connected) setCertReturn(null)
  }, [connected])

  if (!certReturn) return null

  let body
  if (certReturn.kind === 'redeemed') {
    body = currentStep === 1 ? <CertCodeStep /> : <CertAuthStart showPending={false} />
  } else if (certReturn.kind === 'error') {
    body = <CertAuthError code={certReturn.code} reference={certReturn.ref} />
  } else if (certReturn.kind === 'mismatch') {
    body = <CertAuthError code='mismatch' />
  } else if (!election?.census?.twoFaFields?.length) {
    body = <CertAutoLogin certCode={certReturn.certCode} codeVerifier={certReturn.codeVerifier} />
  } else {
    body = (
      <CertContactForm
        certCode={certReturn.certCode}
        codeVerifier={certReturn.codeVerifier}
        onRedeemed={() => setCertReturn({ kind: 'redeemed' })}
      />
    )
  }

  return (
    <CertAuthDialog open onClose={() => setCertReturn(null)}>
      {body}
    </CertAuthDialog>
  )
}

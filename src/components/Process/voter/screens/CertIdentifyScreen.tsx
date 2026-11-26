import { Alert, Button, chakra, Field, Input, Stack, Text } from '@chakra-ui/react'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { inAppPlatform } from '~components/Process/CertAuth/browser-support'
import {
  PROCESS_CERT_ERRORS,
  RETRYABLE_CERT_ERRORS,
  STICKY_CERT_ERRORS,
  unansweredCertAuth,
  type CertReturn,
} from '~components/Process/CertAuth/cert-auth'
import { certErrorMessage } from '~components/Process/CertAuth/cert-messages'
import { androidIntentUrl, copyPageLink } from '~components/Process/CertAuth/cert-page'
import { useStartCertAuth } from '~components/Process/CertAuth/CertAuth'
import { getContactFieldInputProps, getContactFieldLabel } from '~components/Process/Create/VoterAuthentication/fields'
import { buildCspAuthRequest } from '~components/Process/voter/csp/auth-request'
import { useCspAuthContext } from '~components/Process/voter/csp/CspStepsProvider'
import { useCertRedeem } from '../cert/use-cert-redeem'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'
import { InlineAction, ScreenHeading, ScreenHelp, ScreenHint, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'
import { VoterMedia } from '../parts/VoterMedia'
import { VoterTermsField } from '../parts/VoterTermsField'
import { VoteStatusLine } from '../parts/VoteStatusLine'
import { showsLiveResults } from '../voter-flow'

type CertIdentifyValues = { terms: boolean; contact: string }

/**
 * The screen's step, from the gateway's answer on this page: `start` (the terms and the certificate button), `redeem`
 * (a code without 2FA is being redeemed), `contact` (a code with 2FA, waiting for the email or phone), or a refusal
 * (`error`, or `mismatch` which brings the start back).
 */
type Mode = 'start' | 'mismatch' | 'error' | 'redeem' | 'contact'

const STICKY = STICKY_CERT_ERRORS as readonly string[]
const PROCESS = PROCESS_CERT_ERRORS as readonly string[]
const RETRYABLE = RETRYABLE_CERT_ERRORS as readonly string[]

/** A refusal a new login can't change (the browser offers the same certificate); process codes never retry. */
const isSticky = (code: string) => STICKY.includes(code) && !PROCESS.includes(code)

/** Copies this page's link for the voter's other device or browser, and says whether it worked. */
const CopyLink = () => {
  const { t } = useTranslation()
  const [result, setResult] = useState<'copied' | 'failed' | null>(null)
  return (
    <Stack gap='2'>
      <Button variant='outline' size='ballot' onClick={() => copyPageLink().then(setResult)}>
        {t('csp.cert.copy_link')}
      </Button>
      <Text role='status' textStyle='ballot-hint' color={result === 'failed' ? 'fg.error' : 'fg.muted'}>
        {result === 'copied' && t('csp.cert.link_copied')}
        {result === 'failed' && t('csp.cert.copy_failed')}
      </Text>
    </Stack>
  )
}

/**
 * Identify on a certificate census (board V4VoterWide 1 with a certificate): the terms and the certificate
 * button, which opens the gateway. The gateway's answer comes back to this page as `certReturn`: a code without
 * 2FA is redeemed here at once, one with 2FA asks for its contact first, and a refusal says how to go on.
 */
export const CertIdentifyScreen = ({
  notice,
  navigate,
}: {
  notice?: 'sessionExpired'
  navigate?: (url: string) => void
}) => {
  const { t } = useTranslation()
  const { election, moved, facts, state, brand, showResults, leaveReceipt } = useVoterFlow()
  const { twoFaFields, certReturn, clearCertReturn, setAuthData, setCurrentStep } = useCspAuthContext()
  const start = useStartCertAuth(navigate)
  const redeem = useCertRedeem()
  const { mutate } = redeem
  const formId = useId()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CertIdentifyValues>({ defaultValues: { terms: false, contact: '' } })
  // The browser is read after hydration: the server's HTML has the start button off, as the fields screen does.
  const [hydrated, setHydrated] = useState(false)
  const [platform, setPlatform] = useState<ReturnType<typeof inAppPlatform>>(null)
  const [pending, setPending] = useState(false)
  const [starting, setStarting] = useState(false)
  const [startFailed, setStartFailed] = useState(false)
  const electionId = election.id
  const readBrowser = useRef(false)
  const redeemed = useRef(false)

  useEffect(() => {
    setHydrated(true)
    setPlatform(inAppPlatform())
    // Once: a second read under StrictMode would find the hint already told.
    if (readBrowser.current) return
    readBrowser.current = true
    setPending(unansweredCertAuth(electionId))
  }, [electionId])

  // The page can come back from the back/forward cache after a visit to the gateway: the start is no longer loading,
  // and a gateway that never answered is told once more.
  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      setStarting(false)
      if (event.persisted) setPending(unansweredCertAuth(electionId, { restored: true }))
    }
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [electionId])

  const code = certReturn?.kind === 'code' ? certReturn : null
  const twoFactor = twoFaFields.length > 0
  // A code without 2FA is redeemed as soon as it is shown, once: it is single-use (StrictMode runs effects twice).
  useEffect(() => {
    if (!code || twoFactor || redeemed.current) return
    redeemed.current = true
    mutate({ certCode: code.certCode, codeVerifier: code.codeVerifier })
  }, [code, twoFactor, mutate])

  const mode: Mode = code
    ? twoFactor
      ? 'contact'
      : 'redeem'
    : certReturn?.kind === 'error'
      ? 'error'
      : certReturn?.kind === 'mismatch'
        ? 'mismatch'
        : 'start'
  const startMode = mode === 'start' || mode === 'mismatch'
  // Only the gateway's answer carries a code to show: a refused login names its code, a mismatch names none.
  const errorCode = certReturn?.kind === 'error' ? certReturn.code : certReturn?.kind === 'mismatch' ? 'mismatch' : null
  const reference = certReturn?.kind === 'error' ? certReturn.ref : undefined
  // An in-app browser can't present a certificate, so the way on is the link in the real browser.
  const inApp = !!platform && (startMode || errorCode === 'no_certificate')
  const showStartForm = startMode && !!start && !inApp
  const canRetry = !!errorCode && !!start && !inApp && (RETRYABLE.includes(errorCode) || isSticky(errorCode))
  const redeemFailed = (mode === 'redeem' || mode === 'contact') && redeem.isError

  const startLogin = async () => {
    if (!start) return
    setStarting(true)
    setStartFailed(false)
    try {
      await start()
    } catch {
      setStarting(false)
      setStartFailed(true)
    }
  }

  const onSubmit = async (values: CertIdentifyValues) => {
    if (mode === 'contact' && code) {
      const destination = buildCspAuthRequest({ contact: values.contact.trim() }, [], twoFaFields)
      try {
        await redeem.mutateAsync({ certCode: code.certCode, codeVerifier: code.codeVerifier, ...destination })
      } catch {
        return // shown by the screen: the code is spent, so the voter starts again
      }
      setAuthData({ email: destination.email, phone: destination.phone })
      setCurrentStep(1)
      clearCertReturn()
      return
    }
    await startLogin()
  }

  const unavailable = !start && startMode
  const failure = unavailable
    ? t('csp.cert.unavailable')
    : startFailed
      ? certErrorMessage(t, 'generic')
      : redeemFailed
        ? (redeem.error?.message ?? null)
        : errorCode
          ? certErrorMessage(t, errorCode)
          : null

  let primary: ReactNode
  if (redeemFailed) {
    primary = (
      <Button size='ballot' loading={starting} onClick={startLogin}>
        {t('csp.cert.start')}
      </Button>
    )
  } else if (mode === 'redeem') {
    primary = (
      <Button size='ballot' loading>
        {t('csp.cert.start')}
      </Button>
    )
  } else if (mode === 'contact') {
    primary = (
      <Button type='submit' form={formId} size='ballot' loading={redeem.isPending}>
        {t('voter.continue')}
      </Button>
    )
  } else if (inApp) {
    primary =
      platform === 'android' ? (
        <Button asChild size='ballot'>
          <a href={androidIntentUrl()}>{t('csp.cert.in_app.open')}</a>
        </Button>
      ) : undefined
  } else if (showStartForm) {
    primary = (
      <Button type='submit' form={formId} size='ballot' loading={starting} disabled={!hydrated}>
        {t('csp.cert.start')}
      </Button>
    )
  } else if (canRetry) {
    primary = (
      <Button size='ballot' loading={starting} onClick={startLogin}>
        {t('csp.cert.retry')}
      </Button>
    )
  }

  const contactHint = (
    <ScreenHint>
      {brand.name
        ? t('csp.cert.contact_organization', { organization: brand.name })
        : t('csp.cert.contact_organization_unnamed')}
      {reference && ` ${t('csp.cert.reference', { reference })}`}
    </ScreenHint>
  )

  return (
    <VoterScreenFrame kind='identify'>
      <VoteStatusLine />
      <ScreenHeading focus={moved} mt='2.5'>
        {textOf(election.title as Parameters<typeof textOf>[0])}
      </ScreenHeading>
      <ScreenHelp>
        {mode === 'contact'
          ? t('voter.identify.cert_contact_help')
          : state.checkReceipt
            ? t('voter.results.check_vote')
            : t('voter.identify.cert_help')}
      </ScreenHelp>
      <VoterMedia />
      {failure && (
        <Alert.Root status='error' layout='ballot' mt='5' role='alert'>
          <Alert.Content>
            <Alert.Description>{failure}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {notice === 'sessionExpired' && !failure && (
        <Alert.Root status='warning' layout='ballot' mt='5' role='status'>
          <Alert.Content>
            <Alert.Description>{t('voter.identify.session_expired')}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {inApp && (
        <>
          <Alert.Root status='warning' layout='ballot' mt='5'>
            <Alert.Content>
              <Alert.Description>{t('csp.cert.in_app.explanation')}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
          <ScreenHint>{t('csp.cert.in_app.steps')}</ScreenHint>
        </>
      )}
      {mode === 'start' && pending && showStartForm && (
        <>
          <Alert.Root status='warning' layout='ballot' mt='5'>
            <Alert.Content>
              <Alert.Description>{t('csp.cert.not_loaded')}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
          <Stack mt='4.5'>
            <CopyLink />
          </Stack>
        </>
      )}
      {mode === 'redeem' && !redeemFailed && (
        <Text role='status' textStyle='ballot-hint' color='fg.muted' mt='5'>
          {t('csp.cert.signing_in')}
        </Text>
      )}
      <chakra.form
        id={formId}
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        display='flex'
        flexDirection='column'
        gap='4.5'
        mt={notice === 'sessionExpired' || failure ? '4.5' : '7'}
      >
        {showStartForm && <VoterTermsField control={control} invalid={!!errors.terms} />}
        {mode === 'contact' && !redeemFailed && (
          <Field.Root size='ballot' invalid={!!errors.contact}>
            <Field.Label>{getContactFieldLabel(t, twoFaFields)}</Field.Label>
            <Input
              size='ballot'
              {...getContactFieldInputProps(twoFaFields)}
              {...register('contact', { required: true, validate: (value) => value.trim() !== '' })}
            />
            {errors.contact && <Field.ErrorText>{t('voter.identify.field_required')}</Field.ErrorText>}
            <Field.HelperText>{t('csp.contact_match_help')}</Field.HelperText>
          </Field.Root>
        )}
      </chakra.form>
      {showStartForm && (
        <>
          <ScreenHint>{t('csp.cert.picker_help')}</ScreenHint>
          <ScreenHint>{t('csp.cert.not_a_certificate')}</ScreenHint>
        </>
      )}
      {errorCode && isSticky(errorCode) && !inApp && <ScreenHint>{t('csp.cert.restart_browser')}</ScreenHint>}
      {errorCode === 'no_certificate' && !inApp && (
        <>
          <ScreenHint>{t('csp.cert.other_device')}</ScreenHint>
          <Stack mt='4.5'>
            <CopyLink />
          </Stack>
        </>
      )}
      {(errorCode || mode === 'contact') && contactHint}
      <VoterActionBar
        secondary={
          inApp ? (
            <CopyLink />
          ) : state.checkReceipt ? (
            <Button variant='outline' size='ballot' onClick={leaveReceipt}>
              {t('voter.back')}
            </Button>
          ) : undefined
        }
        primary={primary}
        note={
          showsLiveResults(facts) ? (
            // data-testid: the e2e observer reaches the live count through this link; its only other handle is copy.
            <InlineAction testId='voter-show-results' onClick={() => showResults(true)}>
              {t('voter.results.show')}
            </InlineAction>
          ) : undefined
        }
      />
    </VoterScreenFrame>
  )
}

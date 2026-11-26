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
  FieldRoot as FormControl,
  Link,
  Portal,
  Stack,
  Text,
} from '@chakra-ui/react'
import { useComponents, useElection, useElectionAuth, useReactComponentsLocalize } from '@vocdoni/react-components'
import { useEffect, useState, type ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { CloseButton } from '~components/ui/CloseButton'
import { DialogHeader } from '~components/ui/DialogHeader'
import { normalizePublicLanguageCandidate } from '~i18n/public-language'
import { useAppEnv, useLanguagesEnv } from '~src/app-env'
import { inAppPlatform } from './browser-support'
import { certErrorMessage } from './cert-messages'
import { androidIntentUrl, copyPageLink } from './cert-page'
import { startCertAuth, unansweredCertAuth } from './cert-auth'

// The voter side of a certificate census (`census.certAuth`) on the Home and shared-census pages: the packaged CspAuth
// renders nothing for those censuses, so the app draws the button and the terms here, with the same themed slots.
// A certificate login always ends on the voting page, which handles its answer (Process/voter/).

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
export const useStartCertAuth = (navigate: (url: string) => void = (url) => window.location.assign(url)) => {
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

/** Copies the voting page's link, saying whether it worked. */
const CopyLinkButton = () => {
  const { t } = useTranslation()
  const [result, setResult] = useState<'copied' | 'failed' | null>(null)
  return (
    <Stack gap='1'>
      <Button w='full' variant='outline' onClick={() => copyPageLink().then(setResult)}>
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
          <a href={androidIntentUrl()}>{t('csp.cert.in_app.open', { defaultValue: 'Open in your browser' })}</a>
        </Button>
      )}
      <CopyLinkButton />
    </Stack>
  )
}

/**
 * A button that starts a certificate login: loading until the page leaves for the gateway, or back to
 * normal with the generic error if the login can't start.
 */
const StartCertAuthButton = ({
  start,
  disabled,
  children,
}: {
  start: () => Promise<void>
  disabled?: boolean
  children: ReactNode
}) => {
  const { t } = useTranslation()
  const [starting, setStarting] = useState(false)
  const [failed, setFailed] = useState(false)

  // the page can come back from the back/forward cache after a navigation to the gateway
  useEffect(() => {
    const reset = () => setStarting(false)
    window.addEventListener('pageshow', reset)
    return () => window.removeEventListener('pageshow', reset)
  }, [])

  return (
    <>
      {failed && (
        <Alert status='error'>
          <AlertIndicator />
          <AlertDescription>{certErrorMessage(t, 'generic')}</AlertDescription>
        </Alert>
      )}
      <Button
        w='full'
        disabled={disabled}
        loading={starting}
        onClick={async () => {
          setStarting(true)
          setFailed(false)
          try {
            await start()
          } catch {
            setStarting(false)
            setFailed(true)
          }
        }}
      >
        {children}
      </Button>
    </>
  )
}

/** Step 0 of a certificate census: the terms, then the certificate button. */
export const CertAuthStart = ({ navigate }: { navigate?: (url: string) => void }) => {
  const { t } = useTranslation()
  const { election } = useElection()
  const start = useStartCertAuth(navigate)
  const [accepted, setAccepted] = useState(false)
  // a login this tab started moments ago that never came back with an answer
  const [pending, setPending] = useState(() => !!election && unansweredCertAuth(election.id))

  // the page can come back from the back/forward cache after a navigation to the gateway
  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      // restored from the back/forward cache, e.g. going back from the browser's error page for a
      // gateway that didn't load: tell the voter, once
      if (event.persisted) setPending(!!election && unansweredCertAuth(election.id, { restored: true }))
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
      <StartCertAuthButton start={start} disabled={!accepted}>
        {t('csp.cert.start', { defaultValue: 'Sign in with a digital certificate' })}
      </StartCertAuthButton>
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

/** The identify button of a certificate census, in place of the packaged CspAuth's. */
export const CertAuthConnect = () => <CertAuthControls />

const CertAuthControls = () => {
  const rc = useReactComponentsLocalize()
  const { CspAuthTrigger } = useComponents()
  const { connected } = useElectionAuth()
  const [open, setOpen] = useState(false)

  if (connected) return null
  return (
    <>
      <CspAuthTrigger label={rc('csp.identify')} onClick={() => setOpen(true)} />
      <CertAuthDialog open={open} onClose={() => setOpen(false)}>
        <CertAuthStart />
      </CertAuthDialog>
    </>
  )
}

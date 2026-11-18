import { Alert, Button, chakra, PinInput } from '@chakra-ui/react'
import { useEffect, useId, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useCspAuthContext } from '~components/Process/CSP/CSPStepsProvider'
import {
  KnownCspError,
  useCspAuth1,
  useCspAuthPending,
  useCspResend,
  useIsCspAuthBusy,
} from '~components/Process/CSP/basics'
import { useVoterFlow } from '../flow-context'
import { maskContact, textOf } from '../format'
import {
  InlineAction,
  ScreenHeading,
  ScreenHelp,
  ScreenHint,
  ScreenKicker,
  VoterScreenFrame,
} from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'

const DIGITS = 6
const empty = () => Array.from({ length: DIGITS }, () => '')

/**
 * The one-time code (board V4VoterWide 2): today's step 1 logic with the board's look. Six boxes that submit
 * themselves, resend, and "Enrere" back to identify (today's start over). The expiry sentence and the SMS switch are
 * omitted: nothing feeds them (audit F10).
 */
export const CodeScreen = () => {
  const { t } = useTranslation()
  const { election, moved } = useVoterFlow()
  const { authData, resetFlow } = useCspAuthContext()
  const formId = useId()
  const auth = useCspAuth1()
  const resend = useCspResend()
  const pending = useCspAuthPending()
  const isAuthBusy = useIsCspAuthBusy()
  const [code, setCode] = useState<string[]>(empty)
  const [resent, setResent] = useState(false)
  const [validation, setValidation] = useState<string | null>(null)
  const complete = code.every((digit) => digit.trim() !== '')

  const submit = (digits: string[]) => {
    // Also guards the auto-submit, which runs before a render could disable the button.
    if (isAuthBusy()) return
    const filled = digits.filter((digit) => digit.trim() !== '').length
    if (filled < DIGITS) {
      // Same messages as the dialog's code step.
      setValidation(filled === 0 ? t('csp.step1.validation.required') : t('csp.step1.validation.length'))
      return
    }
    setValidation(null)
    auth.mutate(digits.join(''))
  }

  const sendAgain = async () => {
    if (isAuthBusy()) return
    setResent(false)
    try {
      await resend.mutateAsync({ email: authData.email, phone: authData.phone })
      setResent(true)
    } catch {
      // The mutation keeps the error for the screen.
    }
  }

  // A refusal the app words keeps its message; anything else is the SDK's own text, which the voter never sees:
  // a generic sentence instead, and the error in the console for support.
  const failure = auth.error ?? resend.error
  const knownFailure = failure instanceof KnownCspError
  useEffect(() => {
    if (failure && !knownFailure) console.error('Voter code step failed:', failure)
  }, [failure, knownFailure])
  const failureMessage = !failure
    ? undefined
    : knownFailure
      ? failure.message
      : auth.error
        ? t('csp.auth_failed')
        : t('csp.step1.resend_failed')
  const errorMessage = validation ?? failureMessage

  return (
    <VoterScreenFrame kind='code'>
      <ScreenKicker>{textOf(election.title as Parameters<typeof textOf>[0])}</ScreenKicker>
      <ScreenHeading focus={moved}>{t('voter.code.title')}</ScreenHeading>
      <ScreenHelp>{t('voter.code.sent_to', { contact: maskContact(authData.email ?? authData.phone) })}</ScreenHelp>
      <chakra.form
        id={formId}
        mt='7'
        onSubmit={(event) => {
          event.preventDefault()
          submit(code)
        }}
      >
        <PinInput.Root
          variant='field'
          size='ballot'
          count={DIGITS}
          otp
          // Empty boxes are blank, as the board draws them, not Ark's "○" (conformance pass 2, N-1).
          placeholder=''
          autoFocus
          value={code}
          invalid={!!auth.error || !!validation}
          aria-label={t('voter.code.label')}
          onValueChange={({ value }) => {
            setValidation(null)
            setCode(Array.from({ length: DIGITS }, (_, index) => value[index] ?? ''))
          }}
          onValueComplete={({ value }) => submit(value)}
        >
          <PinInput.HiddenInput />
          <PinInput.Control display='flex' gap={{ base: '2', md: '2.5' }}>
            {Array.from({ length: DIGITS }, (_, index) => (
              <PinInput.Input key={index} index={index} />
            ))}
          </PinInput.Control>
        </PinInput.Root>
      </chakra.form>
      {errorMessage && (
        <Alert.Root status='error' layout='ballot' mt='6' role='alert'>
          <Alert.Content>
            <Alert.Description>{errorMessage}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      <ScreenHint>
        {resent ? (
          t('voter.code.resent')
        ) : (
          <Trans
            i18nKey='voter.code.resend'
            components={{ resend: <InlineAction onClick={sendAgain} disabled={pending} /> }}
          />
        )}
      </ScreenHint>
      <ScreenHint>{t('voter.code.spam_hint')}</ScreenHint>
      <VoterActionBar
        secondary={
          <Button variant='outline' size='ballot' onClick={resetFlow} disabled={pending}>
            {t('voter.back')}
          </Button>
        }
        primary={
          // Always a submit button: pressed with a short code it names the missing digits instead of staying silent.
          <Button
            type='submit'
            form={formId}
            size='ballot'
            variant={complete ? undefined : 'off'}
            aria-disabled={complete ? undefined : true}
            loading={pending}
          >
            {t('voter.continue')}
          </Button>
        }
      />
    </VoterScreenFrame>
  )
}

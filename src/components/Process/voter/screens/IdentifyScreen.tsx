import { Alert, Button, chakra, Field, Input } from '@chakra-ui/react'
import { hashMemberPassword } from '@vocdoni/api-client'
import { useEffect, useId, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { stashCrispIdentity } from '~components/Process/CrispNickname'
import { buildCspAuthRequest } from '~components/Process/voter/csp/auth-request'
import { useCspAuthContext } from '~components/Process/voter/csp/CspStepsProvider'
import { useIsCspAuthBusy } from '~components/Process/voter/csp/basics'
import {
  getAuthFieldInputType,
  getAuthFieldLabel,
  getContactFieldInputProps,
  getContactFieldLabel,
} from '~components/Process/Create/VoterAuthentication/fields'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'
import { InlineAction, ScreenHeading, ScreenHelp, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'
import { VoteStatusLine } from '../parts/VoteStatusLine'
import { VoterMedia } from '../parts/VoterMedia'
import { VoterTermsField } from '../parts/VoterTermsField'
import { showsLiveResults } from '../voter-flow'
import { useVoterIdentify } from '../use-voter-identify'
import { CertIdentifyScreen } from './CertIdentifyScreen'

type IdentifyValues = Record<string, string | boolean>

// The Crisp nickname, as the dashboard's identify dialog sets it: the first census field that is not the password, as
// "<field> <value>", else the contact as "email" or "phone". Read before the password is hashed, and never from it.
const crispIdentity = (request: Record<string, string>, authFields: readonly string[]) => {
  const field = authFields.find((name) => name !== 'password' && request[name])
  if (field) return `${field} ${request[field]}`
  if (request.email) return `email ${request.email}`
  if (request.phone) return `phone ${request.phone}`
  return undefined
}

/**
 * Identify (board V4VoterWide 1, mismatch V4VoterWideLive 7): the census's fields, the contact when it sends a code,
 * the terms, one button. A failed match marks every field and names none (audit F10); other refusals keep today's
 * messages and mark nothing.
 */
const FieldsIdentifyScreen = ({ notice }: { notice?: 'sessionExpired' }) => {
  const { t } = useTranslation()
  const { election, facts, state, moved, showResults, leaveReceipt } = useVoterFlow()
  const { authFields, twoFaFields, setAuthData, setCurrentStep } = useCspAuthContext()
  const formId = useId()
  const identify = useVoterIdentify()
  const isAuthBusy = useIsCspAuthBusy()
  const submitting = useRef(false)
  const [hashFailed, setHashFailed] = useState(false)
  // Until hydration a click would submit the form natively, as a GET with the voter's details in the URL: the button
  // stays off until React owns the form.
  const [hydrated, setHydrated] = useState(false)
  useEffect(() => setHydrated(true), [])
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<IdentifyValues>({ defaultValues: { terms: false } })
  const twoFactor = twoFaFields.length > 0
  const hasPassword = authFields.includes('password')
  const fields = [
    ...authFields.filter((field) => field !== 'password'),
    ...authFields.filter((field) => field === 'password'),
  ]
  const mismatch = identify.error?.mismatch === true
  const unknownFailure = !!identify.error && !mismatch && !identify.error.known
  // The SDK's raw message never reaches the voter; support gets it from the console.
  useEffect(() => {
    if (unknownFailure) console.error('Voter identification failed:', identify.error?.cause ?? identify.error)
  }, [unknownFailure, identify.error])

  const onSubmit = async (values: IdentifyValues) => {
    if (submitting.current || isAuthBusy()) return
    submitting.current = true
    setHashFailed(false)
    try {
      const { terms: _terms, ...answers } = values
      const request = buildCspAuthRequest(answers as Record<string, string>, authFields, twoFaFields) as Record<
        string,
        string
      >
      stashCrispIdentity(crispIdentity(request, authFields))
      // The plaintext password never leaves the browser: the request carries its hash, salted with the organisation.
      if (request.password) {
        try {
          request.password = await hashMemberPassword(election.orgAddress ?? '', request.password)
        } catch (error) {
          console.error('CSP password hashing failed:', error)
          setHashFailed(true)
          return
        }
      }
      await identify.mutateAsync(request)
      setAuthData({ email: request.email, phone: request.phone })
      if (twoFactor) setCurrentStep(1)
    } catch {
      // The mutation keeps the error for the screen.
    } finally {
      submitting.current = false
    }
  }

  const failure = hashFailed
    ? t('csp.password_unavailable')
    : identify.error
      ? mismatch && !hasPassword
        ? t('voter.identify.mismatch')
        : unknownFailure
          ? t('voter.identify.failed')
          : identify.error.message
      : null

  return (
    <VoterScreenFrame kind='identify'>
      <VoteStatusLine />
      <ScreenHeading focus={moved} mt='2.5'>
        {textOf(election.title as Parameters<typeof textOf>[0])}
      </ScreenHeading>
      {/* After "Comprova el teu vot" on an ended vote the voter identifies to check, not to vote (gate F7). */}
      <ScreenHelp>{state.checkReceipt ? t('voter.results.check_vote') : t('voter.identify.help')}</ScreenHelp>
      <VoterMedia />
      {notice === 'sessionExpired' && !failure && (
        <Alert.Root status='warning' layout='ballot' mt='5' role='status'>
          <Alert.Content>
            <Alert.Description>{t('voter.identify.session_expired')}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      {failure && (
        <Alert.Root status='error' layout='ballot' mt='5' role='alert'>
          <Alert.Content>
            <Alert.Description>{failure}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}
      <chakra.form
        id={formId}
        method='post'
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        display='flex'
        flexDirection='column'
        gap='4.5'
        mt={notice === 'sessionExpired' || failure ? '4.5' : '7'}
      >
        {fields.map((field) => (
          <Field.Root key={field} size='ballot' invalid={mismatch || !!errors[field]}>
            <Field.Label>{getAuthFieldLabel(t, field)}</Field.Label>
            <Input
              size='ballot'
              type={getAuthFieldInputType(field)}
              autoComplete='off'
              {...register(field, { required: true, validate: (value) => String(value).trim() !== '' })}
            />
            {errors[field] && <Field.ErrorText>{t('voter.identify.field_required')}</Field.ErrorText>}
          </Field.Root>
        ))}
        {twoFactor && (
          <Field.Root size='ballot' invalid={mismatch || !!errors.contact}>
            <Field.Label>{getContactFieldLabel(t, twoFaFields)}</Field.Label>
            <Input
              size='ballot'
              {...getContactFieldInputProps(twoFaFields)}
              {...register('contact', { required: true, validate: (value) => String(value).trim() !== '' })}
            />
            {errors.contact && <Field.ErrorText>{t('voter.identify.field_required')}</Field.ErrorText>}
            <Field.HelperText>{t('csp.contact_match_help')}</Field.HelperText>
          </Field.Root>
        )}
        <VoterTermsField control={control} invalid={!!errors.terms} />
      </chakra.form>
      <VoterActionBar
        // Back leaves "Comprova el teu vot" for the closed screen; a plain identify has no earlier step to go back to.
        secondary={
          state.checkReceipt ? (
            <Button variant='outline' size='ballot' onClick={leaveReceipt}>
              {t('voter.back')}
            </Button>
          ) : undefined
        }
        primary={
          <Button type='submit' form={formId} size='ballot' loading={identify.isPending} disabled={!hydrated}>
            {failure ? t('voter.identify.retry') : t('voter.continue')}
          </Button>
        }
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

/**
 * The identify screen of the voter page: a certificate census signs the voter in with a digital certificate, any other
 * census asks for its fields.
 */
export const IdentifyScreen = ({ notice }: { notice?: 'sessionExpired' }) => {
  const { election } = useVoterFlow()
  return election.census?.certAuth ? <CertIdentifyScreen notice={notice} /> : <FieldsIdentifyScreen notice={notice} />
}

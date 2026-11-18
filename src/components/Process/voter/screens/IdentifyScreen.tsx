import { Alert, Button, chakra, Checkbox, Field, Input, Link } from '@chakra-ui/react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { buildCspAuthRequest } from '~components/Process/CSP/auth-request'
import { useCspAuthContext } from '~components/Process/CSP/CSPStepsProvider'
import { useIsCspAuthBusy } from '~components/Process/CSP/basics'
import { getAuthFieldInputType, getAuthFieldLabel, getContactFieldLabel } from '~components/Process/CSP/fields'
import { useAppEnv } from '~src/app-env'
import { hashMemberPassword } from '~utils/member-password'
import { useVoterFlow } from '../flow-context'
import { textOf } from '../format'
import { InlineAction, ScreenHeading, ScreenHelp, VoterScreenFrame } from '../parts/ScreenParts'
import { VoterActionBar } from '../parts/VoterActionBar'
import { VoteStatusLine } from '../parts/VoteStatusLine'
import { VoterMedia } from '../parts/VoterMedia'
import { useVoterIdentify } from '../use-voter-identify'

type IdentifyValues = Record<string, string | boolean>

// The refusals `useTranslateCspError` words itself, as the screen sees them. Anything else is the SDK's own message,
// which is never shown. The counted ones are listed up to a week of waiting.
const knownCspErrorKeys = [
  'csp.errors.participant_not_found',
  'csp.errors.credentials_or_password_incorrect',
  'csp.errors.too_many_attempts',
  'csp.errors.requests_on_cooldown',
  'csp.errors.zero_voting_weight',
]

/**
 * Identify (board V4VoterWide 1, mismatch V4VoterWideLive 7): the census's fields, the contact when it sends a code,
 * the terms, one button. A failed match marks every field and names none (audit F10); other refusals keep today's
 * messages and mark nothing.
 */
export const IdentifyScreen = ({ notice }: { notice?: 'sessionExpired' }) => {
  const { t } = useTranslation()
  const { election, facts, moved, showResults } = useVoterFlow()
  const { authFields, twoFaFields, setAuthData, setCurrentStep } = useCspAuthContext()
  const { TERMS_OF_SERVICE_URL, PRIVACY_POLICY_URL } = useAppEnv()
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
  const knownMessages = useMemo(() => {
    const known = new Set(knownCspErrorKeys.map((key) => t(key)))
    for (let count = 1; count < 60; count++) known.add(t('csp.errors.too_many_attempts_minutes', { count }))
    for (let count = 1; count <= 168; count++) known.add(t('csp.errors.too_many_attempts_hours', { count }))
    return known
  }, [t])
  const unknownFailure = !!identify.error && !mismatch && !knownMessages.has(identify.error.message)
  // The SDK's raw message never reaches the voter; support gets it from the console.
  useEffect(() => {
    if (unknownFailure) console.error('Voter identification failed:', identify.error)
  }, [unknownFailure, identify.error])
  // Secret until the end: the count stays hidden, but once the vote is over the results are public (audit F16).
  const showLiveResults =
    !facts.secretUntilTheEnd || facts.endedBySchedule || facts.status === 'ENDED' || facts.status === 'RESULTS'

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
      <ScreenHelp>{t('voter.identify.help')}</ScreenHelp>
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
              type='text'
              autoComplete='off'
              {...register('contact', { required: true, validate: (value) => String(value).trim() !== '' })}
            />
            {errors.contact && <Field.ErrorText>{t('voter.identify.field_required')}</Field.ErrorText>}
            <Field.HelperText textStyle='body' color='fg.subtle'>
              {t('csp.contact_match_help')}
            </Field.HelperText>
          </Field.Root>
        )}
        <Field.Root invalid={!!errors.terms}>
          <Controller
            name='terms'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange, onBlur, name } }) => (
              <Checkbox.Root
                size='ballot'
                alignItems='flex-start'
                gap='3'
                color='fg.muted'
                name={name}
                checked={value === true}
                onCheckedChange={(details) => onChange(details.checked === true)}
              >
                <Checkbox.HiddenInput onBlur={onBlur} />
                <Checkbox.Control mt='ballot.mark' />
                <Checkbox.Label>
                  <Trans
                    i18nKey='voter.identify.terms'
                    components={{
                      terms: <Link href={TERMS_OF_SERVICE_URL} target='_blank' rel='noopener noreferrer' />,
                      privacy: <Link href={PRIVACY_POLICY_URL} target='_blank' rel='noopener noreferrer' />,
                    }}
                  />
                </Checkbox.Label>
              </Checkbox.Root>
            )}
          />
          {errors.terms && <Field.ErrorText>{t('voter.identify.terms_required')}</Field.ErrorText>}
        </Field.Root>
      </chakra.form>
      <VoterActionBar
        primary={
          <Button type='submit' form={formId} size='ballot' loading={identify.isPending} disabled={!hydrated}>
            {failure ? t('voter.identify.retry') : t('voter.continue')}
          </Button>
        }
        note={
          showLiveResults ? (
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

import {
  Box,
  Button,
  CheckboxCard,
  CheckboxGroup,
  Dialog,
  Flex,
  Grid,
  HStack,
  Icon,
  RadioCard,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { TFunction } from 'i18next'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuChevronDown, LuCircleAlert, LuEye } from 'react-icons/lu'
import { getApiErrorMessage } from '~components/Auth/api'
import { AUTH_FIELDS, getAuthFieldLabel } from '~components/Process/CSP/fields'
import { useToast } from '~components/Toast'
import type { Group } from '~src/queries/groups'
import { useAppEnv } from '~src/app-env'
import { useCertificateAuthMode } from '~src/queries/certificateAuth/mode'
import { coverageFromCheck, type CertificateCoverage } from '~src/queries/certificateAuth/warnings'
import { buildCensusSpec } from '../census-spec'
import { Census, Process } from '../common'
import { MemberCheck } from './MemberCheck'
import { CertificatePreview } from './Certificate/CertificatePreview'
import { CertificateStatus } from './Certificate/CertificateStatus'
import { CertificateSteps } from './Certificate/CertificateSteps'
import { AuthMethodChoice, MethodStep } from './Certificate/MethodStep'
import { ProtectionMeter } from './ProtectionLevel'
import { type CensusCheckResult, useCensusCheck } from './useCensusCheck'
import {
  CERTIFICATE_CENSUS,
  CodeMethod,
  countedCredentials,
  fromCensus,
  getCodeTwoFaFields,
  hasAuthConfig,
  MAX_AUTH_FIELDS,
  optionCardStyles,
  PASSWORD_CREDENTIAL,
  passwordNeedsAnotherCredential,
  toCensus,
  VoterAuthField,
  VoterAuthFormData,
} from './utils'
import { VoterSignInPreview } from './VoterSignInPreview'

const codeMethods: CodeMethod[] = ['none', 'email', 'sms', 'voter_choice']

const getCodeMethodLabel = (t: TFunction, method: CodeMethod) => {
  switch (method) {
    case 'email':
      return t('voter_auth.code.email_label', { defaultValue: 'Email' })
    case 'sms':
      return t('voter_auth.code.sms_label', { defaultValue: 'SMS' })
    case 'voter_choice':
      return t('voter_auth.code.voter_choice', { defaultValue: 'Email or SMS' })
    default:
      return t('voter_auth.code.none', { defaultValue: 'No code' })
  }
}

const getCodeMethodDescription = (t: TFunction, method: CodeMethod) => {
  switch (method) {
    case 'email':
      return t('voter_auth.code.email_description', {
        defaultValue: 'Sent to the email in your member list.',
      })
    case 'sms':
      return t('voter_auth.code.sms_description', {
        defaultValue: 'Sent to the phone number in your member list.',
      })
    case 'voter_choice':
      return t('voter_auth.code.voter_choice_description', {
        defaultValue: 'Each voter picks where to receive it.',
      })
    default:
      return t('voter_auth.code.none_description', {
        defaultValue: 'Voters sign in with their details only.',
      })
  }
}

const formatList = (language: string, items: string[], type: 'conjunction' | 'disjunction') => {
  try {
    return new Intl.ListFormat(language, { type }).format(items)
  } catch {
    return items.join(', ')
  }
}

/**
 * How the member check names the fields behind each problem, mirroring the
 * backend's rules (saas-backend `aggregateMemberFields`):
 * - missing data: any chosen detail is empty, or ALL the code contacts are, so
 *   "Member Number or Email" (and "both Email and Phone" for voter's choice);
 * - duplicates: the details plus one contact match another member's (either
 *   contact for voter's choice), so "Member Number and Email or Phone".
 */
const describeFields = (t: TFunction, language: string, { credentials, codeMethod }: VoterAuthFormData) => {
  const details = credentials.map((field) => getAuthFieldLabel(t, field))
  // The backend leaves the password out of duplicate detection, so it never shares a clash.
  const duplicateDetails = credentials
    .filter((field) => field !== PASSWORD_CREDENTIAL)
    .map((field) => getAuthFieldLabel(t, field))
  const contacts = getCodeTwoFaFields(codeMethod).map((field) =>
    field === 'email'
      ? t('csp.fields.email', { defaultValue: 'Email' })
      : t('csp.fields.phone', { defaultValue: 'Phone' })
  )
  const missingContact =
    contacts.length > 1
      ? t('voter_auth.status.both_contacts', {
          defaultValue: 'both {{contacts}}',
          contacts: formatList(language, contacts, 'conjunction'),
        })
      : contacts[0]

  return {
    missing: formatList(language, missingContact ? [...details, missingContact] : details, 'disjunction'),
    duplicate: formatList(
      language,
      contacts.length ? [...duplicateDetails, formatList(language, contacts, 'disjunction')] : duplicateDetails,
      'conjunction'
    ),
    /** The name of one part of the per-field breakdown: an auth field id, or 'contact'. */
    of: (field: string) => (field === 'contact' ? (missingContact ?? field) : getAuthFieldLabel(t, field)),
  }
}

type VoterAuthFormProps = {
  census?: Census | null
  group?: Group | null
  onCancel: () => void
  onSave: (census: Census) => void
}

/**
 * The body of the voter sign-in dialog. Holds its own form, seeded from the
 * saved census: it is mounted only while the dialog is open, so closing it
 * discards whatever was not saved, and nothing reaches the process form (and
 * its draft autosave) until Save.
 */
export const VoterAuthForm = ({ census, group, onCancel, onSave }: VoterAuthFormProps) => {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const { DISABLE_ANONYMOUS_VOTING: disableAnonymousVoting } = useAppEnv()
  const { watch: watchProcess } = useFormContext<Process>()
  const [groupId, anonymousVoting, weightedVote] = watchProcess(['groupId', 'anonymousVoting', 'weightedVote'])

  // When the flag is off, skip the method choice and go straight to details.
  const offerCertificate = useCertificateAuthMode() !== 'off'
  const [method, setMethod] = useState<AuthMethodChoice | null>(() =>
    !offerCertificate ? 'details' : census ? (census.method ?? 'details') : null
  )

  // Open bucket ids and dup-toggle ref for the certificate check panel.
  const [openBuckets, setOpenBuckets] = useState<string[]>([])
  const duplicatesToggleRef = useRef<HTMLButtonElement | null>(null)
  const [attempted, setAttempted] = useState(false)

  const { control, watch } = useForm<VoterAuthFormData>({ defaultValues: fromCensus(census) })
  const credentials = watch('credentials') ?? []
  const codeMethod = watch('codeMethod') ?? 'none'
  const values: VoterAuthFormData = { credentials, codeMethod }
  const configured = hasAuthConfig(values)
  // A password alone is refused before saving, so the backend never gets a census it would reject.
  const passwordAlone = passwordNeedsAnotherCredential(credentials, codeMethod)

  // The census being checked / published depends on the chosen method.
  const editingCensus = method === 'certificate' ? CERTIFICATE_CENSUS : toCensus(values)
  const spec = buildCensusSpec(
    { groupId, anonymousVoting, weightedVote, census: editingCensus },
    disableAnonymousVoting
  )
  // Certificate: always check when a method is chosen. Details: skip the
  // password-alone state that the backend would refuse anyway.
  const censusCheck = useCensusCheck(spec, { enabled: method !== null && (method === 'certificate' || !passwordAlone) })
  const statusRef = useRef<HTMLDivElement>(null)
  const statusSlotRef = useRef<HTMLDivElement>(null)

  // Coverage for the certificate path, from the last settled check or its
  // previous result while re-checking so the panel doesn't flicker.
  const certCoverage: CertificateCoverage | null = (() => {
    if (method !== 'certificate') return null
    const { status, nationalIdWarnings, issues, previous } = censusCheck
    if (status === 'valid' || status === 'invalid') {
      return coverageFromCheck(nationalIdWarnings, issues)
    }
    if (status === 'checking' && previous) {
      return coverageFromCheck(previous.nationalIdWarnings, previous.issues)
    }
    return null
  })()
  // Duplicate national IDs block saving just as duplicate member details do in develop.
  const blocked = (certCoverage?.duplicates.length ?? 0) > 0

  const [saving, setSaving] = useState(false)
  const [emptyAttempt, setEmptyAttempt] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const valuesKey = JSON.stringify(values)
  useEffect(() => setEmptyAttempt(false), [valuesKey])

  // Closing the dialog mid-save discards the edit: nothing may be saved after that.
  const mounted = useRef(false)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  // A dimmed previous outcome was computed for the details ticked before the
  // current ones, so while re-checking its labels come from those.
  const settledValues = useRef(values)
  if (censusCheck.status !== 'checking') settledValues.current = values
  const fieldNames = describeFields(
    t,
    i18n.language,
    censusCheck.status === 'checking' ? settledValues.current : values
  )

  const groupTitle = group?.isAutoGroup
    ? t('groups_board.auto_group.title', { defaultValue: 'All Members' })
    : group?.title

  const handleMethodChange = (m: AuthMethodChoice) => {
    setMethod(m)
    setEmptyAttempt(false)
    setAttempted(false)
  }

  const handleSave = async () => {
    if (method === null) {
      setEmptyAttempt(true)
      statusSlotRef.current?.focus()
      return
    }

    if (method === 'certificate') {
      // Duplicates must be fixed before saving; focus the offending bucket toggle.
      if (blocked) {
        setAttempted(true)
        setOpenBuckets((ids) => (ids.includes('dup') ? ids : [...ids, 'dup']))
        requestAnimationFrame(() => {
          duplicatesToggleRef.current?.scrollIntoView({ block: 'center' })
          duplicatesToggleRef.current?.focus({ preventScroll: true })
        })
        return
      }

      setSaving(true)
      let checked = true
      try {
        const result = await censusCheck.check()
        if (!result.valid) {
          // Fresh check might reveal duplicates the debounced check didn't catch.
          // strict: false disables strictNullChecks so discriminated-union narrowing
          // does not work; cast to the failed branch explicitly.
          const { issues } = result as Extract<CensusCheckResult, { valid: false }>
          const fresh = coverageFromCheck(issues.nationalIdWarnings, issues)
          if (fresh.duplicates.length > 0) {
            setAttempted(true)
            setOpenBuckets((ids) => (ids.includes('dup') ? ids : [...ids, 'dup']))
            requestAnimationFrame(() => {
              duplicatesToggleRef.current?.scrollIntoView({ block: 'center' })
              duplicatesToggleRef.current?.focus({ preventScroll: true })
            })
            return
          }
          // Missing or invalid DNIs don't block; organizer chose to save anyway.
        }
      } catch (error) {
        // A 400 without member issues means the census itself is unusable.
        if (error instanceof VocdoniApiError && error.status === 400) {
          if (mounted.current) {
            toast({
              title: t('voter_auth.save.failed', { defaultValue: 'Sign-in settings not saved' }),
              description: getApiErrorMessage(error),
              type: 'error',
              duration: 5000,
              isClosable: true,
            })
          }
          return
        }
        // Network or server error: allow saving with a warning.
        checked = false
      } finally {
        setSaving(false)
      }

      if (!mounted.current) return
      if (!checked) {
        toast({
          title: t('voter_auth.save.unchecked', { defaultValue: "Saved, but we couldn't check your member list" }),
          type: 'warning',
          duration: 5000,
          isClosable: true,
        })
      }
      onSave(CERTIFICATE_CENSUS)
      return
    }

    // Details path (develop's flow, unchanged).
    // A refused save moves focus to the status line beside the button, which
    // already says why: no separate error message.
    if (!configured) {
      setEmptyAttempt(true)
      statusRef.current?.focus()
      return
    }
    // Save is disabled in this state; this only guards a call that gets past it.
    if (passwordAlone) return

    setSaving(true)
    let checked = true
    try {
      const result = await censusCheck.check()
      if (!result.valid) {
        statusRef.current?.focus()
        return
      }
    } catch (error) {
      // A 400 without member issues means the backend rejected the census itself
      // (e.g. its group is gone): saving would store a census that cannot work.
      if (error instanceof VocdoniApiError && error.status === 400) {
        if (mounted.current) {
          toast({
            title: t('voter_auth.save.failed', { defaultValue: 'Sign-in settings not saved' }),
            description: getApiErrorMessage(error),
            type: 'error',
            duration: 5000,
            isClosable: true,
          })
        }
        return
      }
      // The check itself failed (network, server, permissions): that says
      // nothing about the members, so it must not trap the admin here.
      checked = false
    } finally {
      setSaving(false)
    }

    if (!mounted.current) return
    if (!checked) {
      toast({
        title: t('voter_auth.save.unchecked', { defaultValue: "Saved, but we couldn't check your member list" }),
        type: 'warning',
        duration: 5000,
        isClosable: true,
      })
    }
    onSave(toCensus(values))
  }

  return (
    <>
      <Dialog.Header
        px={6}
        pt={5}
        pb={4}
        pe={12}
        borderBottomWidth='1px'
        flexDirection='column'
        alignItems='start'
        gap={0.5}
      >
        <Dialog.Title>{t('voter_auth.modal.title', { defaultValue: 'How will voters sign in?' })}</Dialog.Title>
        {groupTitle && (
          <Dialog.Description fontSize='sm' color='fg.muted'>
            {t('voter_auth.modal.group_summary', {
              defaultValue: '{{group}} · {{count}} members',
              group: groupTitle,
              count: group?.membersCount ?? 0,
            })}
          </Dialog.Description>
        )}
      </Dialog.Header>

      {/* Method choice is only offered when the feature flag is on. */}
      {offerCertificate && (
        <Box px={6} pt={5} pb={method ? 5 : 6} borderBottomWidth={method ? '1px' : 0} borderColor='border'>
          <MethodStep method={method} onChange={handleMethodChange} disabled={saving} />
        </Box>
      )}

      <Dialog.Body p={0}>
        {method !== null && (
          <Grid
            key={method}
            {...(offerCertificate && {
              animationName: 'fade-in, slide-from-bottom',
              animationDuration: '240ms',
              animationTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
              _motionReduce: { animationName: 'fade-in', animationDuration: '120ms' },
            })}
            templateColumns={{ base: '1fr', md: 'minmax(0, 1fr) 20rem', lg: 'minmax(0, 1fr) 22rem' }}
          >
            <Stack px={6} py={5} gap={6}>
              {method === 'certificate' ? (
                <CertificateSteps
                  coverage={certCoverage}
                  membersCount={group?.membersCount}
                  groupId={groupId}
                  status={censusCheck.status}
                  open={openBuckets}
                  onToggle={(id) =>
                    setOpenBuckets((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]))
                  }
                  attempted={attempted}
                  duplicatesToggleRef={duplicatesToggleRef}
                  onRetry={() => censusCheck.retry()}
                />
              ) : (
                <>
                  <Box
                    role='group'
                    aria-labelledby='voter-auth-details-title'
                    aria-describedby='voter-auth-details-help'
                  >
                    <Text id='voter-auth-details-title' fontSize='sm' fontWeight='semibold'>
                      {offerCertificate
                        ? t('voter_auth.details.heading_numbered', { defaultValue: '2. What will voters type?' })
                        : t('voter_auth.details.heading', { defaultValue: '1. What will voters type?' })}
                    </Text>
                    <Text id='voter-auth-details-help' fontSize='sm' color='fg.muted' mt={1} mb={3}>
                      {t('voter_auth.details.description', {
                        defaultValue:
                          'Pick up to {{max}} details from your member list. What voters type must match it exactly.',
                        max: MAX_AUTH_FIELDS,
                      })}{' '}
                      {t('voter_auth.details.password_not_counted', {
                        defaultValue: 'The password does not count toward that limit.',
                      })}{' '}
                      {/* A code-only census is valid: say so, or admins assume a detail is required. */}
                      {t('voter_auth.details.optional', {
                        defaultValue:
                          'Optional if you send a one-time code: voters can then sign in with the code alone.',
                      })}
                    </Text>
                    <Controller
                      name='credentials'
                      control={control}
                      render={({ field }) => (
                        <CheckboxGroup value={field.value} onValueChange={(value) => field.onChange(value)}>
                          <Flex wrap='wrap' gap={2}>
                            {[...AUTH_FIELDS, PASSWORD_CREDENTIAL].map((id: VoterAuthField) => {
                              const checked = field.value.includes(id)
                              // The password is not counted toward the limit (see countedCredentials).
                              const atLimit =
                                id !== PASSWORD_CREDENTIAL && countedCredentials(field.value) >= MAX_AUTH_FIELDS
                              return (
                                <CheckboxCard.Root
                                  key={id}
                                  value={id}
                                  size='sm'
                                  flex='0 0 auto'
                                  disabled={saving || (!checked && atLimit)}
                                  {...optionCardStyles}
                                >
                                  <CheckboxCard.HiddenInput />
                                  <CheckboxCard.Control px={3} py={2} gap={2} alignItems='center'>
                                    <CheckboxCard.Indicator />
                                    <CheckboxCard.Label fontSize='sm' fontWeight='normal'>
                                      {getAuthFieldLabel(t, id)}
                                    </CheckboxCard.Label>
                                  </CheckboxCard.Control>
                                </CheckboxCard.Root>
                              )
                            })}
                          </Flex>
                        </CheckboxGroup>
                      )}
                    />
                  </Box>

                  <Box>
                    <Controller
                      name='codeMethod'
                      control={control}
                      render={({ field }) => (
                        <RadioCard.Root
                          name='use2FAMethod'
                          size='sm'
                          disabled={saving}
                          value={field.value}
                          onValueChange={({ value }) => field.onChange(value)}
                          aria-describedby='voter-auth-code-help'
                        >
                          <RadioCard.Label fontSize='sm' fontWeight='semibold'>
                            {offerCertificate
                              ? t('voter_auth.code.heading_numbered', { defaultValue: '3. Also send a one-time code?' })
                              : t('voter_auth.code.heading', { defaultValue: '2. Also send a one-time code?' })}
                          </RadioCard.Label>
                          <Text id='voter-auth-code-help' fontSize='sm' color='fg.muted' mt={1} mb={3}>
                            {t('voter_auth.code.description', {
                              defaultValue:
                                "Before voting, we send a 6-digit code to the voter's email or phone. It proves they own it, so nobody can vote with someone else's details.",
                            })}
                          </Text>
                          <SimpleGrid columns={{ base: 1, sm: 2 }} gap={2}>
                            {codeMethods.map((value) => (
                              <RadioCard.Item key={value} value={value} {...optionCardStyles}>
                                <RadioCard.ItemHiddenInput />
                                <RadioCard.ItemControl px={3} py={2.5} gap={2.5}>
                                  <RadioCard.ItemIndicator mt={0.5} />
                                  <RadioCard.ItemContent gap={0.5}>
                                    <RadioCard.ItemText fontSize='sm' fontWeight='medium'>
                                      {getCodeMethodLabel(t, value)}
                                    </RadioCard.ItemText>
                                    <RadioCard.ItemDescription fontSize='xs' color='fg.muted'>
                                      {getCodeMethodDescription(t, value)}
                                    </RadioCard.ItemDescription>
                                  </RadioCard.ItemContent>
                                </RadioCard.ItemControl>
                              </RadioCard.Item>
                            ))}
                          </SimpleGrid>
                        </RadioCard.Root>
                      )}
                    />
                    <Box mt={4}>
                      <ProtectionMeter credentials={credentials} codeMethod={codeMethod} />
                    </Box>
                  </Box>
                </>
              )}
            </Stack>

            {/* The voter's side on its own backdrop: a different surface, not just a
                hairline, is what makes it read as a separate zone. In dark mode the
                page colour sits one step below the dialog (bg.muted would be brighter). */}
            <Box
              px={6}
              pt={{ base: 3, md: 5 }}
              pb={{ base: 4, md: 6 }}
              bg={{ base: 'bg.muted', _dark: 'bg' }}
              borderColor='border'
              borderStartWidth={{ md: '1px' }}
              borderTopWidth={{ base: '1px', md: 0 }}
            >
              {/* On phones the preview would sit two screens below the controls,
                  so it folds away behind a toggle there. */}
              <Button
                display={{ base: 'flex', md: 'none' }}
                variant='plain'
                size='sm'
                w='full'
                justifyContent='space-between'
                px={0}
                color='fg.muted'
                aria-expanded={previewOpen}
                onClick={() => setPreviewOpen((open) => !open)}
              >
                <HStack gap={1.5}>
                  <Icon as={LuEye} boxSize={3.5} />
                  {t('voter_auth.preview.title', { defaultValue: 'What voters will see' })}
                </HStack>
                <Icon as={LuChevronDown} transform={previewOpen ? 'rotate(180deg)' : undefined} />
              </Button>
              <Box
                display={{ base: previewOpen ? 'block' : 'none', md: 'block' }}
                pt={{ base: 3, md: 0 }}
                position={{ md: 'sticky' }}
                top={5}
              >
                {method === 'certificate' ? (
                  <CertificatePreview />
                ) : (
                  <VoterSignInPreview credentials={credentials} codeMethod={codeMethod} />
                )}
              </Box>
            </Box>
          </Grid>
        )}
      </Dialog.Body>

      <Dialog.Footer
        px={6}
        py={3}
        borderTopWidth='1px'
        flexDirection={{ base: 'column', md: 'row' }}
        alignItems={{ base: 'stretch', md: 'center' }}
        gap={3}
      >
        {/* Focus target when Save is refused; holds the method alert, MemberCheck, or CertificateStatus. */}
        <Box id='voter-auth-status' flex='1' minW={0} ref={statusSlotRef} tabIndex={-1} outline='none'>
          {method === null && emptyAttempt && (
            <HStack gap={2} fontSize='sm' color='fg.error' role='alert'>
              <Icon as={LuCircleAlert} boxSize={4} flexShrink={0} />
              <Text fontSize='inherit' fontWeight='medium'>
                {t('voter_auth.method.required', { defaultValue: 'Choose how voters prove who they are.' })}
              </Text>
            </HStack>
          )}
          {method === 'details' && (
            <MemberCheck
              ref={statusRef}
              status={censusCheck.status}
              issues={censusCheck.issues}
              previous={censusCheck.previous}
              missingFields={fieldNames.missing}
              duplicateFields={fieldNames.duplicate}
              missingByField={(censusCheck.status === 'checking'
                ? censusCheck.previous?.missingByField
                : censusCheck.missingByField
              )?.map(({ field, count }) => ({ label: fieldNames.of(field), count }))}
              membersCount={group?.membersCount}
              emptyAttempt={emptyAttempt}
              passwordOnly={passwordAlone}
              onRetry={() => censusCheck.retry()}
            />
          )}
          {method === 'certificate' && certCoverage && (
            <CertificateStatus coverage={certCoverage} membersCount={group?.membersCount ?? 0} attempted={attempted} />
          )}
        </Box>
        <HStack justify='end' gap={2} flexShrink={0}>
          <Button variant='ghost' onClick={onCancel}>
            {t('actions.cancel', { defaultValue: 'Cancel' })}
          </Button>
          {/* aria-disabled (not disabled) keeps the button focusable so it can explain itself
              by scrolling to the offending bucket. */}
          {/* Its label is translated and it is not a form submit, so e2e has no structural handle. */}
          <Button
            flex={{
              base: method === 'certificate' && !blocked && (certCoverage?.cannotSignIn ?? 0) > 0 ? '1' : undefined,
              md: 'none',
            }}
            onClick={handleSave}
            loading={saving}
            disabled={method === 'details' && passwordAlone}
            aria-disabled={blocked || undefined}
            aria-describedby={
              blocked
                ? 'voter-auth-certificate-hint'
                : method === 'details' && passwordAlone
                  ? 'voter-auth-status'
                  : undefined
            }
            whiteSpace='normal'
            h='auto'
            minH={10}
            py={2}
            data-testid='voter-auth-save'
          >
            {method === 'certificate' && !blocked && (certCoverage?.cannotSignIn ?? 0) > 0
              ? t('voter_auth.certificate.save_anyway', {
                  defaultValue_one: "Save anyway ({{count}} can't sign in)",
                  defaultValue_other: "Save anyway ({{count}} can't sign in)",
                  count: certCoverage!.cannotSignIn,
                })
              : t('voter_auth.save.submit', { defaultValue: 'Save' })}
          </Button>
        </HStack>
      </Dialog.Footer>
    </>
  )
}

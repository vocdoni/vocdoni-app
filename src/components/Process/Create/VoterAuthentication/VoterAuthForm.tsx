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
import type { TFunction } from 'i18next'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuChevronDown, LuEye } from 'react-icons/lu'
import { AUTH_FIELDS, getAuthFieldLabel } from '~components/Process/CSP/fields'
import { useToast } from '~components/Toast'
import type { Group } from '~src/queries/groups'
import { buildCensusSpec } from '../census-spec'
import { Census, Process } from '../common'
import { MemberCheck } from './MemberCheck'
import { ProtectionMeter } from './ProtectionLevel'
import { useCensusCheck } from './useCensusCheck'
import {
  CodeMethod,
  fromCensus,
  getCodeTwoFaFields,
  hasAuthConfig,
  MAX_AUTH_FIELDS,
  toCensus,
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
 * - duplicates: the whole combination matches another member's, so
 *   "Member Number and Email".
 */
const describeFields = (t: TFunction, language: string, { credentials, codeMethod }: VoterAuthFormData) => {
  const details = credentials.map((field) => getAuthFieldLabel(t, field))
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
    duplicate: formatList(language, [...details, ...contacts], 'conjunction'),
    /** The name of one part of the per-field breakdown: an auth field id, or 'contact'. */
    of: (field: string) => (field === 'contact' ? (missingContact ?? field) : getAuthFieldLabel(t, field)),
  }
}

// Outlined option cards, selected by a single solid border rather than the
// recipe's extra ring, so a selection reads without shouting.
const optionCardStyles = {
  _checked: { boxShadow: 'none', borderColor: 'colorPalette.solid' },
  _hover: { borderColor: 'border.emphasized' },
} as const

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
  const { watch: watchProcess } = useFormContext<Process>()
  const [groupId, anonymousVoting, weightedVote] = watchProcess(['groupId', 'anonymousVoting', 'weightedVote'])

  const { control, watch } = useForm<VoterAuthFormData>({ defaultValues: fromCensus(census) })
  const credentials = watch('credentials') ?? []
  const codeMethod = watch('codeMethod') ?? 'none'
  const values: VoterAuthFormData = { credentials, codeMethod }
  const configured = hasAuthConfig(values)

  const spec = buildCensusSpec({ groupId, anonymousVoting, weightedVote, census: toCensus(values) })
  const censusCheck = useCensusCheck(spec)
  const statusRef = useRef<HTMLDivElement>(null)

  const [saving, setSaving] = useState(false)
  const [emptyAttempt, setEmptyAttempt] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const valuesKey = JSON.stringify(values)
  useEffect(() => setEmptyAttempt(false), [valuesKey])

  const fieldNames = describeFields(t, i18n.language, values)

  const groupTitle = group?.isAutoGroup
    ? t('groups_board.auto_group.title', { defaultValue: 'All Members' })
    : group?.title

  const handleSave = async () => {
    // A refused save moves focus to the status line beside the button, which
    // already says why: no separate error message.
    if (!configured) {
      setEmptyAttempt(true)
      statusRef.current?.focus()
      return
    }

    setSaving(true)
    let checked = true
    try {
      const result = await censusCheck.check()
      if (!result.valid) {
        statusRef.current?.focus()
        return
      }
    } catch {
      // The check itself failed (network, server, permissions): that says
      // nothing about the members, so it must not trap the admin here.
      checked = false
    } finally {
      setSaving(false)
    }

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
      <Dialog.Body p={0}>
        <Grid templateColumns={{ base: '1fr', md: 'minmax(0, 1fr) 20rem', lg: 'minmax(0, 1fr) 22rem' }}>
          <Stack px={6} py={5} gap={6}>
            <Box role='group' aria-labelledby='voter-auth-details-title' aria-describedby='voter-auth-details-help'>
              <Text id='voter-auth-details-title' fontSize='sm' fontWeight='semibold'>
                {t('voter_auth.details.heading', { defaultValue: '1. What will voters type?' })}
              </Text>
              <Text id='voter-auth-details-help' fontSize='sm' color='fg.muted' mt={1} mb={3}>
                {t('voter_auth.details.description', {
                  defaultValue:
                    'Pick up to {{max}} details from your member list. What voters type must match it exactly.',
                  max: MAX_AUTH_FIELDS,
                })}{' '}
                {/* A code-only census is valid: say so, or admins assume a detail is required. */}
                {t('voter_auth.details.optional', {
                  defaultValue: 'Optional if you send a one-time code: voters can then sign in with the code alone.',
                })}
              </Text>
              <Controller
                name='credentials'
                control={control}
                render={({ field }) => (
                  <CheckboxGroup value={field.value} onValueChange={(value) => field.onChange(value)}>
                    <Flex wrap='wrap' gap={2}>
                      {AUTH_FIELDS.map((id) => {
                        const checked = field.value.includes(id)
                        return (
                          <CheckboxCard.Root
                            key={id}
                            value={id}
                            size='sm'
                            flex='0 0 auto'
                            disabled={!checked && field.value.length >= MAX_AUTH_FIELDS}
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
                    value={field.value}
                    onValueChange={({ value }) => field.onChange(value)}
                    aria-describedby='voter-auth-code-help'
                  >
                    <RadioCard.Label fontSize='sm' fontWeight='semibold'>
                      {t('voter_auth.code.heading', { defaultValue: '2. Also send a one-time code?' })}
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
              <VoterSignInPreview credentials={credentials} codeMethod={codeMethod} />
            </Box>
          </Box>
        </Grid>
      </Dialog.Body>
      <Dialog.Footer
        px={6}
        py={3}
        borderTopWidth='1px'
        flexDirection={{ base: 'column', md: 'row' }}
        alignItems={{ base: 'stretch', md: 'center' }}
        gap={3}
      >
        <Box flex='1' minW={0}>
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
            onRetry={() => censusCheck.retry()}
          />
        </Box>
        <HStack justify='end' gap={2} flexShrink={0}>
          <Button variant='ghost' onClick={onCancel}>
            {t('actions.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button onClick={handleSave} loading={saving} data-testid='voter-auth-save'>
            {t('voter_auth.save.submit', { defaultValue: 'Save' })}
          </Button>
        </HStack>
      </Dialog.Footer>
    </>
  )
}

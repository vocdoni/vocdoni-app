import { Field, Input, type InputProps, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { Banner } from '~components/ui/Banner'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { type Member, useAddMembers, useEditMember } from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { type MemberFieldId, MEMBER_FIELD_IDS, useMemberFields } from '../fields'
import type { SelectedMember } from './useSelection'

export type PersonFormValues = Record<MemberFieldId, string>

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const PHONE_PATTERN = /^\+?[1-9]\d{7,14}$/

/** Phone numbers are often typed with spaces or dashes: they're not part of the number. */
export const normalizePhone = (value: string) => value.replace(/[\s\-().]/g, '')

const today = () => new Date().toISOString().slice(0, 10)

const valuesOf = (member?: Partial<Member>): PersonFormValues =>
  Object.fromEntries(
    MEMBER_FIELD_IDS.map((id) => [
      id,
      // The API only returns a hash of the phone: the field starts empty and replaces it if typed
      id === 'phone' ? '' : String(member?.[id as keyof Member] ?? ''),
    ])
  ) as PersonFormValues

/**
 * What an edit sends: only the fields that changed, never the phone unless a new one was typed. An
 * emptied field isn't sent either, as the API can't clear a field yet.
 */
export const changedFields = (member: Partial<Member>, values: PersonFormValues): Partial<Member> => {
  const initial = valuesOf(member)
  const changed: Partial<Record<MemberFieldId, string>> = {}
  MEMBER_FIELD_IDS.forEach((id) => {
    const value = values[id].trim()
    if (!value) return
    if (id === 'phone') {
      changed.phone = normalizePhone(value)
      return
    }
    if (value !== initial[id].trim()) changed[id] = value
  })
  return changed as Partial<Member>
}

/**
 * The body of an edit: the changed fields plus the member's current voting power. The API writes
 * the weight on every update and takes a missing one as 1, so leaving it out would reset anyone's
 * voting power whenever another detail changes.
 */
export const editPayload = (member: Partial<Member>, changed: Partial<Member>): Partial<Member> =>
  changed.weight === undefined && member.weight ? { ...changed, weight: member.weight } : changed

/** A vote in progress the member can vote in, where an edit applies right away. */
export type RunningVote = { id: string; title: string; signInFields: string[] }

/**
 * Whether an edit reaches voters of a vote in progress hard enough to ask first: it changes the
 * member's voting power, or changes or empties a detail one of those votes signs in with.
 */
export const needsLiveConfirm = (
  member: Partial<Member>,
  values: PersonFormValues,
  changed: Partial<Member>,
  votes: RunningVote[]
) => {
  if (!votes.length) return false
  if ('weight' in changed) return true
  const signIn = new Set(votes.flatMap((vote) => vote.signInFields))
  return MEMBER_FIELD_IDS.some((id) => {
    if (!signIn.has(id)) return false
    if (id in changed) return true
    const original = id === 'phone' ? '' : String(member[id as keyof Member] ?? '').trim()
    return !!original && !values[id].trim()
  })
}

/** What a new person is created with: every field that was filled in. */
export const newMemberPayload = (values: PersonFormValues): Partial<Member> =>
  Object.fromEntries(
    MEMBER_FIELD_IDS.map((id) => [id, id === 'phone' ? normalizePhone(values[id].trim()) : values[id].trim()]).filter(
      ([, value]) => value
    )
  ) as Partial<Member>

type PersonFormProps = {
  /** Lets submit buttons outside the form (sheet header or footer) submit it */
  formId: string
  /** Edits this member; without it, adds a new one */
  member?: SelectedMember
  /** After saving. A new person comes with what they were created with */
  onSaved: (created?: Partial<Member>) => void
  onPendingChange?: (pending: boolean) => void
  /** For analytics: whether a live vote follows the member list */
  inLiveVote?: boolean
  /** No "Added to your members" toast: the caller says what happened once it's done */
  quiet?: boolean
  /** For analytics: where a new person was added from */
  source?: string
  /** Live or scheduled votes this member can vote in: edits apply there right away */
  runningVotes?: RunningVote[]
}

export const PersonForm = ({
  formId,
  member,
  onSaved,
  onPendingChange,
  inLiveVote = false,
  quiet = false,
  source = 'form',
  runningVotes = [],
}: PersonFormProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const fields = useMemberFields()
  const addMembers = useAddMembers()
  const editMember = useEditMember()
  const isEdit = Boolean(member)
  const pending = addMembers.isPending || editMember.isPending
  const hadPhone = Boolean(member?.phone)
  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<PersonFormValues>({ defaultValues: valuesOf(member), mode: 'onTouched' })
  const values = useWatch({ control })

  // Values waiting for "Save change" because they reach a vote in progress
  const [confirming, setConfirming] = useState<PersonFormValues | null>(null)

  useEffect(() => onPendingChange?.(pending), [pending, onPendingChange])

  const fail = (error: unknown) =>
    toast({
      title: isEdit
        ? t('members.person.save_error', { defaultValue: "Your changes weren't saved" })
        : t('members.person.add_error', { defaultValue: "This person wasn't added" }),
      description: error instanceof Error ? error.message : undefined,
      type: 'error',
      duration: 5000,
      isClosable: true,
    })

  const onSubmit = async (formValues: PersonFormValues, confirmed = false) => {
    if (member) {
      const changed = changedFields(member, formValues)
      if (!Object.keys(changed).length) {
        onSaved()
        return
      }
      if (!confirmed && needsLiveConfirm(member, formValues, changed, runningVotes)) {
        setConfirming(formValues)
        return
      }
      setConfirming(null)
      try {
        await editMember.mutateAsync({ id: member.id, ...editPayload(member, changed) })
        trackAnalyticsEvent({
          name: AnalyticsEvents.MemberUpdated,
          props: { in_live_vote: inLiveVote || runningVotes.length > 0 },
        })
        toast({
          title: t('members.person.saved', { defaultValue: 'Changes saved' }),
          type: 'success',
          duration: 3000,
          isClosable: true,
        })
        onSaved()
      } catch (error) {
        fail(error)
      }
      return
    }
    try {
      const payload = newMemberPayload(formValues)
      await addMembers.mutateAsync([payload])
      trackAnalyticsEvent({ name: AnalyticsEvents.MemberAdded, props: { source } })
      if (!quiet)
        toast({
          title: t('members.person.added', { defaultValue: 'Added to your members' }),
          type: 'success',
          duration: 3000,
          isClosable: true,
        })
      onSaved(payload)
    } catch (error) {
      fail(error)
    }
  }

  const voteName = (vote?: RunningVote) =>
    vote?.title || t('processes.list.untitled', { defaultValue: 'Untitled vote' })

  const needsName = t('members.person.error.name_required', { defaultValue: 'Add a first name or a last name' })
  const needsContact = t('members.person.error.contact_required', {
    defaultValue: 'Add an email or a mobile number, so they can get a voting code',
  })

  const rules: Partial<Record<MemberFieldId, Parameters<typeof register>[1]>> = {
    name: {
      validate: (value: string) => isEdit || !!value.trim() || !!getValues('surname').trim() || needsName,
      deps: ['surname'],
    },
    surname: { deps: ['name'] },
    email: {
      validate: (value: string) => {
        const email = value.trim()
        if (email && !EMAIL_PATTERN.test(email))
          return t('form.member.error.invalid_email', { defaultValue: 'Invalid email address' })
        return isEdit || !!email || !!getValues('phone').trim() || needsContact
      },
      deps: ['phone'],
    },
    phone: {
      validate: (value: string) =>
        !value.trim() ||
        PHONE_PATTERN.test(normalizePhone(value.trim())) ||
        t('members.person.error.invalid_phone', {
          defaultValue: 'Use the full number with its country code, like +34 600 000 000',
        }),
      deps: ['email'],
    },
    birthDate: {
      validate: (value: string) =>
        !value ||
        value <= today() ||
        t('form.member.error.invalid_birth_date', { defaultValue: 'Birth date cannot be in the future' }),
    },
    weight: {
      validate: (value: string) =>
        !value.trim() ||
        (/^\d+$/.test(value.trim()) && Number(value) >= 1) ||
        t('members.person.error.invalid_weight', { defaultValue: 'Use a whole number, 1 or more' }),
    },
  }

  const inputProps: Partial<Record<MemberFieldId, InputProps>> = {
    name: { autoCapitalize: 'words' },
    surname: { autoCapitalize: 'words' },
    email: { type: 'email', inputMode: 'email', autoCapitalize: 'none', spellCheck: false },
    phone: { type: 'tel', inputMode: 'tel' },
    memberNumber: { autoCapitalize: 'characters' },
    nationalId: { autoCapitalize: 'characters', spellCheck: false },
    birthDate: { type: 'date', max: today() },
    weight: { inputMode: 'numeric' },
  }

  return (
    // ph-no-capture: the values typed are member data (inputs are masked anyway)
    <Stack asChild gap={4}>
      <form
        id={formId}
        noValidate
        onSubmit={handleSubmit((formValues) => onSubmit(formValues))}
        className='ph-no-capture'
      >
        {isEdit && (
          <Text fontSize='sm' color='fg.muted'>
            {t('members.person.edit_everywhere', {
              defaultValue: 'Changes apply to this member everywhere, including the censuses of votes in progress.',
            })}
          </Text>
        )}
        {isEdit && runningVotes.length > 0 && (
          <Banner status='warning'>
            {t('members.person.live_note', {
              count: runningVotes.length,
              vote: voteName(runningVotes[0]),
              others: runningVotes.length - 1,
              defaultValue_one: "Changes apply right away in '{{vote}}'.",
              defaultValue_other: "Changes apply right away in '{{vote}}' and {{others}} more.",
            })}
          </Banner>
        )}
        {fields.map((field) => {
          const error = errors[field.id]?.message
          const original = member ? String(member[field.id as keyof Member] ?? '').trim() : ''
          const emptied = isEdit && field.id !== 'phone' && !!original && !values[field.id]?.trim()
          return (
            <Field.Root key={field.id} invalid={!!error}>
              <Field.Label>{field.label}</Field.Label>
              <Input
                {...register(field.id, rules[field.id])}
                autoComplete='off'
                fontSize={{ base: 'md', md: 'sm' }}
                placeholder={
                  field.id === 'phone' && hadPhone
                    ? t('members.fields.on_file', { defaultValue: 'Saved (hidden for privacy)' })
                    : ''
                }
                {...inputProps[field.id]}
              />
              {field.id === 'phone' && hadPhone && !error && (
                <Field.HelperText>
                  {t('members.person.phone_on_file', {
                    defaultValue: 'A number is saved but hidden for privacy. Type a new one to replace it.',
                  })}
                </Field.HelperText>
              )}
              {emptied && !error && (
                <Field.HelperText>
                  {t('members.person.cant_clear', {
                    defaultValue: "Emptying a field isn't saved yet: the current value stays.",
                  })}
                </Field.HelperText>
              )}
              <Field.ErrorText>{error}</Field.ErrorText>
            </Field.Root>
          )
        })}
        <ConfirmDialog
          open={!!confirming}
          onOpenChange={({ open }) => !open && !pending && setConfirming(null)}
          destructive={false}
          title={t('members.person.live_confirm.title', { defaultValue: 'Change this in a vote in progress?' })}
          confirmText={t('members.person.live_confirm.confirm', { defaultValue: 'Save change' })}
          loading={pending}
          onConfirm={() => confirming && onSubmit(confirming, true)}
        >
          <Text fontSize='sm'>
            {t('members.person.live_confirm.body', {
              count: runningVotes.length,
              vote: voteName(runningVotes[0]),
              others: runningVotes.length - 1,
              defaultValue_one:
                "This person can vote in '{{vote}}'. A new voting power or sign-in detail applies there right away.",
              defaultValue_other:
                "This person can vote in '{{vote}}' and {{others}} more. A new voting power or sign-in detail applies there right away.",
            })}
          </Text>
        </ConfirmDialog>
      </form>
    </Stack>
  )
}

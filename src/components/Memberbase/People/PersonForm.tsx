import { Field, Input, type InputProps, Stack, Text } from '@chakra-ui/react'
import { useOrganization } from '@vocdoni/react-components'
import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { censusGrowthPaymentErrorMessage, paymentErrorToastOptions } from '~components/Pricing/payment-errors'
import { useBuyRoomAction } from '~components/Pricing/useBuyRoomAction'
import { useToast } from '~components/Toast'
import { type Member, useAddMembers, useEditMember } from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { hashMemberPassword, isValidMemberPassword } from '~utils/member-password'
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
      // The API only returns a hash of the phone and never the password: they start empty and
      // replace the stored value if typed
      id === 'phone' || id === 'password' ? '' : String(member?.[id as keyof Member] ?? ''),
    ])
  ) as PersonFormValues

/**
 * What an edit sends: only the fields that changed. The API keeps a field left out and clears one
 * sent empty. The phone starts blank (only its hash is returned), so it's sent when a new one was
 * typed, or empty once the stored one was deliberately emptied (`phoneEdited`). The password is
 * left to the caller, which sends its hash.
 */
export const changedFields = (
  member: Partial<Member>,
  values: PersonFormValues,
  { phoneEdited = false }: { phoneEdited?: boolean } = {}
): Partial<Member> => {
  const initial = valuesOf(member)
  const changed: Partial<Record<MemberFieldId, string>> = {}
  MEMBER_FIELD_IDS.forEach((id) => {
    const value = values[id].trim()
    if (id === 'password') return
    if (id === 'phone') {
      if (value) changed.phone = normalizePhone(value)
      else if (member.phone && phoneEdited) changed.phone = ''
      return
    }
    if (value !== initial[id].trim()) changed[id] = value
  })
  return changed as Partial<Member>
}

/** What a new person is created with: every field that was filled in, but the password (sent hashed). */
export const newMemberPayload = (values: PersonFormValues): Partial<Member> =>
  Object.fromEntries(
    MEMBER_FIELD_IDS.filter((id) => id !== 'password')
      .map((id) => [id, id === 'phone' ? normalizePhone(values[id].trim()) : values[id].trim()])
      .filter(([, value]) => value)
  ) as Partial<Member>

type PersonFormProps = {
  /** Lets submit buttons outside the form (sheet header or footer) submit it */
  formId: string
  /** Edits this member; without it, adds a new one */
  member?: SelectedMember
  onSaved: () => void
  onPendingChange?: (pending: boolean) => void
  /** For analytics: whether a live vote follows the member list */
  inLiveVote?: boolean
}

export const PersonForm = ({ formId, member, onSaved, onPendingChange, inLiveVote = false }: PersonFormProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const buyRoomAction = useBuyRoomAction()
  const { organization } = useOrganization()
  const fields = useMemberFields()
  const addMembers = useAddMembers()
  const editMember = useEditMember()
  const isEdit = Boolean(member)
  const pending = addMembers.isPending || editMember.isPending
  const hadPhone = Boolean(member?.phone)
  const hadPassword = Boolean(member?.hasPassword)
  // Both start blank, so emptying them can't be told from leaving them alone without a flag
  const [phoneEdited, setPhoneEdited] = useState(false)
  const [passwordEdited, setPasswordEdited] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
  } = useForm<PersonFormValues>({ defaultValues: valuesOf(member), mode: 'onTouched' })
  const values = useWatch({ control })

  useEffect(() => onPendingChange?.(pending), [pending, onPendingChange])

  const fail = (error: unknown) => {
    const paymentMessage = censusGrowthPaymentErrorMessage(t, error)
    toast({
      title: isEdit
        ? t('members.person.save_error', { defaultValue: "Your changes weren't saved" })
        : t('members.person.add_error', { defaultValue: "This person wasn't added" }),
      description: paymentMessage ?? (error instanceof Error ? error.message : undefined),
      type: 'error',
      duration: 5000,
      isClosable: true,
      action: buyRoomAction(error),
      ...(paymentMessage ? paymentErrorToastOptions : {}),
    })
  }

  /**
   * The password as the API takes it: the hash of a typed one (the plaintext never leaves the
   * browser), '' to clear a stored one that was emptied, or nothing to keep it.
   */
  const passwordPayload = async (value: string): Promise<Pick<Member, 'password'> | undefined> => {
    const password = value.trim()
    if (password) return { password: await hashMemberPassword(organization?.address ?? '', password) }
    if (isEdit && hadPassword && passwordEdited) return { password: '' }
    return undefined
  }

  const onSubmit = async (formValues: PersonFormValues) => {
    let password: Pick<Member, 'password'> | undefined
    try {
      password = await passwordPayload(formValues.password)
    } catch (error) {
      fail(error)
      return
    }
    if (member) {
      const changed = { ...changedFields(member, formValues, { phoneEdited }), ...password }
      if (!Object.keys(changed).length) {
        onSaved()
        return
      }
      try {
        await editMember.mutateAsync({ id: member.id, ...changed })
        trackAnalyticsEvent({ name: AnalyticsEvents.MemberUpdated, props: { in_live_vote: inLiveVote } })
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
      await addMembers.mutateAsync([{ ...newMemberPayload(formValues), ...password }])
      trackAnalyticsEvent({ name: AnalyticsEvents.MemberAdded, props: { source: 'form' } })
      toast({
        title: t('members.person.added', { defaultValue: 'Added to your members' }),
        type: 'success',
        duration: 3000,
        isClosable: true,
      })
      onSaved()
    } catch (error) {
      fail(error)
    }
  }

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
      onChange: () => setPhoneEdited(true),
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
    password: {
      // Empty stays allowed: no password on add, an explicit clear on edit
      validate: (value: string) =>
        !value.trim() ||
        isValidMemberPassword(value) ||
        t('form.member.error.password_requirements', {
          defaultValue: 'Use at least 6 characters, including a letter and a number.',
        }),
      onChange: () => setPasswordEdited(true),
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
    password: { type: 'password', autoComplete: 'new-password' },
  }

  return (
    // ph-no-capture: the values typed are member data (inputs are masked anyway)
    <Stack asChild gap={4}>
      <form id={formId} noValidate onSubmit={handleSubmit(onSubmit)} className='ph-no-capture'>
        {isEdit && (
          <Text fontSize='sm' color='fg.muted'>
            {t('members.person.edit_everywhere', {
              defaultValue: 'Changes apply to this member everywhere, including the censuses of votes in progress.',
            })}
          </Text>
        )}
        {fields.map((field) => {
          const error = errors[field.id]?.message
          const onFile = (field.id === 'phone' && hadPhone) || (field.id === 'password' && hadPassword)
          // Emptied after typing: the stored value is cleared on save
          const removing =
            !values[field.id]?.trim() &&
            ((field.id === 'phone' && hadPhone && phoneEdited) ||
              (field.id === 'password' && hadPassword && passwordEdited))
          return (
            <Field.Root key={field.id} invalid={!!error}>
              <Field.Label>{field.label}</Field.Label>
              <Input
                {...register(field.id, rules[field.id])}
                autoComplete='off'
                fontSize={{ base: 'md', md: 'sm' }}
                placeholder={onFile ? t('members.fields.on_file', { defaultValue: 'Saved (hidden for privacy)' }) : ''}
                {...inputProps[field.id]}
              />
              {!error && removing && (
                <Field.HelperText color='fg.error'>
                  {field.id === 'phone'
                    ? t('memberbase.form.phone_will_be_removed', {
                        defaultValue: 'The stored phone number will be removed when you save.',
                      })
                    : t('memberbase.form.password_will_be_removed', {
                        defaultValue: 'The stored password will be removed when you save.',
                      })}
                </Field.HelperText>
              )}
              {!error && !removing && field.id === 'phone' && hadPhone && (
                <Field.HelperText>
                  {t('members.person.phone_on_file', {
                    defaultValue: 'A number is saved but hidden for privacy. Type a new one to replace it.',
                  })}
                </Field.HelperText>
              )}
              {!error && !removing && field.id === 'password' && hadPassword && (
                <Field.HelperText>
                  {t('memberbase.form.password_set', {
                    defaultValue: 'A password is set. Type a new one to replace it.',
                  })}
                </Field.HelperText>
              )}
              <Field.ErrorText>{error}</Field.ErrorText>
            </Field.Root>
          )
        })}
      </form>
    </Stack>
  )
}

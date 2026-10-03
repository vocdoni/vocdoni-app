import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { MASK_DOTS } from '~components/ui/MaskedValue'

/** The member fields the API stores, in the order the app shows them. The ids are the API keys. */
export const MEMBER_FIELD_IDS = [
  'name',
  'surname',
  'email',
  'phone',
  'memberNumber',
  'nationalId',
  'birthDate',
  'weight',
] as const

export type MemberFieldId = (typeof MEMBER_FIELD_IDS)[number]

/** Fields `GET /members` can sort by (`sortBy`). */
export type MemberSortField = 'name' | 'surname' | 'email' | 'memberNumber'

/**
 * How a stored value is shown.
 * - `plain`: as is.
 * - `on_file`: only that there is one (the API returns a hash fragment, never the value).
 * - `masked`: hidden but for its last characters, `tail` (empty when nothing is shown).
 */
export type MemberFieldDisplay =
  | { kind: 'empty' }
  | { kind: 'plain'; text: string }
  | { kind: 'on_file' }
  | { kind: 'masked'; tail: string }

export type MemberFieldDefinition = {
  id: MemberFieldId
  /** i18n key of the field label */
  labelKey: string
  /** Can receive the one-time sign-in code */
  is2fa: boolean
  /** Personal data that is masked when shown and hidden by default */
  sensitive: boolean
  /** Can be asked as a sign-in detail (credential) */
  authEligible: boolean
  /** The server can sort members by it */
  sortable: boolean
  /** Shown as a table column unless the admin hides it */
  defaultVisible: boolean
  mask: (value?: string | null) => MemberFieldDisplay
}

const plain = (value?: string | null): MemberFieldDisplay =>
  value ? { kind: 'plain', text: String(value) } : { kind: 'empty' }

const onFile = (value?: string | null): MemberFieldDisplay => (value ? { kind: 'on_file' } : { kind: 'empty' })

const lastChars =
  (count: number) =>
  (value?: string | null): MemberFieldDisplay =>
    value ? { kind: 'masked', tail: String(value).slice(-count) } : { kind: 'empty' }

const hidden = (value?: string | null): MemberFieldDisplay => (value ? { kind: 'masked', tail: '' } : { kind: 'empty' })

const field = (
  id: MemberFieldId,
  labelKey: string,
  options: Partial<Omit<MemberFieldDefinition, 'id' | 'labelKey'>> = {}
): MemberFieldDefinition => ({
  id,
  labelKey,
  is2fa: false,
  sensitive: false,
  authEligible: false,
  sortable: false,
  defaultVisible: true,
  mask: plain,
  ...options,
})

export const MEMBER_FIELDS: readonly MemberFieldDefinition[] = [
  field('name', 'members.fields.firstname', { authEligible: true, sortable: true }),
  field('surname', 'members.fields.surname', { authEligible: true, sortable: true }),
  field('email', 'members.fields.email', { is2fa: true, sortable: true }),
  field('phone', 'members.fields.phone', { is2fa: true, sensitive: true, mask: onFile }),
  field('memberNumber', 'members.fields.member_number', { authEligible: true, sortable: true }),
  field('nationalId', 'members.fields.national_id', {
    authEligible: true,
    sensitive: true,
    defaultVisible: false,
    mask: lastChars(3),
  }),
  field('birthDate', 'members.fields.birth_date', {
    authEligible: true,
    sensitive: true,
    defaultVisible: false,
    mask: hidden,
  }),
  field('weight', 'members.fields.weight'),
]

export const getMemberField = (id: string) => MEMBER_FIELDS.find((definition) => definition.id === id)

export type MemberField = MemberFieldDefinition & {
  label: string
  /** The value as text, masked as the field requires ("On file", "•••23A") */
  format: (value?: string | null) => string
}

/** The member fields with their labels in the current language. */
export const useMemberFields = (): MemberField[] => {
  const { t } = useTranslation()

  return useMemo(() => {
    // Literal calls so the extractor keeps these keys
    const labels: Record<MemberFieldId, string> = {
      name: t('members.fields.firstname', { defaultValue: 'First Name' }),
      surname: t('members.fields.surname', { defaultValue: 'Last Name' }),
      email: t('members.fields.email', { defaultValue: 'Email' }),
      phone: t('members.fields.phone', { defaultValue: 'Phone' }),
      memberNumber: t('members.fields.member_number', { defaultValue: 'Member Number' }),
      nationalId: t('members.fields.national_id', { defaultValue: 'National ID' }),
      birthDate: t('members.fields.birth_date', { defaultValue: 'Birth Date' }),
      weight: t('members.fields.weight', { defaultValue: 'Voting power (Weight)' }),
    }
    const onFileLabel = t('members.fields.on_file', { defaultValue: 'Saved (hidden for privacy)' })

    return MEMBER_FIELDS.map((definition) => ({
      ...definition,
      label: labels[definition.id],
      format: (value?: string | null) => {
        const display = definition.mask(value)
        switch (display.kind) {
          case 'plain':
            return display.text
          case 'on_file':
            return onFileLabel
          case 'masked':
            return `${MASK_DOTS}${display.tail}`
          default:
            return ''
        }
      },
    }))
  }, [t])
}

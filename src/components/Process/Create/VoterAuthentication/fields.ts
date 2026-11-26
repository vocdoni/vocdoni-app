import type { OrgMemberAuthField } from '@vocdoni/api-types'
import type { TFunction } from 'i18next'

/** The member fields a census can ask voters to type (`CensusSpec.authFields`), in the order the builder offers them. */
export const AUTH_FIELDS: readonly OrgMemberAuthField[] = ['memberNumber', 'name', 'surname', 'nationalId', 'birthDate']

/** The label a voter sees above the input for an auth field. */
export const getAuthFieldLabel = (t: TFunction, field: string): string => {
  switch (field) {
    case 'memberNumber':
      return t('csp.fields.memberNumber', { defaultValue: 'Member Number' })
    case 'name':
      return t('csp.fields.name', { defaultValue: 'First Name' })
    case 'surname':
      return t('csp.fields.surname', { defaultValue: 'Last Name' })
    case 'nationalId':
      return t('csp.fields.nationalId', { defaultValue: 'National ID' })
    case 'birthDate':
      return t('csp.fields.birthDate', { defaultValue: 'Birth Date' })
    case 'password':
      return t('csp.fields.password', { defaultValue: 'Password' })
    default:
      return field
  }
}

/**
 * The label of the single contact input a voter fills when the census sends a
 * one-time code: the form routes it to `email` or `phone` itself.
 */
export const getContactFieldLabel = (t: TFunction, twoFaFields: readonly string[]): string => {
  const email = twoFaFields.includes('email')
  const phone = twoFaFields.includes('phone')

  if (email && phone) return t('csp.fields.email_or_phone', { defaultValue: 'Email or Phone' })
  if (email) return t('csp.fields.email', { defaultValue: 'Email' })
  if (phone) return t('csp.fields.phone', { defaultValue: 'Phone' })
  return t('csp.fields.contact', { defaultValue: 'Contact' })
}

/** The input type of an auth field on the voter page's identify screen. */
export const getAuthFieldInputType = (field: string): string => {
  if (field === 'email') return 'email'
  if (field === 'phone') return 'tel'
  if (field === 'birthDate') return 'date'
  if (field === 'password') return 'password'
  return 'text'
}

type InputMode = 'email' | 'tel' | 'text' | 'search' | 'url' | 'none' | 'numeric' | 'decimal'

/**
 * The input props for the two-factor contact field (email, phone or both), so the browser offers the right
 * keyboard and autocomplete hint for the channel the census uses.
 */
export const getContactFieldInputProps = (
  twoFaFields: readonly string[]
): { type: string; autoComplete: string; inputMode?: InputMode } => {
  const hasEmail = twoFaFields.includes('email')
  const hasPhone = twoFaFields.includes('phone')
  if (hasEmail && !hasPhone) return { type: 'email', autoComplete: 'email' }
  if (hasPhone && !hasEmail) return { type: 'tel', inputMode: 'tel', autoComplete: 'tel' }
  return { type: 'text', autoComplete: 'on' }
}

/**
 * A census field named as the organiser reads it (the voter lookup, Gestió's voting data): sentence case, so it sits
 * inside a sentence. Unknown fields fall back to their raw key.
 */
export const censusFieldLabel = (t: TFunction, field: string): string => {
  switch (field) {
    case 'name':
      return t('census.search.field.name', { defaultValue: 'Name' })
    case 'surname':
      return t('census.search.field.surname', { defaultValue: 'Surname' })
    case 'email':
      return t('census.search.field.email', { defaultValue: 'Email' })
    case 'phone':
      return t('census.search.field.phone', { defaultValue: 'Phone' })
    case 'memberNumber':
      return t('census.search.field.member_number', { defaultValue: 'Member number' })
    case 'nationalId':
      return t('census.search.field.national_id', { defaultValue: 'National ID' })
    case 'birthDate':
      return t('census.search.field.birth_date', { defaultValue: 'Birth date' })
    default:
      return field
  }
}

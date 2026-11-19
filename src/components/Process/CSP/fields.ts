import type { OrgMemberAuthField } from '@vocdoni/api-types'
import type { TFunction } from 'i18next'

/**
 * The member fields a census can ask voters to type (`CensusSpec.authFields`),
 * in the order the process builder offers them. Kept here, next to the builder's
 * sign-in preview, because the preview must show what the voter's identify form asks for.
 *
 * Pure on purpose: the builder imports it, so it must not pull in anything else.
 */
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

import type { OrgMemberAuthField } from '@vocdoni/api-types'
import type { TFunction } from 'i18next'

/**
 * The member fields a census can ask voters to type (`CensusSpec.authFields`),
 * in the order the process builder offers them. Kept here, next to the voter
 * sign-in form, because both screens must agree on them: the builder's preview
 * renders exactly what `Step0` will ask for.
 *
 * Pure on purpose: `Step0` is server-rendered on the public process page, so
 * this module must not pull in anything from the (client-only) dashboard.
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

export const getAuthFieldInputType = (field: string): string => {
  if (field === 'email') return 'email'
  if (field === 'phone') return 'tel'
  if (field === 'birthDate') return 'date'
  return 'text'
}

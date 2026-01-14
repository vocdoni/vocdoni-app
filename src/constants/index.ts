import { dotobject } from '@vocdoni/sdk'
import { FieldErrors, FieldValues, useFormContext } from 'react-hook-form'

export const FormatDate = 'dd/MM/yyyy'
export const FormatDateLong = 'MMMM d - yyyy H:mm'
export const TokenPrice = 0.15
export const MinPurchaseTokens = 100
export const TwoFACodePrice = {
  email: 0.015,
  sms: 0.015,
} as const
export const StripeEnabled = import.meta.env.STRIPE_PUBLIC_KEY !== ''
export const InnerContentsMaxWidth = {
  base: 'full',
  lg: '600px',
  xl: '800px',
}
export const MaxWindowWidth = '2560px'
export const MaxNavbarWidth = '1920px'
export const MaxContentsWidth = '1200px'

export enum SubscriptionPermission {
  Name = 'name',
  StripeId = 'stripeId',
  Default = 'default',
  Users = 'organization.teamMembers',
  SubOrgs = 'organization.subOrgs',
  MaxCensus = 'organization.maxCensus',
  MaxProcesses = 'organization.maxProcesses',
  MaxDuration = 'organization.maxDaysDuration',
  CustomURL = 'organization.customURL',
  Drafts = 'organization.drafts',
  SingleVoting = 'votingTypes.single',
  MultipleVoting = 'votingTypes.multiple',
  ApprovalVoting = 'votingTypes.approval',
  CumulativeVoting = 'votingTypes.cumulative',
  RankedVoting = 'votingTypes.ranked',
  WeightedVoting = 'votingTypes.weighted',
  Anonymous = 'features.anonymous',
  Overwrite = 'features.overwrite',
  PhoneSupport = 'features.phoneSupport',
  LiveResults = 'features.liveResults',
  Personalization = 'features.personalization',
  EmailReminder = 'features.emailReminder',
  TwoFASms = 'features.2FAsms',
  TwoFAEmail = 'features.2FAemail',
  WhiteLabel = 'features.whiteLabel',
  LiveStreaming = 'features.liveStreaming',
}

export enum PlanId {
  Essential = 1,
  Premium = 2,
  Free = 3,
  Custom = 4,
}

export const LocalStorageKeys = {
  DashboardMenuReduced: 'dashboard.menu.reduced',
} as const

export const AppTitle = import.meta.env.title
export const VocdoniEnvironment = import.meta.env.VOCDONI_ENVIRONMENT
export const CensusPreviewRowsLimit = 10

const defaultCensusSize = import.meta.env.DEFAULT_CENSUS_SIZE
export const DefaultCensusSize = defaultCensusSize
export const REGEX_AVATAR = /^(https?:\/\/|ipfs:\/\/)/i

/**
 * Given an object of react-hook-form errors, determines if the specified mapped field is invalid (returns an error)
 *
 * @param {FieldErrors<FieldValues>} errors Object of errors obtained from formState in `useFormContext`.
 * @param {string} map The field map in dot notation.
 * @returns {boolean}
 */
export const isInvalidFieldMap = (errors: FieldErrors<FieldValues>, map: string) => {
  return !!fieldMapErrorMessage(errors, map)
}

/**
 * Given an object of react-hook-form errors, returns the specified mapped field error message.
 *
 * @param {FieldErrors<FieldValues>} errors Object of errors obtained from formState in `useFormContext`.
 * @param {string} map The field map in dot notation.
 * @returns {null|string} Either returns the error message or null
 */
export const fieldMapErrorMessage = (errors: FieldErrors<FieldValues>, map: string) => {
  if (!errors) return null

  const obj = dotobject(errors, map)
  if (!obj || (obj && !obj.message)) return null

  return obj.message
}

/**
 * Helper hook used for radio inputs that are actually boolean inputs, converting
 * their values to boolean as expected. Note you can't use boolean radio register
 * for more than two radio buttons, since it wouldn't be binary.
 *
 * @param name Radio input field name
 * @returns
 */
export const useBooleanRadioRegister = (name: string) => {
  const { getValues, setValue } = useFormContext()
  return {
    defaultValue: Number(getValues(name)).toString(),
    onChange: (val: string) => setValue(name, Boolean(Number(val))),
  }
}

/**
 * Truncates an address-alike string by the middle, adding ellipsis. It considers
 * the addresses to be coming with 0x prefixed, so it cuts two less chars from the
 * front than the back
 * @param {string} address The address to be truncated
 * @param {number} length The length to be shown for each side of the address
 * @returns
 */
export const addressTextOverflow = (address: string, length: number | null = 4) => {
  if (!length) return address
  return `${address.substring(0, length + 2)}...${address.substring(address.length - length, address.length)}`
}

/**
 * RecursivePartial is quite self-explanatory.. it's a recursive Partial type
 */
export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? RecursivePartial<U>[]
    : T[P] extends object | undefined
      ? RecursivePartial<T[P]>
      : T[P]
}

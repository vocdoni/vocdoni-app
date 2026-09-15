import { dotobject } from '~utils/objects'
import { FieldErrors, FieldValues } from 'react-hook-form'

export const TwoFACodePrice = {
  email: 0.015,
  sms: 0.015,
} as const

export const OAuthProviders = ['google'] as const
export type OAuthProvider = (typeof OAuthProviders)[number]

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

/**
 * Canonical Stripe product names returned by the `/plans` endpoint. These are
 * the stable identifiers used to match plans, since the plan `id` is now the
 * Stripe product key (which may change).
 */
export const PlanName = {
  Free: 'Free',
  Starter: 'Starter',
  Professional: 'Professional',
} as const

export type PlanName = (typeof PlanName)[keyof typeof PlanName]

/**
 * Normalizes a plan name for case-insensitive comparison. The API returns names
 * in TitleCase, but matching defensively avoids breakage on casing drift.
 */
export const normalizePlanName = (value?: string | null) => value?.trim().toLowerCase() || undefined

/**
 * Whether a plan matches a given name (case-insensitively).
 */
export const isPlanNamed = (plan: { name?: string } | null | undefined, name?: string | null) => {
  const a = normalizePlanName(plan?.name)
  return !!a && a === normalizePlanName(name)
}

/**
 * Resolves a plan to its canonical PlanName key (or undefined if it doesn't match
 * any known plan). Useful to look up plan-specific translations by name.
 */
export const getPlanKey = (plan: { name?: string } | null | undefined): PlanName | undefined =>
  (Object.values(PlanName) as string[]).find((n) => normalizePlanName(n) === normalizePlanName(plan?.name)) as
    | PlanName
    | undefined

export const LocalStorageKeys = {
  DashboardMenuReduced: 'dashboard.menu.reduced',
} as const

export const SessionStorageKeys = {
  // Suppressed per browser session, so a returning user sees the "Do you need
  // help?" nudge again on their next visit rather than never again.
  SupportChatTeaserDismissed: 'support.chat.teaser.dismissed',
  // The auth vertical (`?type=`) for the visit, so the branding survives navigations that drop
  // the query string — see `~components/Auth/vertical/useAuthVertical`.
  AuthVertical: 'auth.vertical',
} as const

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

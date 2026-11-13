export const OAuthProviders = ['google'] as const
export type OAuthProvider = (typeof OAuthProviders)[number]

// Fixed limits every organization gets under pay-per-process. The question cap mirrors saas-backend's db/const.go,
// the others its subscriptions/subscriptions.go.
export const MaxWritersPerOrg = 5
export const MaxDraftsPerOrg = 20
export const MaxProcessDurationDays = 90
export const MaxMembersPerOrg = 50_000
export const MaxQuestionsPerProcess = 15

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

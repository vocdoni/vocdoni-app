import type { MultilingualText, Organization } from '@vocdoni/api-types'

export type SaasOrganizationData = {
  address: string
  color: string
  country: string
  createdAt: string
  // Fallback language for notifications sent on behalf of the org (en/es/ca,
  // served by GET /organizations/languages)
  defaultLang: string
  header: string
  parent: string
  size: string
  subdomain: string
  timezone: string
  type: string
  website: string
}

/**
 * The `.account`-nested display fields the org display components (Header,
 * Process/View, CreatedBy, LegalNotice) read. Mirrors the old on-chain `Account`
 * metadata shape so those components keep working while the public/SSR org path
 * still supplies it from the vochain side.
 */
export type OrganizationAccount = {
  name: MultilingualText
  description: MultilingualText
  avatar: string
  header: string
}

/**
 * The SAAS organization plus the legacy `.account` nesting, as produced by
 * `toOrganizationData` in SaasAccountProvider. `address` is undefined until the
 * session resolves an organization address (or the org info loads).
 */
export type OrganizationData = Omit<Organization, 'address'> & {
  address?: string
  account: OrganizationAccount
  // Not yet in @vocdoni/api-types' Organization — remove once it regenerates
  // from the swagger that includes defaultLang (saas-backend#676)
  defaultLang?: string
}

export type CreateOrgParams = Partial<
  {
    name: string
    description: string
    header: string
    // The SaaS API stores the organization branding image under `logo` (was `avatar`
    // on the old on-chain account). A plain string is accepted and stored as
    // `{ default: value }`. See @vocdoni/api-types `CreateOrganizationRequest`.
    logo: string
  } & Omit<SaasOrganizationData, 'address' | 'createdAt'>
>

import { AccountData, IAccount } from '@vocdoni/sdk'

export type SaasOrganizationData = {
  active: boolean
  address: string
  color: string
  country: string
  createdAt: string
  header: string
  language: string
  parent: string
  size: string
  subdomain: string
  timezone: string
  type: string
  website: string
}

export type OrganizationData = SaasOrganizationData & AccountData

export type CreateOrgParams = Partial<
  Pick<IAccount, 'name' | 'description' | 'header'> & {
    // The SaaS API stores the organization branding image under `logo` (was `avatar`
    // on the old on-chain account). A plain string is accepted and stored as
    // `{ default: value }`. See @vocdoni/api-types `CreateOrganizationRequest`.
    logo: string
  } & Omit<SaasOrganizationData, 'active' | 'address' | 'createdAt'>
>

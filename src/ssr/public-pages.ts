import { PublishedElection } from '@vocdoni/sdk'
import { AppTitle } from '~constants'

type OrganizationData = {
  address: string
  account?: {
    name?: { default?: string }
    description?: { default?: string }
  }
}

type ElectionsPageData = {
  elections: unknown[]
  pagination: {
    totalItems?: number
    previousPage?: number | null
    currentPage: number
    nextPage?: number | null
    lastPage: number
  }
}

type PublicMeta = {
  title: string
  description: string
  canonicalUrl?: string
  openGraph: {
    title: string
    description: string
    url?: string
    type: 'website'
  }
  twitter: {
    card: 'summary_large_image'
    title: string
    description: string
  }
}

type PublicPageClient = {
  fetchAccountInfo(address?: string): Promise<OrganizationData>
  fetchElections(input: { organizationId: string; page: number }): Promise<ElectionsPageData>
  fetchElection(id?: string): Promise<PublishedElection>
}

const serializeUnknown = (value: unknown): unknown => {
  if (value instanceof Error) {
    return serializePublicPageErrorDetails(value)
  }

  if (Array.isArray(value)) {
    return value.map(serializeUnknown)
  }

  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, serializeUnknown(nested)]))
  }

  return value
}

const trimText = (value?: string) => value?.trim() ?? ''

const withAppTitle = (value: string) => `${AppTitle} - ${value}`

const fallbackDescription = (value: string, kind: 'organization' | 'process') =>
  kind === 'organization'
    ? `Explore the public organization page for ${value}.`
    : `Explore the public voting process ${value}.`

export const buildOrganizationMeta = ({
  organization,
  canonicalUrl,
}: {
  organization: OrganizationData
  canonicalUrl?: string
}): PublicMeta => {
  const displayName = trimText(organization.account?.name?.default) || organization.address
  const description =
    trimText(organization.account?.description?.default) || fallbackDescription(organization.address, 'organization')

  return {
    title: withAppTitle(displayName),
    description,
    canonicalUrl,
    openGraph: {
      title: withAppTitle(displayName),
      description,
      url: canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: withAppTitle(displayName),
      description,
    },
  }
}

export const buildProcessMeta = ({
  election,
  organization,
  canonicalUrl,
}: {
  election: PublishedElection
  organization?: OrganizationData
  canonicalUrl?: string
}): PublicMeta => {
  const electionTitle = trimText(election.title?.default) || election.id
  const organizationName = trimText(organization?.account?.name?.default)
  const descriptionBase = trimText(election.description?.default) || fallbackDescription(electionTitle, 'process')
  const description = organizationName ? `${descriptionBase} ${organizationName}` : descriptionBase

  return {
    title: withAppTitle(electionTitle),
    description,
    canonicalUrl,
    openGraph: {
      title: withAppTitle(electionTitle),
      description,
      url: canonicalUrl,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: withAppTitle(electionTitle),
      description,
    },
  }
}

export const loadOrganizationPageData = async ({
  client,
  address,
  canonicalUrl,
}: {
  client: PublicPageClient
  address: string
  canonicalUrl?: string
}) => {
  const organization = await client.fetchAccountInfo(address)
  const electionsPage = await client.fetchElections({ organizationId: organization.address, page: 0 })

  return {
    organization,
    electionsPage,
    meta: buildOrganizationMeta({ organization, canonicalUrl }),
  }
}

export const loadProcessPageData = async ({
  client,
  id,
  canonicalUrl,
}: {
  client: PublicPageClient
  id: string
  canonicalUrl?: string
}) => {
  const election = await client.fetchElection(id)
  const organization = await client.fetchAccountInfo(election.organizationId)

  return {
    election,
    organization,
    meta: buildProcessMeta({ election, organization, canonicalUrl }),
  }
}

export const serializePublicPageErrorDetails = (error: unknown) => {
  if (!(error instanceof Error)) {
    return { value: serializeUnknown(error) }
  }

  const details = {
    name: error.name,
    message: error.message,
    stack: error.stack,
  } as Record<string, unknown>

  for (const [key, value] of Object.entries(error)) {
    details[key] = serializeUnknown(value)
  }

  return details
}

export type { ElectionsPageData, OrganizationData, PublicMeta, PublicPageClient }

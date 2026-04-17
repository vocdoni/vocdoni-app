import {
  ErrAccountNotFound,
  ErrAddressMalformed,
  ErrCantParseElectionID,
  ErrElectionNotFound,
  PublishedElection,
} from '@vocdoni/sdk'
import { AppTitle } from '~constants'
import { getDefaultPublicLanguage, normalizePublicLanguageCandidate } from '~i18n/public-language'

type PublicLanguageAlternate = {
  hrefLang: string
  href: string
}

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
  language: string
  canonicalUrl?: string
  alternates: PublicLanguageAlternate[]
  openGraph: {
    title: string
    description: string
    url?: string
    type: 'website'
    image: string
    siteName: string
  }
  twitter: {
    card: 'summary_large_image'
    title: string
    description: string
    image: string
    site: string
    creator: string
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

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '')
const trimText = (value?: string) => value?.trim() ?? ''

const withAppTitle = (value: string) => `${AppTitle} - ${value}`

const buildShortDescription = (...parts: Array<string | undefined>) => parts.filter(Boolean).join(' — ')
const publicSocialImagePath = '/assets/vocdoniapp.png'
const publicSiteName = 'Vocdoni'
const publicTwitterAccount = '@vocdoni'
const buildSocialImageUrl = (canonicalUrl?: string) =>
  canonicalUrl ? new URL(publicSocialImagePath, canonicalUrl).toString() : publicSocialImagePath

export const resolvePublicLanguage = ({
  routeLanguage,
  supportedLanguages,
}: {
  routeLanguage?: string
  supportedLanguages: string[]
}) => {
  if (!routeLanguage) {
    return getDefaultPublicLanguage(supportedLanguages)
  }

  const normalizedLanguage = routeLanguage.toLowerCase()

  if (supportedLanguages.includes(normalizedLanguage)) {
    return normalizedLanguage
  }

  throw new Error(`Unsupported public language: ${routeLanguage}`)
}

export const getLocalizedPublicRedirectTarget = ({
  routeType,
  preferredLanguage,
  currentLanguage,
  idOrAddress,
}: {
  routeType: 'organization' | 'process'
  preferredLanguage: string
  currentLanguage: string
  idOrAddress: string
}) => {
  if (preferredLanguage === currentLanguage) return null

  if (routeType === 'organization') {
    return getPublicOrganizationPath({
      address: idOrAddress,
      language: preferredLanguage,
    })
  }

  return getPublicProcessPath({
    id: idOrAddress,
    language: preferredLanguage,
  })
}

export const getPublicLocalizedOrganizationRouteMatch = ({
  urlPathname,
  supportedLanguages,
}: {
  urlPathname: string
  supportedLanguages: string[]
}) => {
  const match = urlPathname.match(/^\/([^/]+)\/organization\/([^/]+)\/?$/)

  if (!match) return false

  const [, lang, address] = match

  if (!supportedLanguages.includes(lang)) return false

  return {
    routeParams: {
      lang,
      address,
    },
  }
}

export const getPublicLocalizedProcessRouteMatch = ({
  urlPathname,
  supportedLanguages,
}: {
  urlPathname: string
  supportedLanguages: string[]
}) => {
  const match = urlPathname.match(/^\/([^/]+)\/processes\/([^/]+)\/?$/)

  if (!match) return false

  const [, lang, id] = match

  if (!supportedLanguages.includes(lang)) return false

  return {
    routeParams: {
      lang,
      id,
    },
  }
}

export const getPublicOrganizationPath = ({ address, language }: { address: string; language: string }) =>
  `/${language}/organization/${address}`

export const getPublicProcessPath = ({ id, language }: { id: string; language: string }) =>
  `/${language}/processes/${id}`

export const getPublicLanguageAlternates = ({
  languages,
  pathnameByLanguage,
  origin,
}: {
  languages: string[]
  pathnameByLanguage: Record<string, string>
  origin?: string
}): PublicLanguageAlternate[] => {
  if (!origin) return []

  const defaultLanguage = getDefaultPublicLanguage(languages)
  const alternates = languages.flatMap((language) => {
    const pathname = pathnameByLanguage[language]
    if (!pathname) return []

    return {
      hrefLang: language,
      href: `${origin}/${trimSlashes(pathname)}`,
    }
  })

  const defaultPathname = pathnameByLanguage[defaultLanguage]

  alternates.push({
    hrefLang: 'x-default',
    href: defaultPathname ? `${origin}/${trimSlashes(defaultPathname)}` : origin,
  })

  return alternates
}

export const buildOrganizationMeta = ({
  organization,
  canonicalUrl,
  language,
  alternates,
}: {
  organization: OrganizationData
  canonicalUrl?: string
  language: string
  alternates: PublicLanguageAlternate[]
}): PublicMeta => {
  const displayName = trimText(organization.account?.name?.default) || organization.address
  const description = trimText(organization.account?.description?.default) || displayName

  const socialImage = buildSocialImageUrl(canonicalUrl)

  return {
    title: withAppTitle(displayName),
    description,
    language,
    canonicalUrl,
    alternates,
    openGraph: {
      title: withAppTitle(displayName),
      description,
      url: canonicalUrl,
      type: 'website',
      image: socialImage,
      siteName: publicSiteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: withAppTitle(displayName),
      description,
      image: socialImage,
      site: publicTwitterAccount,
      creator: publicTwitterAccount,
    },
  }
}

export const buildProcessMeta = ({
  election,
  organization,
  canonicalUrl,
  language,
  alternates,
}: {
  election: PublishedElection
  organization?: OrganizationData
  canonicalUrl?: string
  language: string
  alternates: PublicLanguageAlternate[]
}): PublicMeta => {
  const electionTitle = trimText(election.title?.default) || election.id
  const organizationName = trimText(organization?.account?.name?.default)
  const description = trimText(election.description?.default) || buildShortDescription(electionTitle, organizationName)

  const socialImage = buildSocialImageUrl(canonicalUrl)

  return {
    title: withAppTitle(electionTitle),
    description,
    language,
    canonicalUrl,
    alternates,
    openGraph: {
      title: withAppTitle(electionTitle),
      description,
      url: canonicalUrl,
      type: 'website',
      image: socialImage,
      siteName: publicSiteName,
    },
    twitter: {
      card: 'summary_large_image',
      title: withAppTitle(electionTitle),
      description,
      image: socialImage,
      site: publicTwitterAccount,
      creator: publicTwitterAccount,
    },
  }
}

export const loadOrganizationPageData = async ({
  client,
  address,
  canonicalUrl,
  language,
  alternates,
}: {
  client: PublicPageClient
  address: string
  canonicalUrl?: string
  language: string
  alternates: PublicLanguageAlternate[]
}) => {
  const organization = await client.fetchAccountInfo(address)
  const electionsPage = await client.fetchElections({ organizationId: organization.address, page: 0 })

  return {
    address,
    organization,
    electionsPage,
    meta: buildOrganizationMeta({ organization, canonicalUrl, language, alternates }),
  }
}

export const loadProcessPageData = async ({
  client,
  id,
  canonicalUrl,
  language,
  alternates,
}: {
  client: PublicPageClient
  id: string
  canonicalUrl?: string
  language: string
  alternates: PublicLanguageAlternate[]
}) => {
  const election = await client.fetchElection(id)
  const organization = await client.fetchAccountInfo(election.organizationId)

  return {
    id,
    election,
    organization,
    meta: buildProcessMeta({ election, organization, canonicalUrl, language, alternates }),
  }
}

export const isPublicPageNotFoundError = (error: unknown) =>
  error instanceof ErrElectionNotFound ||
  error instanceof ErrCantParseElectionID ||
  error instanceof ErrAddressMalformed ||
  error instanceof ErrAccountNotFound

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

export { getDefaultPublicLanguage, normalizePublicLanguageCandidate }

export type { ElectionsPageData, OrganizationData, PublicLanguageAlternate, PublicMeta, PublicPageClient }

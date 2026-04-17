import {
  ErrAccountNotFound,
  ErrAddressMalformed,
  ErrCantParseElectionID,
  ErrElectionNotFound,
  PublishedElection,
} from '@vocdoni/sdk'
import { getDefaultPublicLanguage, normalizePublicLanguageCandidate } from '~i18n/public-language'

type PublicLanguageAlternate = {
  hrefLang: string
  href: string
}

type LocalizedText = Record<string, string | undefined>

type OrganizationData = {
  address: string
  account?: {
    name?: LocalizedText
    description?: LocalizedText
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
const normalizeWhitespace = (value: string) => value.replace(/\s+/g, ' ').trim()
const stripHtml = (value: string) => value.replace(/<[^>]+>/g, ' ')
const stripMarkdown = (value: string) =>
  value
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_~>#-]/g, ' ')
    .replace(/\|/g, ' ')
const sanitizeText = (value?: string) => normalizeWhitespace(stripMarkdown(stripHtml(trimText(value))))
const clampText = (value: string, maxLength: number) => {
  if (value.length <= maxLength) return value

  return `${value.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}
const getLocalizedText = (value: LocalizedText | undefined, language: string) => {
  if (!value) return ''

  const exactLanguage = sanitizeText(value[language])
  if (exactLanguage) return exactLanguage

  const baseLanguage = language.split('-')[0]
  const baseMatch = sanitizeText(value[baseLanguage])
  if (baseMatch) return baseMatch

  const defaultValue = sanitizeText(value.default)
  if (defaultValue) return defaultValue

  const firstValue = Object.values(value)
    .map((entry) => sanitizeText(entry))
    .find(Boolean)

  return firstValue ?? ''
}
const withBrandSuffix = (value: string) => `${value} | ${publicSiteName}`
const buildShortDescription = (...parts: Array<string | undefined>) => parts.filter(Boolean).join(' — ')
const buildMetaDescription = (primary: string | undefined, ...fallbackParts: Array<string | undefined>) => {
  const sanitizedPrimary = sanitizeText(primary)
  if (sanitizedPrimary) return clampText(sanitizedPrimary, 160)

  return clampText(sanitizeText(buildShortDescription(...fallbackParts)), 160)
}
const buildMetaTitle = (...parts: Array<string | undefined>) =>
  clampText(withBrandSuffix(parts.filter(Boolean).join(' | ')), 60)
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
  const displayName = getLocalizedText(organization.account?.name, language) || organization.address
  const description =
    buildMetaDescription(getLocalizedText(organization.account?.description, language), displayName) || displayName

  const socialImage = buildSocialImageUrl(canonicalUrl)
  const title = buildMetaTitle(displayName)

  return {
    title,
    description,
    language,
    canonicalUrl,
    alternates,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      image: socialImage,
      siteName: publicSiteName,
    },
    twitter: {
      card: 'summary_large_image',
      title,
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
  const electionTitle = getLocalizedText(election.title as LocalizedText | undefined, language) || election.id
  const organizationName = getLocalizedText(organization?.account?.name, language)
  const description =
    buildMetaDescription(
      getLocalizedText(election.description as LocalizedText | undefined, language),
      electionTitle,
      organizationName
    ) || electionTitle

  const socialImage = buildSocialImageUrl(canonicalUrl)
  const title = buildMetaTitle(electionTitle, organizationName)

  return {
    title,
    description,
    language,
    canonicalUrl,
    alternates,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      image: socialImage,
      siteName: publicSiteName,
    },
    twitter: {
      card: 'summary_large_image',
      title,
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

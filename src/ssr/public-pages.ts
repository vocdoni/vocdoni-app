import { VocdoniApiError } from '@vocdoni/api-client'
import type { Organization, Pagination, VotingProcessResponse } from '@vocdoni/api-types'
import { getDefaultPublicLanguage, normalizePublicLanguageCandidate } from '~i18n/public-language'
import {
  fetchLegacyElection,
  fetchLegacyOrganization,
  fetchLegacyOrganizationElections,
  isLegacyProcessId,
  VochainNotFoundError,
  type LegacyElection,
  type LegacyElectionsPage,
  type LegacyOrganization,
} from '~src/legacy/vochain-archive'
import { ensureAddressPrefix } from '~utils/address'

type PublicLanguageAlternate = {
  hrefLang: string
  href: string
}

type LocalizedText = Record<string, string | undefined>

// The public pages consume the v2 SaaS organization shape directly
// (name/description/logo are locale maps at the top level).
type OrganizationData = Organization

type ElectionsPageData = {
  elections: VotingProcessResponse[]
  pagination: Pagination
}

// Structural sources for the meta builders, satisfied by the v2 SaaS shapes
// and by adapters over the vochain archive shapes (legacy era).
type ProcessMetaSource = {
  id: string
  title?: LocalizedText
  description?: LocalizedText
}

type OrganizationMetaSource = {
  address: string
  name?: LocalizedText
  description?: LocalizedText
  logo?: LocalizedText
}

export const legacyOrganizationToMetaSource = (organization?: LegacyOrganization): OrganizationMetaSource | undefined =>
  organization && {
    address: organization.address,
    name: organization.account?.name,
    description: organization.account?.description,
    logo: organization.account?.avatar ? { default: organization.account.avatar } : undefined,
  }

/**
 * Public process page data, era-discriminated by the process id shape:
 * 64-hex vochain ids resolve against the read-only archive (finished legacy
 * elections), 24-hex Mongo ObjectIDs against the SaaS API.
 */
type PublicProcessPageData =
  | {
      era: 'saas'
      id: string
      election: VotingProcessResponse
      organization: OrganizationData
      meta: PublicMeta
    }
  | {
      era: 'archive'
      id: string
      legacyElection: LegacyElection
      legacyOrganization?: LegacyOrganization
      meta: PublicMeta
    }

/**
 * Public organization page data. Organization addresses look the same in both
 * eras, so the SaaS API is authoritative and the archive only serves addresses
 * the SaaS API doesn't know (legacy-only organizations).
 */
type PublicOrganizationPageData =
  | {
      era: 'saas'
      address: string
      organization: OrganizationData
      electionsPage: ElectionsPageData
      meta: PublicMeta
    }
  | {
      era: 'archive'
      address: string
      legacyOrganization: LegacyOrganization
      legacyElectionsPage: LegacyElectionsPage
      meta: PublicMeta
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
    card: 'summary'
    title: string
    description: string
    image: string
    site: string
    creator: string
  }
}

// Structural subset of the v2 VocdoniApiClient the public pages need.
type PublicPageClient = {
  organizations: {
    get(address: string): Promise<Organization>
  }
  elections: {
    get(id: string): Promise<VotingProcessResponse>
    list(params: {
      orgAddress?: string
      page?: number
    }): Promise<{ processes: VotingProcessResponse[]; pagination: Pagination }>
  }
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
// Same locale-map resolution but without the markdown/HTML sanitization, for
// values that must survive verbatim (e.g. the organization logo URL).
const getLocalizedRawText = (value: LocalizedText | undefined, language: string) => {
  if (!value) return ''

  const exactLanguage = trimText(value[language])
  if (exactLanguage) return exactLanguage

  const baseMatch = trimText(value[language.split('-')[0]])
  if (baseMatch) return baseMatch

  const defaultValue = trimText(value.default)
  if (defaultValue) return defaultValue

  return (
    Object.values(value)
      .map((entry) => trimText(entry))
      .find(Boolean) ?? ''
  )
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
const publicSocialImagePath = '/assets/vocdoni_icon.png'
const publicSiteName = 'Vocdoni'
const publicTwitterAccount = '@vocdoni'
const buildSocialImageUrl = (avatarUrl: string | undefined, canonicalUrl: string | undefined): string => {
  if (avatarUrl) return avatarUrl
  if (canonicalUrl) return new URL(publicSocialImagePath, canonicalUrl).toString()
  return publicSocialImagePath
}

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

export const getPublicOrganizationPath = ({ address, language }: { address: string; language: string }) =>
  `/${language}/organization/${address}`

export const getPublicProcessPath = ({ id, language }: { id: string; language: string }) =>
  `/${language}/processes/${id}`

export const getPublicProcessSummaryPath = ({ id, language }: { id: string; language: string }) =>
  `/${language}/processes/${id}/summary`

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
  organization: OrganizationMetaSource
  canonicalUrl?: string
  language: string
  alternates: PublicLanguageAlternate[]
}): PublicMeta => {
  const displayName = getLocalizedText(organization.name, language) || organization.address
  const description =
    buildMetaDescription(getLocalizedText(organization.description, language), displayName) || displayName

  const socialImage = buildSocialImageUrl(getLocalizedRawText(organization.logo, language) || undefined, canonicalUrl)
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
      card: 'summary',
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
  election: ProcessMetaSource
  organization?: OrganizationMetaSource
  canonicalUrl?: string
  language: string
  alternates: PublicLanguageAlternate[]
}): PublicMeta => {
  const electionTitle = getLocalizedText(election.title, language) || election.id
  const organizationName = getLocalizedText(organization?.name, language)
  const description =
    buildMetaDescription(getLocalizedText(election.description, language), electionTitle, organizationName) ||
    electionTitle

  const socialImage = buildSocialImageUrl(getLocalizedRawText(organization?.logo, language) || undefined, canonicalUrl)
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
      card: 'summary',
      title,
      description,
      image: socialImage,
      site: publicTwitterAccount,
      creator: publicTwitterAccount,
    },
  }
}

const isSaasNotFoundError = (error: unknown) =>
  error instanceof VocdoniApiError && (error.status === 404 || error.status === 400)

export const loadOrganizationPageData = async ({
  client,
  vochainGateway,
  address,
  canonicalUrl,
  language,
  alternates,
}: {
  client: PublicPageClient
  /** When set, SaaS-unknown addresses fall back to the read-only vochain archive. */
  vochainGateway?: string
  address: string
  canonicalUrl?: string
  language: string
  alternates: PublicLanguageAlternate[]
}): Promise<PublicOrganizationPageData> => {
  try {
    const organization = await client.organizations.get(address)
    // SAAS list pages are 1-based.
    const { processes, pagination } = await client.elections.list({ orgAddress: organization.address, page: 1 })

    return {
      era: 'saas',
      address,
      organization,
      electionsPage: { elections: processes, pagination } satisfies ElectionsPageData,
      meta: buildOrganizationMeta({ organization, canonicalUrl, language, alternates }),
    }
  } catch (error) {
    if (!vochainGateway || !isSaasNotFoundError(error)) throw error
  }

  // Organization addresses look the same in both eras, so the archive serves
  // the addresses the SaaS API doesn't know (legacy-only organizations).
  const legacyOrganization = await fetchLegacyOrganization(vochainGateway, address)
  const legacyElectionsPage = await fetchLegacyOrganizationElections(vochainGateway, legacyOrganization.address, 0)

  return {
    era: 'archive',
    address,
    legacyOrganization,
    legacyElectionsPage,
    meta: buildOrganizationMeta({
      organization: legacyOrganizationToMetaSource(legacyOrganization)!,
      canonicalUrl,
      language,
      alternates,
    }),
  }
}

export const loadProcessPageData = async ({
  client,
  vochainGateway,
  id,
  canonicalUrl,
  language,
  alternates,
}: {
  client: PublicPageClient
  /** When set, 64-hex vochain ids resolve against the read-only archive. */
  vochainGateway?: string
  id: string
  canonicalUrl?: string
  language: string
  alternates: PublicLanguageAlternate[]
}): Promise<PublicProcessPageData> => {
  if (vochainGateway && isLegacyProcessId(id)) {
    const legacyElection = await fetchLegacyElection(vochainGateway, id)
    const legacyOrganization = await fetchLegacyOrganization(vochainGateway, legacyElection.organizationId).catch(
      () => undefined
    )

    return {
      era: 'archive',
      id,
      legacyElection,
      legacyOrganization,
      meta: buildProcessMeta({
        election: legacyElection,
        organization: legacyOrganizationToMetaSource(legacyOrganization),
        canonicalUrl,
        language,
        alternates,
      }),
    }
  }

  const election = await client.elections.get(id)
  // Process reads return orgAddress unprefixed; the organization endpoint wants 0x.
  const organization = await client.organizations.get(ensureAddressPrefix(election.orgAddress))

  return {
    era: 'saas',
    id,
    election,
    organization,
    meta: buildProcessMeta({ election, organization, canonicalUrl, language, alternates }),
  }
}

// The SaaS API answers unknown ids/addresses with 404 and malformed ones with
// 400, and the archive throws VochainNotFoundError for ids the gateway doesn't
// know — all should render the public 404 page rather than a server error.
export const isPublicPageNotFoundError = (error: unknown) =>
  isSaasNotFoundError(error) || error instanceof VochainNotFoundError

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

export {
  getPublicLocalizedOrganizationRouteMatch,
  getPublicLocalizedProcessRouteMatch,
  getPublicLocalizedProcessSummaryRouteMatch,
} from './public-routes'

export { getDefaultPublicLanguage, normalizePublicLanguageCandidate }

export type {
  ElectionsPageData,
  OrganizationData,
  OrganizationMetaSource,
  ProcessMetaSource,
  PublicLanguageAlternate,
  PublicMeta,
  PublicOrganizationPageData,
  PublicPageClient,
  PublicProcessPageData,
}

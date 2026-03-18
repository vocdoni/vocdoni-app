import { PublishedElection } from '@vocdoni/sdk'
import { AppTitle } from '~constants'

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

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '')
const publicMetaCopy = {
  en: {
    organizationFallback: (value: string) => `Explore the public organization page for ${value}.`,
    processFallback: (value: string) => `Explore the public voting process ${value}.`,
  },
  es: {
    organizationFallback: (value: string) => `Explora la pagina publica de la organizacion ${value}.`,
    processFallback: (value: string) => `Explora el proceso de votacion publico ${value}.`,
  },
  ca: {
    organizationFallback: (value: string) => `Explora la pagina publica de l'organitzacio ${value}.`,
    processFallback: (value: string) => `Explora el proces de votacio public ${value}.`,
  },
  it: {
    organizationFallback: (value: string) => `Esplora la pagina pubblica dell'organizzazione ${value}.`,
    processFallback: (value: string) => `Esplora il processo di voto pubblico ${value}.`,
  },
} as const

const trimText = (value?: string) => value?.trim() ?? ''

const withAppTitle = (value: string) => `${AppTitle} - ${value}`

const fallbackDescription = (value: string, kind: 'organization' | 'process', language: string) =>
  kind === 'organization'
    ? (publicMetaCopy[language as keyof typeof publicMetaCopy] ?? publicMetaCopy.en).organizationFallback(value)
    : (publicMetaCopy[language as keyof typeof publicMetaCopy] ?? publicMetaCopy.en).processFallback(value)

export const getDefaultPublicLanguage = (supportedLanguages: string[]) =>
  supportedLanguages.includes('en') ? 'en' : supportedLanguages[0]

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

export const getPublicOrganizationPath = ({
  address,
  language,
  defaultLanguage,
}: {
  address: string
  language: string
  defaultLanguage: string
}) => (language === defaultLanguage ? `/organization/${address}` : `/${language}/organization/${address}`)

export const getPublicProcessPath = ({
  id,
  language,
  defaultLanguage,
}: {
  id: string
  language: string
  defaultLanguage: string
}) => (language === defaultLanguage ? `/processes/${id}` : `/${language}/processes/${id}`)

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
  if (defaultPathname) {
    alternates.push({
      hrefLang: 'x-default',
      href: `${origin}/${trimSlashes(defaultPathname)}`,
    })
  }

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
  const description =
    trimText(organization.account?.description?.default) ||
    fallbackDescription(organization.address, 'organization', language)

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
  const descriptionBase =
    trimText(election.description?.default) || fallbackDescription(electionTitle, 'process', language)
  const description = organizationName ? `${descriptionBase} ${organizationName}` : descriptionBase

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
    election,
    organization,
    meta: buildProcessMeta({ election, organization, canonicalUrl, language, alternates }),
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

export type { ElectionsPageData, OrganizationData, PublicLanguageAlternate, PublicMeta, PublicPageClient }

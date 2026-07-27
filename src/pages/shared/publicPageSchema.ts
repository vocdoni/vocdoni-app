import type { VotingProcessResponse } from '@vocdoni/api-types'
import { getPublicOrganizationPath, type OrganizationData, type PublicMeta } from '~src/ssr/public-pages'

type StructuredData = Record<string, unknown>

const trimText = (value?: string) => value?.trim() ?? ''
const getLocalizedText = (value: Record<string, string | undefined> | undefined, language: string) => {
  if (!value) return ''

  return trimText(value[language]) || trimText(value[language.split('-')[0]]) || trimText(value.default)
}

const getPageOrigin = (canonicalUrl?: string) => {
  if (!canonicalUrl) return null

  try {
    return new URL(canonicalUrl).origin
  } catch {
    return null
  }
}

const buildBreadcrumbList = ({ items }: { items: Array<{ name: string; item?: string }> }): StructuredData => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((entry, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: entry.name,
    ...(entry.item ? { item: entry.item } : {}),
  })),
})

export const buildOrganizationStructuredData = ({
  organization,
  meta,
}: {
  organization: OrganizationData
  meta: PublicMeta
}): StructuredData[] => {
  if (!meta.canonicalUrl) return []

  const name = getLocalizedText(organization.name, meta.language) || organization.address
  const description = meta.description

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name,
      description,
      url: meta.canonicalUrl,
      identifier: organization.address,
      logo: meta.openGraph.image,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: meta.title,
      description,
      url: meta.canonicalUrl,
      inLanguage: meta.language,
      about: {
        '@type': 'Organization',
        name,
        identifier: organization.address,
      },
    },
    buildBreadcrumbList({
      items: [
        { name: 'Vocdoni', item: getPageOrigin(meta.canonicalUrl) ?? undefined },
        { name, item: meta.canonicalUrl },
      ],
    }),
  ]
}

export const buildProcessStructuredData = ({
  election,
  organization,
  meta,
}: {
  election: VotingProcessResponse
  organization?: OrganizationData
  meta: PublicMeta
}): StructuredData[] => {
  if (!meta.canonicalUrl) return []

  const processName =
    getLocalizedText(election.title as Record<string, string | undefined> | undefined, meta.language) || election.id
  const organizationName = getLocalizedText(organization?.name, meta.language) || organization?.address
  const origin = getPageOrigin(meta.canonicalUrl)
  const organizationUrl =
    origin && organization?.address
      ? `${origin}${getPublicOrganizationPath({ address: organization.address, language: meta.language })}`
      : undefined

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: meta.title,
      description: meta.description,
      url: meta.canonicalUrl,
      inLanguage: meta.language,
      isPartOf: {
        '@type': 'WebSite',
        name: 'Vocdoni',
        url: origin ?? meta.canonicalUrl,
      },
      about: {
        '@type': 'Thing',
        name: processName,
      },
      ...(organizationName
        ? {
            publisher: {
              '@type': 'Organization',
              name: organizationName,
              ...(organizationUrl ? { url: organizationUrl } : {}),
            },
          }
        : {}),
    },
    buildBreadcrumbList({
      items: [
        { name: 'Vocdoni', item: origin ?? undefined },
        ...(organizationName ? [{ name: organizationName, item: organizationUrl }] : []),
        { name: processName, item: meta.canonicalUrl },
      ],
    }),
  ]
}

export type { StructuredData }

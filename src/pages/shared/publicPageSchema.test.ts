import { PublishedElection } from '@vocdoni/sdk'
import { describe, expect, it } from 'vitest'
import { buildOrganizationStructuredData, buildProcessStructuredData } from './publicPageSchema'

const organization = {
  address: '0xabc',
  account: {
    name: { default: 'Vocdoni Association', ca: 'Associació Vocdoni' },
    description: { default: 'A digital voting organization for tests.' },
  },
} as const

const processMeta = {
  title: 'Elecció del consell 2026 | Associació Vocdoni | Vocdoni',
  description: 'Vota pels nous membres del consell.',
  language: 'ca',
  canonicalUrl: 'https://app.example.org/ca/processes/0xprocess',
  alternates: [],
  openGraph: {
    title: 'Elecció del consell 2026 | Associació Vocdoni | Vocdoni',
    description: 'Vota pels nous membres del consell.',
    type: 'website' as const,
    url: 'https://app.example.org/ca/processes/0xprocess',
    image: 'https://app.example.org/assets/vocdoniapp.png',
    siteName: 'Vocdoni',
  },
  twitter: {
    card: 'summary' as const,
    title: 'Elecció del consell 2026 | Associació Vocdoni | Vocdoni',
    description: 'Vota pels nous membres del consell.',
    image: 'https://app.example.org/assets/vocdoniapp.png',
    site: '@vocdoni',
    creator: '@vocdoni',
  },
}

describe('publicPageSchema', () => {
  it('builds organization structured data for canonical organization pages', () => {
    const [organizationSchema, collectionSchema, breadcrumbSchema] = buildOrganizationStructuredData({
      organization: organization as any,
      meta: {
        ...processMeta,
        title: 'Associació Vocdoni | Vocdoni',
        canonicalUrl: 'https://app.example.org/ca/organization/0xabc',
      },
    })

    expect(organizationSchema).toMatchObject({
      '@type': 'Organization',
      name: 'Associació Vocdoni',
      url: 'https://app.example.org/ca/organization/0xabc',
    })
    expect(collectionSchema).toMatchObject({
      '@type': 'CollectionPage',
      inLanguage: 'ca',
    })
    expect(breadcrumbSchema).toMatchObject({
      '@type': 'BreadcrumbList',
    })
  })

  it('builds process structured data with organization breadcrumbs', () => {
    const election = new PublishedElection({
      id: '0xprocess',
      organizationId: '0xabc',
      title: { default: 'Board election 2026', ca: 'Elecció del consell 2026' },
      description: { default: 'Vote for the next board members.', ca: 'Vota pels nous membres del consell.' },
      electionType: {
        anonymous: false,
        interruptible: true,
        dynamicCensus: false,
        secretUntilTheEnd: false,
      },
      census: null,
      questions: [],
    } as any)

    const [webPageSchema, breadcrumbSchema] = buildProcessStructuredData({
      election,
      organization: organization as any,
      meta: processMeta as any,
    })

    expect(webPageSchema).toMatchObject({
      '@type': 'WebPage',
      inLanguage: 'ca',
      url: 'https://app.example.org/ca/processes/0xprocess',
    })
    expect(webPageSchema.publisher).toMatchObject({
      '@type': 'Organization',
      name: 'Associació Vocdoni',
    })
    expect(breadcrumbSchema).toMatchObject({
      '@type': 'BreadcrumbList',
    })
  })
})

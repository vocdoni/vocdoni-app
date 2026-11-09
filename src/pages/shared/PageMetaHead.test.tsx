import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import PageMetaHead from './PageMetaHead'
import type { PublicMeta } from '~src/ssr/public-pages'

const pageMeta: PublicMeta = {
  title: 'Vocdoni - Board election 2026',
  description: 'Vote for the next board members.',
  language: 'en',
  canonicalUrl: 'https://app.example.org/en/processes/0xprocess',
  alternates: [
    { hrefLang: 'en', href: 'https://app.example.org/en/processes/0xprocess' },
    { hrefLang: 'es', href: 'https://app.example.org/es/processes/0xprocess' },
  ],
  openGraph: {
    title: 'Vocdoni - Board election 2026',
    description: 'Vote for the next board members.',
    type: 'website',
    url: 'https://app.example.org/en/processes/0xprocess',
    image: 'https://app.example.org/assets/vocdoniapp.png',
    siteName: 'Vocdoni',
  },
  twitter: {
    card: 'summary',
    title: 'Vocdoni - Board election 2026',
    description: 'Vote for the next board members.',
    image: 'https://app.example.org/assets/vocdoniapp.png',
    site: '@vocdoni',
    creator: '@vocdoni',
  },
}

// Greedy on purpose: a raw `</script>` inside the payload must not end the match early.
const ldJsonText = (html: string) => {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*)<\/script>/)
  if (!match) throw new Error('no application/ld+json script rendered')
  return match[1]
}

describe('PageMetaHead', () => {
  it('renders canonical, alternate, open graph, and twitter tags without duplicating title or description tags', () => {
    const html = renderToStaticMarkup(
      <PageMetaHead
        meta={pageMeta}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Board election 2026',
          },
        ]}
      />
    )

    // vike-react already emits <title>/og:title (from +title) and the meta
    // description/og:description pair (from +description).
    expect(html).not.toContain('<title>')
    expect(html).not.toContain('name="description"')
    expect(html).not.toContain('property="og:title"')
    expect(html).not.toContain('property="og:description"')
    expect(html).toContain('property="og:locale" content="en_US"')
    expect(html).toContain('property="og:locale:alternate" content="es_ES"')
    expect(html).toContain('property="og:type" content="website"')
    expect(html).toContain('property="og:image" content="https://app.example.org/assets/vocdoniapp.png"')
    expect(html).toContain('property="og:site_name" content="Vocdoni"')
    expect(html).toContain('property="og:url" content="https://app.example.org/en/processes/0xprocess"')
    expect(html).toContain('name="twitter:title" content="Vocdoni - Board election 2026"')
    expect(html).toContain('name="twitter:image" content="https://app.example.org/assets/vocdoniapp.png"')
    expect(html).toContain('name="twitter:site" content="@vocdoni"')
    expect(html).toContain('name="twitter:creator" content="@vocdoni"')
    expect(html).toContain('rel="canonical" href="https://app.example.org/en/processes/0xprocess"')
    expect(html).toContain('rel="alternate" hrefLang="es" href="https://app.example.org/es/processes/0xprocess"')
    expect(html).toContain('type="application/ld+json"')
    expect(html).toContain('"@type":"WebPage"')
  })

  it('keeps a name that closes the script element inside the ld+json payload', () => {
    const name = 'x</script><script>alert(1)</script>'
    const html = renderToStaticMarkup(
      <PageMetaHead meta={pageMeta} structuredData={[{ '@context': 'https://schema.org', '@type': 'WebPage', name }]} />
    )

    const jsonLd = ldJsonText(html)
    expect(jsonLd).not.toMatch(/<\/script/i)
    expect(JSON.parse(jsonLd)).toEqual({ '@context': 'https://schema.org', '@type': 'WebPage', name })
  })

  it('round-trips ampersands and U+2028/U+2029 unchanged', () => {
    const name = 'Board \u2028 election \u2029 & tally'
    const html = renderToStaticMarkup(
      <PageMetaHead meta={pageMeta} structuredData={[{ '@context': 'https://schema.org', '@type': 'WebPage', name }]} />
    )

    const jsonLd = ldJsonText(html)
    expect(jsonLd).not.toMatch(/[&\u2028\u2029]/)
    expect(JSON.parse(jsonLd).name).toBe(name)
  })
})

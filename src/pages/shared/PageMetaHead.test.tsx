import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import PageMetaHead from './PageMetaHead'

describe('PageMetaHead', () => {
  it('renders canonical, alternate, open graph, and twitter tags without duplicating title or description tags', () => {
    const html = renderToStaticMarkup(
      <PageMetaHead
        meta={{
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
        }}
        structuredData={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Board election 2026',
          },
        ]}
      />
    )

    expect(html).not.toContain('<title>')
    expect(html).not.toContain('name="description"')
    expect(html).toContain('property="og:title" content="Vocdoni - Board election 2026"')
    expect(html).toContain('property="og:description" content="Vote for the next board members."')
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
})

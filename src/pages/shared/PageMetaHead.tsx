import type { StructuredData } from './publicPageSchema'
import type { PublicMeta } from '~src/ssr/public-pages'

type PageMetaHeadProps = {
  meta: PublicMeta
  structuredData?: StructuredData[]
}

const openGraphLocaleMap: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  ca: 'ca_ES',
  it: 'it_IT',
}

const toOpenGraphLocale = (language: string) => openGraphLocaleMap[language] ?? language

const PageMetaHead = ({ meta, structuredData = [] }: PageMetaHeadProps) => {
  const alternateOpenGraphLocales = meta.alternates
    .map((alternate) => alternate.hrefLang)
    .filter((hrefLang) => hrefLang !== 'x-default' && hrefLang !== meta.language)
    .map(toOpenGraphLocale)

  return (
    <>
      <meta property='og:locale' content={toOpenGraphLocale(meta.language)} />
      {alternateOpenGraphLocales.map((locale) => (
        <meta key={locale} property='og:locale:alternate' content={locale} />
      ))}
      <meta property='og:type' content={meta.openGraph.type} />
      <meta property='og:title' content={meta.openGraph.title} />
      <meta property='og:description' content={meta.openGraph.description} />
      <meta property='og:image' content={meta.openGraph.image} />
      <meta property='og:site_name' content={meta.openGraph.siteName} />
      {meta.openGraph.url ? <meta property='og:url' content={meta.openGraph.url} /> : null}
      <meta name='twitter:card' content={meta.twitter.card} />
      <meta name='twitter:title' content={meta.twitter.title} />
      <meta name='twitter:description' content={meta.twitter.description} />
      <meta name='twitter:image' content={meta.twitter.image} />
      <meta name='twitter:site' content={meta.twitter.site} />
      <meta name='twitter:creator' content={meta.twitter.creator} />
      {meta.canonicalUrl ? <link rel='canonical' href={meta.canonicalUrl} /> : null}
      {meta.alternates.map((alternate) => (
        <link
          key={`${alternate.hrefLang}-${alternate.href}`}
          rel='alternate'
          hrefLang={alternate.hrefLang}
          href={alternate.href}
        />
      ))}
      {structuredData.map((entry, index) => (
        <script
          key={`structured-data-${index}`}
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  )
}

export default PageMetaHead

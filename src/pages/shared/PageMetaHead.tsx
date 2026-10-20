import { toOpenGraphLocale } from '~i18n/languages'
import type { StructuredData } from './publicPageSchema'
import type { PublicMeta } from '~src/ssr/public-pages'

// JSON.stringify leaves `<`, `>`, `&` and U+2028/U+2029 untouched, so a name containing
// `</script>` would close the script element. Escaping them as JSON unicode escapes keeps
// the output valid JSON that parses back to the same object.
const serializeJsonLd = (data: StructuredData) =>
  JSON.stringify(data).replace(/[<>&\u2028\u2029]/g, (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`)

type PageMetaHeadProps = {
  meta: PublicMeta
  structuredData?: StructuredData[]
}
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
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(entry) }}
        />
      ))}
    </>
  )
}

export default PageMetaHead

import type { PublicMeta } from '~src/ssr/public-pages'

type PageMetaHeadProps = {
  meta: PublicMeta
}

const PageMetaHead = ({ meta }: PageMetaHeadProps) => {
  return (
    <>
      <meta property='og:locale' content={meta.language} />
      <meta property='og:type' content={meta.openGraph.type} />
      {meta.openGraph.url ? <meta property='og:url' content={meta.openGraph.url} /> : null}
      <meta name='twitter:card' content={meta.twitter.card} />
      <meta name='twitter:title' content={meta.twitter.title} />
      <meta name='twitter:description' content={meta.twitter.description} />
      {meta.canonicalUrl ? <link rel='canonical' href={meta.canonicalUrl} /> : null}
      {meta.alternates.map((alternate) => (
        <link
          key={`${alternate.hrefLang}-${alternate.href}`}
          rel='alternate'
          hrefLang={alternate.hrefLang}
          href={alternate.href}
        />
      ))}
    </>
  )
}

export default PageMetaHead

import { usePageContext } from 'vike-react/usePageContext'
import { useLegacyPublicPathRedirect, useRootLanguageRedirect } from '~src/pages/shared/publicPageRedirect'

// In production the server redirects unprefixed paths before this page loads
// (server/public-language-routing.mjs). It remains for the Vite dev server and
// for client-side navigations to an unprefixed link.
export default function Page() {
  const pageContext = usePageContext()

  if (pageContext.urlPathname === '/') {
    return <RootRedirectPage />
  }

  return <LegacyRedirectPage pathname={pageContext.urlPathname} />
}

const RootRedirectPage = () => {
  useRootLanguageRedirect({})

  return null
}

const LegacyRedirectPage = ({ pathname }: { pathname: string }) => {
  useLegacyPublicPathRedirect({ pathname })

  return null
}

import { usePageContext } from 'vike-react/usePageContext'
import { useLegacyPublicPathRedirect, useRootLanguageRedirect } from '~src/pages/shared/publicPageRedirect'

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

import { usePageContext } from 'vike-react/usePageContext'
import { isUnlocalizedPath } from '~i18n/public-language'
import { Providers } from '~src/Providers'
import { usePreferredPublicLanguageRedirect, useRootLanguageRedirect } from '~src/pages/shared/publicPageRedirect'

export default function Page() {
  const pageContext = usePageContext()

  if (pageContext.urlPathname === '/') {
    return <RootRedirectPage />
  }

  if (isUnlocalizedPath(pageContext.urlPathname)) {
    return <Providers />
  }

  return <PublicEnglishAliasPage pathname={pageContext.urlPathname} />
}

const RootRedirectPage = () => {
  useRootLanguageRedirect({})

  return null
}

const PublicEnglishAliasPage = ({ pathname }: { pathname: string }) => {
  usePreferredPublicLanguageRedirect({
    pathname,
  })

  return <Providers />
}

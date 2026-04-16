import { usePageContext } from 'vike-react/usePageContext'
import { Providers } from '~src/Providers'
import { usePreferredPublicLanguageRedirect } from '~src/pages/shared/publicPageRedirect'

export default function Page() {
  const pageContext = usePageContext()
  const language = pageContext.routeParams.lang

  usePreferredPublicLanguageRedirect({
    pathname: pageContext.urlPathname,
  })

  return <Providers language={language} basename={`/${language}`} />
}

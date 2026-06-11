import { usePageContext } from 'vike-react/usePageContext'
import { Providers } from '~src/Providers'
import { usePreferredPublicLanguageRedirect } from '~src/pages/shared/publicPageRedirect'

export default function Page() {
  const pageContext = usePageContext()
  const language = pageContext.routeParams.lang

  usePreferredPublicLanguageRedirect({
    pathname: pageContext.urlPathname,
  })

  // Providers derives the router basename from the language and keeps it in
  // client state so it can be switched in place without a full reload.
  return <Providers language={language} />
}

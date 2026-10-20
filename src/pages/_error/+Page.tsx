import { usePageContext } from 'vike-react/usePageContext'
import { ErrorView } from '~elements/Error'
import PublicLayout from '~elements/PublicLayout'
import { AppProviders } from '~src/Providers'

const ErrorPage = () => {
  const pageContext = usePageContext()
  const statusCode = pageContext.abortStatusCode || 500
  const pathname = pageContext.urlPathname || '/'
  const language = pageContext.routeParams.lang
  const returnHomeHref = language ? `/${language}` : '/'

  return (
    <AppProviders language={language}>
      <PublicLayout pathname={pathname}>
        <ErrorView isNotFound={statusCode === 404} returnHomeHref={returnHomeHref} />
      </PublicLayout>
    </AppProviders>
  )
}

export default ErrorPage

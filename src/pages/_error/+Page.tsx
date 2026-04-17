import { usePageContext } from 'vike-react/usePageContext'
import { ErrorView } from '~elements/Error'
import PublicLayout from '~elements/PublicLayout'
import { AppProviders } from '~src/Providers'

const ErrorPage = () => {
  const pageContext = usePageContext()
  const statusCode = pageContext.abortStatusCode || 500
  const pathname = pageContext.urlPathname || '/'
  const language = pageContext.routeParams.lang
  const errorMessage =
    pageContext.abortReason instanceof Error
      ? pageContext.abortReason.message
      : typeof pageContext.abortReason === 'string'
        ? pageContext.abortReason
        : 'Error loading the page'
  const returnHomeHref = language ? `/${language}` : '/'

  return (
    <AppProviders language={language}>
      <PublicLayout pathname={pathname}>
        <ErrorView isNotFound={statusCode === 404} message={errorMessage} returnHomeHref={returnHomeHref} />
      </PublicLayout>
    </AppProviders>
  )
}

export default ErrorPage

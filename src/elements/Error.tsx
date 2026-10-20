import { Button, Flex, Icon } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, useLocation, useNavigate, useRouteError } from 'react-router'
import { LuHouse, LuLayoutDashboard, LuRotateCw } from 'react-icons/lu'
import { RiErrorWarningLine } from 'react-icons/ri'
import { useAuth } from '~components/Auth/useAuth'
import { Heading, SubHeading } from '~components/Dashboard/Contents'
import { Routes } from '~src/router/routes'
import { isPublicPageNotFoundError } from '~src/ssr/public-pages'
import { capturePosthogException } from '~utils/analytics'
import { getNotFoundReturnPath, NotFoundView } from './NotFound'

export type ErrorViewProps = {
  isNotFound?: boolean
  onReturnHome?: () => void
  returnHomeHref?: string
  /** Where the return button leads, which sets its label. */
  returnTo?: 'dashboard' | 'home'
}

// SaaS 404/400 responses, archive VochainNotFoundError and router 404s all mean "not found".
export const isNotFoundError = (error: unknown) =>
  isPublicPageNotFoundError(error) || (isRouteErrorResponse(error) && error.status === 404)

export const ErrorView = ({ isNotFound = false, onReturnHome, returnHomeHref, returnTo = 'home' }: ErrorViewProps) => {
  const { t } = useTranslation()

  if (isNotFound) {
    return <NotFoundView onReturnHome={onReturnHome} returnHomeHref={returnHomeHref} />
  }

  const returnContent =
    returnTo === 'dashboard' ? (
      <>
        <Icon as={LuLayoutDashboard} />
        {t('error.go_to_dashboard', { defaultValue: 'Go to dashboard' })}
      </>
    ) : (
      <>
        <Icon as={LuHouse} />
        {t('error.return_to_home')}
      </>
    )

  return (
    <Flex direction='column' align='center' justify='center' textAlign='center' gap={3} minH='30vh' px={4}>
      <Icon as={RiErrorWarningLine} boxSize={12} color='texts.subtle' />
      <Heading size='lg'>{t('error.crash_title', { defaultValue: 'Something went wrong' })}</Heading>
      <SubHeading m={0} maxW='45ch'>
        {t('error.crash_description', {
          defaultValue: 'Reload the page or go back to the dashboard.',
        })}
      </SubHeading>

      <Flex gap={3} wrap='wrap' justify='center'>
        <Button variant='outline' onClick={() => window.location.reload()}>
          <Icon as={LuRotateCw} />
          {t('error.reload', { defaultValue: 'Reload' })}
        </Button>
        {returnHomeHref ? (
          <Button asChild>
            <a href={returnHomeHref}>{returnContent}</a>
          </Button>
        ) : (
          <Button onClick={onReturnHome}>{returnContent}</Button>
        )}
      </Flex>
    </Flex>
  )
}

// A route's errorElement catches render errors before `window.onerror`, so PostHog's automatic
// exception capture never sees them. Each error object is reported once, however many times its
// error element mounts (StrictMode, nested routes sharing it).
const reportedErrors = new WeakSet<object>()

const reportRouteError = (error: unknown, route: string) => {
  if (isNotFoundError(error)) return
  if (typeof error === 'object' && error !== null) {
    if (reportedErrors.has(error)) return
    reportedErrors.add(error)
  }
  capturePosthogException(error, { route })
}

const Error = () => {
  const error = useRouteError()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { pathname } = useLocation()

  useEffect(() => {
    reportRouteError(error, pathname)
    // Only a new error is worth reporting, not a path change while it is shown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error])

  const returnPath = getNotFoundReturnPath({ isAuthenticated, pathname })

  return (
    <ErrorView
      isNotFound={isNotFoundError(error)}
      returnTo={returnPath === Routes.dashboard.base ? 'dashboard' : 'home'}
      onReturnHome={() => navigate(returnPath)}
    />
  )
}

export default Error

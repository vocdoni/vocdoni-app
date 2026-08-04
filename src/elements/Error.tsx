import { Flex, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useRouteError } from 'react-router-dom'
import { RiErrorWarningLine } from 'react-icons/ri'
import { useAuth } from '~components/Auth/useAuth'
import { isPublicPageNotFoundError } from '~src/ssr/public-pages'
import { getNotFoundReturnPath, NotFoundView } from './NotFound'

export type ErrorViewProps = {
  isNotFound?: boolean
  message?: string
  onReturnHome?: () => void
  returnHomeHref?: string
}

// SaaS 404/400 responses and archive VochainNotFoundError both mean "not found".
export const isNotFoundError = isPublicPageNotFoundError

export const ErrorView = ({ isNotFound = false, message, onReturnHome, returnHomeHref }: ErrorViewProps) => {
  const { t } = useTranslation()

  if (isNotFound) {
    return <NotFoundView onReturnHome={onReturnHome} returnHomeHref={returnHomeHref} />
  }

  const errorMessage = message ?? t('error.loading_page')

  return (
    <Flex
      flexDirection='column'
      gap={4}
      alignItems='center'
      mt={12}
      mb={44}
      px={{
        base: 10,
        sm: 14,
      }}
    >
      <RiErrorWarningLine />
      <Text>{t('error.loading_page')}</Text>
      <Text>{errorMessage}</Text>
    </Flex>
  )
}

const Error = () => {
  const error = useRouteError()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { pathname } = useLocation()

  return (
    <ErrorView
      isNotFound={isNotFoundError(error)}
      message={(error as Error)?.toString()}
      onReturnHome={() =>
        navigate(
          getNotFoundReturnPath({
            isAuthenticated,
            pathname,
          })
        )
      }
    />
  )
}

export default Error

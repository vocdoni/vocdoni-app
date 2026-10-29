import { Button, Flex, Icon, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { HomeIcon } from '~theme/icons'
import { matchPath, useLocation, useNavigate } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import { PageSubtitle, PageTitle } from '~components/ui/PageTitle'
import { Routes } from '~src/router/routes'

export const getNotFoundReturnPath = ({
  isAuthenticated,
  pathname,
}: {
  isAuthenticated?: boolean
  pathname: string
}) => {
  const inAdminContext = !!matchPath('/admin/*', pathname)

  return isAuthenticated && inAdminContext ? Routes.dashboard.base : Routes.root
}

export type NotFoundViewProps = {
  onReturnHome?: () => void
  returnHomeHref?: string
}

export const NotFoundView = ({ onReturnHome, returnHomeHref }: NotFoundViewProps) => {
  const { t } = useTranslation()

  return (
    <Flex direction='column' align='center' justify='center' textAlign='center' gap={3} minH='30vh'>
      <Text as='div' fontSize='6xl' fontWeight='extrabold' lineHeight='1'>
        404
      </Text>
      <PageTitle textStyle='lg'>{t('error.not_found')}</PageTitle>
      <PageSubtitle m={0} maxW='45ch'>
        {t('error.not_found_description', {
          defaultValue: "The page you're looking for does not exist or has been moved.",
        })}
      </PageSubtitle>

      {returnHomeHref ? (
        <Button asChild>
          <a href={returnHomeHref}>
            <Icon as={HomeIcon} />
            {t('error.return_to_home')}
          </a>
        </Button>
      ) : (
        <Button onClick={onReturnHome}>
          <Icon as={HomeIcon} />
          {t('error.return_to_home')}
        </Button>
      )}
    </Flex>
  )
}

const NotFound = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { pathname } = useLocation()

  return (
    <NotFoundView
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

export default NotFound

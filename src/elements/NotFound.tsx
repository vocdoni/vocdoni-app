import { Button, Flex, Icon, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuHouse } from 'react-icons/lu'
import { matchPath, useLocation, useNavigate } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import { Heading, SubHeading } from '~components/Dashboard/Contents'
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
      <Heading size='lg'>{t('error.not_found')}</Heading>
      <SubHeading m={0} maxW='45ch'>
        {t('error.not_found_description', {
          defaultValue: "The page you're looking for does not exist or has been moved.",
        })}
      </SubHeading>

      {returnHomeHref ? (
        <Button asChild>
          <a href={returnHomeHref}>
            <Icon as={LuHouse} />
            {t('error.return_to_home')}
          </a>
        </Button>
      ) : (
        <Button onClick={onReturnHome}>
          <Icon as={LuHouse} />
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

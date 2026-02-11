import { Button, Flex, Icon, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuHouse } from 'react-icons/lu'
import { matchPath, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { Heading, SubHeading } from '~components/shared/Dashboard/Contents'
import { Routes } from '~src/router/routes'

const NotFound = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { pathname } = useLocation()

  const inAdminContext = !!matchPath('/admin/*', pathname)

  const redirectToDashboardOrHome = () =>
    navigate(isAuthenticated && inAdminContext ? Routes.dashboard.base : Routes.root)

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

      <Button onClick={redirectToDashboardOrHome}>
        <Icon as={LuHouse} />
        {t('error.return_to_home')}
      </Button>
    </Flex>
  )
}

export default NotFound

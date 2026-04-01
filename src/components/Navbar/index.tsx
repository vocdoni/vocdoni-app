import { Button, ButtonProps, Flex } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as ReactRouterLink } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import Logo from '~components/Layout/Logo'
import { Routes } from '~src/router/routes'

const Navbar = () => (
  <Flex width='full' m='0 auto' mx='auto' py={3} position='relative' maxW='voting-page'>
    <Logo />
  </Flex>
)

const DashboardButton = (props?: ButtonProps) => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  return (
    <Button asChild px={6} {...props}>
      <ReactRouterLink to={isAuthenticated ? generatePath(Routes.dashboard.base) : Routes.auth.signIn}>
        {isAuthenticated ? t('menu.dashboard', { defaultValue: 'Dashboard' }) : t('menu.login')}
      </ReactRouterLink>
    </Button>
  )
}
export default Navbar

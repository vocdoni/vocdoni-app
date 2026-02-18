import { Button, ButtonProps, Flex } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as ReactRouterLink } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { ColorModeSwitcher } from '~shared/Layout/ColorModeSwitcher'
import Logo from '~shared/Layout/Logo'
import { Routes } from '~src/router/routes'
import { LanguagesMenu } from './LanguagesList'

const Navbar = () => (
  <Flex width='full' py={3} position='relative' justifyContent='space-between' zIndex='topbar' alignItems='center'>
    <Logo />
    <Flex alignItems='center' gap={2} justifySelf='end'>
      <DashboardButton />
      <LanguagesMenu />
      <ColorModeSwitcher />
    </Flex>
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

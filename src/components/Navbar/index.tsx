import { Button, ButtonProps, Flex } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '~components/Auth/useAuth'
import { ColorModeSwitcher } from '~components/Layout/ColorModeSwitcher'
import { RouterAwareLink } from '~components/RouterAwareLink'
import Logo from '~components/Layout/Logo'
import { Routes } from '~src/router/routes'
import { LanguagesMenu } from './LanguagesList'
import { generatePath } from 'react-router-dom'

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
      <RouterAwareLink to={isAuthenticated ? generatePath(Routes.dashboard.base) : Routes.auth.signIn}>
        {isAuthenticated ? t('menu.dashboard', { defaultValue: 'Dashboard' }) : t('menu.login')}
      </RouterAwareLink>
    </Button>
  )
}
export default Navbar

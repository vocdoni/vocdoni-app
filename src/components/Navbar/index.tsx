import { Button, Flex, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as ReactRouterLink } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { ColorModeSwitcher } from '~components/Layout/ColorModeSwitcher'
import Logo from '~components/Layout/Logo'
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

const DashboardButton = () => {
  const { t } = useTranslation()
  const { isAuthenticated, memberNumber } = useAuth()

  if (memberNumber) {
    return (
      <Text color='texts.default' fontSize='sm' fontWeight='bold' whiteSpace='nowrap'>
        {t('shared_census.member_number_label', { defaultValue: 'Colegiado nº' })} {memberNumber}
      </Text>
    )
  }

  return (
    <Button asChild px={6}>
      <ReactRouterLink to={isAuthenticated ? generatePath(Routes.dashboard.base) : Routes.auth.signIn}>
        {isAuthenticated ? t('menu.dashboard', { defaultValue: 'Dashboard' }) : t('menu.login')}
      </ReactRouterLink>
    </Button>
  )
}
export default Navbar

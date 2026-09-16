import { Button, ButtonProps, Flex } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import { ColorModeSwitcher } from '~components/Layout/ColorModeSwitcher'
import Logo from '~components/Layout/Logo'
import { RouterAwareLink } from '~components/RouterAwareLink'
import type { HeaderOrganizationLogo } from '~src/pages/shared/headerOrganizationLogo'
import { Routes } from '~src/router/routes'
import { LanguagesMenu } from './LanguagesList'

const Navbar = ({
  publicLanguageLinks,
  showDashboardButton = true,
  organizationLogo,
}: {
  publicLanguageLinks?: Record<string, string>
  showDashboardButton?: boolean
  /** Replaces the Vocdoni logo in the header only — the footer always stays Vocdoni. */
  organizationLogo?: HeaderOrganizationLogo
}) => (
  <Flex width='full' py={3} position='relative' justifyContent='space-between' zIndex='topbar' alignItems='center'>
    <Logo organization={organizationLogo} />
    <Flex alignItems='center' gap={2} justifySelf='end'>
      {showDashboardButton && <DashboardButton />}
      <LanguagesMenu publicLanguageLinks={publicLanguageLinks} />
      <ColorModeSwitcher />
    </Flex>
  </Flex>
)

const DashboardButton = (props?: ButtonProps) => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const showAuthenticatedState = mounted && isAuthenticated

  return (
    <Button asChild px={6} {...props}>
      <RouterAwareLink to={showAuthenticatedState ? generatePath(Routes.dashboard.base) : Routes.auth.signIn}>
        {showAuthenticatedState ? t('menu.dashboard', { defaultValue: 'Dashboard' }) : t('menu.login')}
      </RouterAwareLink>
    </Button>
  )
}
export default Navbar

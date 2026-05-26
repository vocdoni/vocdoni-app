import { Button, ButtonProps, Flex, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { ColorModeSwitcher } from '~components/Layout/ColorModeSwitcher'
import Logo from '~components/Layout/Logo'
import { RouterAwareLink } from '~components/RouterAwareLink'
import type { ProcessAuthenticatedLabel } from '~components/Process/authenticatedVoterLabel'
import { Routes } from '~src/router/routes'
import { LanguagesMenu } from './LanguagesList'

const Navbar = ({
  publicLanguageLinks,
  authenticatedLabel,
  hideAuthButton,
}: {
  publicLanguageLinks?: Record<string, string>
  authenticatedLabel?: ProcessAuthenticatedLabel
  hideAuthButton?: boolean
}) => (
  <Flex width='full' py={3} position='relative' justifyContent='space-between' zIndex='topbar' alignItems='center'>
    <Logo />
    <Flex alignItems='center' gap={2} justifySelf='end'>
      {authenticatedLabel ? (
        <AuthenticatedLabel {...authenticatedLabel} />
      ) : !hideAuthButton ? (
        <DashboardButton />
      ) : null}
      <LanguagesMenu publicLanguageLinks={publicLanguageLinks} />
      <ColorModeSwitcher />
    </Flex>
  </Flex>
)

const AuthenticatedLabel = ({ label, value }: ProcessAuthenticatedLabel) => {
  const { t } = useTranslation()

  const displayLabel =
    label === 'email'
      ? t('csp.fields.email', { defaultValue: 'Email' })
      : label === 'phone'
        ? t('csp.fields.phone', { defaultValue: 'Phone' })
        : label

  return (
    <Text fontSize='sm' fontWeight='semibold' whiteSpace='nowrap' overflow='hidden' textOverflow='ellipsis' maxW='40vw'>
      {displayLabel ? `${displayLabel} ${value}` : value}
    </Text>
  )
}

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

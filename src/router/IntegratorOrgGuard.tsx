import { Button, Center, Stack, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { LocalStorageKeys } from '~components/Auth/useAuthProvider'
import { useProfile } from '~src/queries/account'
import { useProvisionIntegratorOrganization } from '~src/queries/integrators'
import { Loading } from '~src/router/SuspenseLoader'
import { Routes } from './routes'

/**
 * Gates the integrators app. A signed-in integrator always has exactly one organization, so the
 * first time we find none (e.g. right after sign-up) we provision one automatically on the free
 * integrator tier — no empty dashboard, no manual create step. Users whose org is not an
 * integrator are sent to the regular dashboard, which they belong to.
 */
const IntegratorOrgGuard = () => {
  const { isAuthenticated, isAuthLoading, signerRefresh } = useAuth()
  const { data: profile, isLoading: isProfileLoading } = useProfile()
  const provision = useProvisionIntegratorOrganization()

  const organizations = profile?.organizations ?? []
  const hasIntegratorOrg = organizations.some((org) => org.organization.isIntegrator)
  // Only provision once we are sure the profile loaded and the user genuinely has no org.
  const needsOrg = !isAuthLoading && !isProfileLoading && isAuthenticated && organizations.length === 0

  useEffect(() => {
    if (needsOrg && provision.isIdle) {
      provision.mutate()
    }
  }, [needsOrg, provision])

  // Point the SDK client/account at the freshly provisioned org so the layout's
  // OrganizationProvider picks it up (mirrors OrganizationSwitcher.handleOrgChange).
  useEffect(() => {
    if (provision.isSuccess && provision.data?.address) {
      localStorage.setItem(LocalStorageKeys.SignerAddress, provision.data.address)
      signerRefresh()
    }
  }, [provision.isSuccess, provision.data, signerRefresh])

  if (isAuthLoading || isProfileLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to={Routes.integrators.signIn} replace />
  }

  // Already an integrator: render the app.
  if (hasIntegratorOrg) {
    return <Outlet context={undefined} />
  }

  // Has an organization, but it is not an integrator: this user belongs to the regular dashboard.
  if (organizations.length > 0) {
    return <Navigate to={Routes.dashboard.base} replace />
  }

  if (provision.isError) {
    return (
      <Center py={16}>
        <Stack align='center' gap={3}>
          <Text fontSize='sm' color='gray.500'>
            <Trans i18nKey='integrators.provision_failed'>We couldn't set up your organization.</Trans>
          </Text>
          <Button onClick={() => provision.reset()}>
            <Trans i18nKey='common.retry'>Try again</Trans>
          </Button>
        </Stack>
      </Center>
    )
  }

  // No organization yet: provisioning one in the background.
  return <ProvisioningState />
}

const ProvisioningState = () => {
  const { t } = useTranslation()
  return (
    <Center py={16}>
      <Stack align='center' gap={3}>
        <Loading minHeight={1} />
        <Text fontSize='sm' color='gray.500'>
          {t('integrators.setting_up_org', { defaultValue: 'Setting up your organization…' })}
        </Text>
      </Stack>
    </Center>
  )
}

export default IntegratorOrgGuard

import { Button, Center, Stack, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Navigate, Outlet } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import { LocalStorageKeys } from '~components/Auth/useAuthProvider'
import { useProfile } from '~src/queries/account'
import NotIntegratorNotice from '~components/Integrator/NotIntegratorNotice'
import { useProvisionIntegratorOrganization } from '~src/queries/integrators'
import { Loading } from '~src/router/SuspenseLoader'
import { isSelectedOrganizationIntegrator } from './privateAppRouting'
import { Routes } from './routes'

/**
 * Gates the integrators app based on the *currently selected* organization (the one pointed at by
 * signerAddress), mirroring OrganizationTypeGuard on /admin. A user can own both integrator and
 * regular organizations, so "owns any integrator org" is not enough — routing must follow the
 * active selection, otherwise a non-integrator org selected while the user happens to also own an
 * integrator one would still be trapped in /integrators.
 *
 * When the user has no organization at all (e.g. right after sign-up) we provision one
 * automatically on the free integrator tier — no empty dashboard, no manual create step.
 */
const IntegratorOrgGuard = () => {
  const { isAuthenticated, isAuthLoading, refreshAddresses } = useAuth()
  const { data: profile, isLoading: isProfileLoading } = useProfile()
  const provision = useProvisionIntegratorOrganization()

  const organizations = profile?.organizations ?? []
  const selectedAddress = localStorage.getItem(LocalStorageKeys.SignerAddress) ?? ''
  const selectedIsIntegrator = isSelectedOrganizationIntegrator(profile ?? null, selectedAddress)
  // Only provision once we are sure the profile loaded and the user genuinely has no org.
  const needsOrg = !isAuthLoading && !isProfileLoading && isAuthenticated && organizations.length === 0

  useEffect(() => {
    if (needsOrg && provision.isIdle) {
      provision.mutate()
    }
  }, [needsOrg, provision])

  // Point the session at the freshly provisioned org so the layout's OrganizationProvider
  // picks it up (mirrors OrganizationSwitcher.handleOrgChange).
  useEffect(() => {
    if (provision.isSuccess && provision.data?.address) {
      localStorage.setItem(LocalStorageKeys.SignerAddress, provision.data.address)
      refreshAddresses()
    }
  }, [provision.isSuccess, provision.data, refreshAddresses])

  if (isAuthLoading || isProfileLoading) {
    return <Loading />
  }

  if (!isAuthenticated) {
    return <Navigate to={Routes.integrators.signIn} replace />
  }

  // The user already has organizations: route based on the selected one.
  if (organizations.length > 0) {
    // Selected org is an integrator: render the app.
    if (selectedIsIntegrator) {
      return <Outlet context={undefined} />
    }
    // Selected org is not an integrator: render the dashboard shell with a notice offering to
    // create a free integrator org (or switch orgs), instead of bouncing the user to /admin.
    return <NotIntegratorNotice />
  }

  if (provision.isError) {
    return (
      <Center py={16}>
        <Stack align='center' gap={3}>
          <Text fontSize='sm' color='gray.500'>
            <Trans i18nKey='integrators.provision_failed'>We couldn't set up your integrator account.</Trans>
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
          {t('integrators.setting_up_account', { defaultValue: 'Setting up your integrator account…' })}
        </Text>
      </Stack>
    </Center>
  )
}

export default IntegratorOrgGuard

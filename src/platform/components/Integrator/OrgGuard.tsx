import { Alert, Button, Center, Spinner, Stack, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { getApiErrorMessage } from '~platform/api/client'
import { useOrg } from '~platform/auth/OrgContext'
import { useIntegratorInfo } from '~platform/queries/integrator'
import { useCreateOrganization } from '~platform/queries/organization'
import { UpgradePlansButton } from './UpgradeDialog'

/**
 * Gates the dashboard content. A signed-in integrator always has an organization, so the first
 * time we find none (e.g. right after sign-up) we provision one automatically on the free
 * integrator tier with type "others" — no empty dashboard, no manual create step. All other org
 * fields are optional and can be edited later in Configuration. The surrounding layout (sidebar,
 * org switcher, logout) stays available throughout.
 */
const OrgGuard = () => {
  const { selectedAddress, candidates, isLoading: orgLoading } = useOrg()
  const { data, isLoading: infoLoading } = useIntegratorInfo()
  const create = useCreateOrganization()

  const needsOrg = !orgLoading && (!candidates.length || !selectedAddress)

  useEffect(() => {
    if (needsOrg && create.isIdle) {
      create.mutate({ type: 'others' })
    }
  }, [needsOrg, create])

  if (create.isError) {
    return (
      <Stack gap={4} align='flex-start'>
        <Alert.Root status='error'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Couldn't set up your organization</Alert.Title>
            <Alert.Description>{getApiErrorMessage(create.error)}</Alert.Description>
          </Alert.Content>
        </Alert.Root>
        <Button onClick={() => create.reset()}>Try again</Button>
      </Stack>
    )
  }

  // Provisioning an organization for a brand-new account (none found yet). This is the only state
  // that shows the "setting up" copy — a returning user who already has an org never lands here, so
  // it doesn't flash on every reload.
  if (needsOrg || create.isPending) {
    return (
      <Center py={16}>
        <Stack align='center' gap={3}>
          <Spinner />
          <Text fontSize='sm' color='fg.muted'>
            Setting up your organization…
          </Text>
        </Stack>
      </Center>
    )
  }

  // Normal initial load (profile + integrator info): a plain spinner, no provisioning copy.
  if (orgLoading || infoLoading) {
    return (
      <Center py={16}>
        <Spinner />
      </Center>
    )
  }

  if (!data?.enabled) {
    return (
      <Stack gap={4} align='flex-start'>
        <Alert.Root status='warning'>
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Title>Not an integrator yet</Alert.Title>
            <Alert.Description>
              This organization isn't on an integrator plan. Subscribe to a plan that includes managed organizations to
              unlock the integrator dashboard — no manual approval needed. If you administer another organization, you
              can switch to it from the sidebar.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
        <UpgradePlansButton label='Choose an integrator plan' />
      </Stack>
    )
  }

  return <Outlet />
}

export default OrgGuard

import { Alert, Button, Flex, Icon, Stack, TagLabel, TagRoot, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuSquareStack } from 'react-icons/lu'
import { getApiErrorMessage } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { LocalStorageKeys } from '~components/Auth/useAuthProvider'
import { useOrganizationNames } from '~components/Dashboard/Menu/useOrganizationNames'
import { useSelectOrganization } from '~components/Dashboard/Menu/useSelectOrganization'
import DeleteModal from '~components/Modal/DeleteModal'
import { useToast } from '~components/Toast'
import { useProfile } from '~src/queries/account'
import { useProvisionIntegratorOrganization } from '~src/queries/integrators'

/**
 * Shown in the integrator dashboard content area (in place of the pages, via IntegratorOrgGuard's
 * Outlet) when the selected organization is not an integrator. Instead of bouncing the user to
 * /admin, we explain the situation and let them create a free integrator organization in one click,
 * or — if they own more than one org — switch to a different one as a last chance before creating.
 */
const NotIntegratorNotice = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const { data: profile } = useProfile()
  const { signerRefresh } = useAuth()
  const provision = useProvisionIntegratorOrganization()
  const selectOrganization = useSelectOrganization()
  const [open, setOpen] = useState(false)

  // Hide managed orgs from the "switch instead" list for the same reason as the org switcher:
  // they belong to the integrator's managed set, not the user's own orgs.
  const organizations = (profile?.organizations ?? []).filter(({ organization }) => !organization.managedBy)
  const hasMultipleOrgs = organizations.length > 1
  const { data: names = {} } = useOrganizationNames(organizations.map(({ organization }) => organization.address))

  const onCreate = async () => {
    try {
      const { address } = await provision.mutateAsync()
      // Point the SDK client/account at the freshly provisioned org so the guard re-evaluates and
      // renders the real dashboard (mirrors IntegratorOrgGuard's post-provision effect).
      localStorage.setItem(LocalStorageKeys.SignerAddress, address)
      await signerRefresh()
      setOpen(false)
    } catch (err) {
      toast({
        type: 'error',
        title: t('integrators.create_org.error', { defaultValue: 'Could not create the organization' }),
        description: getApiErrorMessage(err),
      })
    }
  }

  return (
    <Stack gap={5} p={{ base: 4, md: 6 }} align='flex-start'>
      <Alert.Root status='info' w='full'>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>
            {t('integrators.not_integrator.title', { defaultValue: "This organization isn't an integrator yet" })}
          </Alert.Title>
          <Alert.Description>
            {t('integrators.not_integrator.description', {
              defaultValue:
                'The selected organization is not an integrator. Create a free integrator organization to unlock this dashboard — no manual approval needed.',
            })}
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>

      <Button onClick={() => setOpen(true)}>
        {t('integrators.not_integrator.cta', { defaultValue: 'Create a free integrator organization' })}
      </Button>

      <DeleteModal
        title={t('integrators.create_org.title', { defaultValue: 'Create a free integrator organization?' })}
        subtitle={t('integrators.create_org.description', {
          defaultValue:
            'A new organization on the free integrator plan will be created on your account and set as your active organization.',
        })}
        open={open}
        onOpenChange={({ open }) => setOpen(open)}
      >
        {hasMultipleOrgs && (
          <Stack gap={2} mt={4}>
            <Text fontSize='sm' fontWeight={600}>
              {t('integrators.create_org.switch_instead', { defaultValue: 'Or switch to an existing organization' })}
            </Text>
            <Stack gap={1} maxH='160px' overflowY='auto'>
              {organizations.map(({ organization, isIntegrator }) => (
                <Button
                  key={organization.address}
                  variant='outline'
                  justifyContent='flex-start'
                  gap={2}
                  onClick={() => selectOrganization(organization, isIntegrator)}
                >
                  <Icon as={LuSquareStack} />
                  <Text as='span' fontSize='sm' truncate>
                    {names[organization.address] || organization.address}
                  </Text>
                  {isIntegrator && (
                    <TagRoot colorPalette='purple' ml='auto !important'>
                      {/* "API" is a universal acronym, not translated in any locale */}
                      <TagLabel>API</TagLabel>
                    </TagRoot>
                  )}
                </Button>
              ))}
            </Stack>
          </Stack>
        )}

        <Flex justifyContent='flex-end' mt={4} gap={2}>
          <Button variant='outline' onClick={() => setOpen(false)}>
            {t('integrators.create_org.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button loading={provision.isPending} onClick={onCreate}>
            {t('integrators.create_org.confirm', { defaultValue: 'Create organization' })}
          </Button>
        </Flex>
      </DeleteModal>
    </Stack>
  )
}

export default NotIntegratorNotice

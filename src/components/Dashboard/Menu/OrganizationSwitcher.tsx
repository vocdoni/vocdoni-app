import {
  Button,
  Flex,
  HStack,
  Icon,
  PopoverBody,
  PopoverFooter,
  Stack,
  TagLabel,
  TagRoot,
  Text,
} from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { AddIcon, OrganizationIcon } from '~theme/icons'
import { Link as ReactRouterLink } from 'react-router'
import { LocalStorageKeys } from '~components/Auth/useAuthProvider'
import { Routes } from '~routes'
import { Organization, useProfile } from '~src/queries/account'
import { useOrganizationNames } from './useOrganizationNames'
import { useSelectOrganization } from './useSelectOrganization'

type SelectOption = {
  value: string
  label: string
  isIntegrator?: boolean
  organization: Organization
}

export const OrganizationSwitcher = () => {
  const { t } = useTranslation()
  const { data: profile } = useProfile()
  const [selectedOrg, setSelectedOrg] = useState<string | null>(localStorage.getItem(LocalStorageKeys.SignerAddress))
  const selectOrganization = useSelectOrganization()

  const addresses = useMemo(() => profile?.organizations?.map((org) => org.organization.address) || [], [profile])

  const { data: names = {} } = useOrganizationNames(addresses)

  // Populate organizations for the selector. Managed orgs (created through the integrator portal)
  // are hidden here: they belong to the integrator's managed set, not the user's own orgs, and are
  // reached from the Managed organizations page instead. `managedBy` is only sent by the backend for
  // managed orgs, so this is a no-op against older backends that omit the field.
  const organizations = useMemo(() => {
    if (!profile?.organizations) return []
    return profile.organizations
      .filter((org) => !org.organization.managedBy)
      .map((org) => ({
        value: org.organization.address,
        label: names[org.organization.address] || org.organization.address,
        isIntegrator: org.isIntegrator,
        organization: org.organization,
      }))
  }, [profile, names])

  // Set first organization as default if none selected
  useEffect(() => {
    if (organizations.length && !selectedOrg) {
      const firstOrgAddress = organizations[0].value
      setSelectedOrg(firstOrgAddress)
      localStorage.setItem(LocalStorageKeys.SignerAddress, firstOrgAddress)
    }
  }, [organizations, selectedOrg])

  // Sync selected organization with localStorage when profile changes
  useEffect(() => {
    if (!profile?.organizations) return

    const storedAddress = localStorage.getItem(LocalStorageKeys.SignerAddress)
    if (storedAddress !== selectedOrg) {
      setSelectedOrg(storedAddress)
    }
  }, [profile])

  const handleOrgChange = async (option: SelectOption | null) => {
    if (!option) return
    setSelectedOrg(option.value)
    await selectOrganization(option.organization, option.isIntegrator)
  }

  const numOrgs = organizations.length

  // Hide the "add new organization" action while operating in an integrator org: integrators manage a
  // single org and create client orgs through the portal, not this switcher. Derived from the selected
  // membership so we don't need to thread a prop down through the layout into the shared switcher.
  const selectedIsIntegrator = useMemo(
    () => profile?.organizations?.some((org) => org.organization.address === selectedOrg && org.isIntegrator) ?? false,
    [profile, selectedOrg]
  )

  return (
    <>
      <PopoverBody minH={'unset'}>
        <Text textStyle='caption' fontWeight='bold' px={1.5} py={2}>
          <Trans i18nKey='organizations' values={{ numOrgs }}>
            Organizations ({{ numOrgs }})
          </Trans>
        </Text>
        <Flex flexDirection={'column'} maxH={'130px'} overflowY={'scroll'}>
          {organizations.map((org, idx) => (
            <Button key={idx} onClick={() => handleOrgChange(org)} variant='menu-item-strong'>
              <Stack direction='row' w='full' align='center'>
                <Icon
                  as={OrganizationIcon}
                  border='1px solid'
                  borderColor='border'
                  borderRadius='xs'
                  p={1}
                  boxSize='icon.lg'
                  flexShrink={0}
                />
                <Text as='span' textStyle='body-sm' flex='1' minW={0} textAlign='start' truncate>
                  {org.label}
                </Text>
                <HStack gap={1} flexShrink={0}>
                  {org.isIntegrator && (
                    <TagRoot>
                      {/* "API" is a universal acronym, not translated in any locale */}
                      <TagLabel>API</TagLabel>
                    </TagRoot>
                  )}
                  {org.value === selectedOrg && (
                    <TagRoot colorPalette='gray'>
                      <TagLabel>{t('current', { defaultValue: 'Current' })}</TagLabel>
                    </TagRoot>
                  )}
                </HStack>
              </Stack>
            </Button>
          ))}
        </Flex>
      </PopoverBody>
      {!selectedIsIntegrator && (
        <PopoverFooter minH={'unset'}>
          <Button asChild aria-label={t('create_org.title')} variant='menu-item' mt={1}>
            <ReactRouterLink to={Routes.dashboard.organizationCreate}>
              <Flex
                justifyContent={'center'}
                alignItems={'center'}
                border='1px solid'
                borderColor='border'
                w='22px'
                h='22px'
                borderRadius='xs'
              >
                <Icon as={AddIcon} boxSize='icon.sm' ml={2} mr={2} />
              </Flex>
              <Text as={'span'} h='unset' fontWeight={'bold'} textStyle='body-sm'>
                {t('add_new_org', { defaultValue: 'Add a new organization' })}
              </Text>
            </ReactRouterLink>
          </Button>
        </PopoverFooter>
      )}
    </>
  )
}

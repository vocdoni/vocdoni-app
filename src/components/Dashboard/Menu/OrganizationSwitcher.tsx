import { Button, Flex, Icon, PopoverBody, PopoverFooter, Stack, TagLabel, TagRoot, Text } from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useClient } from '@vocdoni/react-components'
import { useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LuPlus, LuSquareStack } from 'react-icons/lu'
import { Link as ReactRouterLink } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { LocalStorageKeys } from '~components/Auth/useAuthProvider'
import { Routes } from '~routes'
import { Organization, useProfile } from '~src/queries/account'
import { QueryKeys } from '~src/queries/keys'

type SelectOption = {
  value: string
  label: string
  organization: Organization
}

export const OrganizationSwitcher = () => {
  const { t } = useTranslation()
  const { data: profile } = useProfile()
  const [selectedOrg, setSelectedOrg] = useState<string | null>(localStorage.getItem(LocalStorageKeys.SignerAddress))
  const { signerRefresh } = useAuth()
  const queryClient = useQueryClient()
  const { client } = useClient()

  const addresses = useMemo(() => profile?.organizations?.map((org) => org.organization.address) || [], [profile])

  const { data: names = {} } = useQuery({
    queryKey: QueryKeys.organization.names,
    queryFn: async () => {
      const names: Record<string, string> = {}
      for (const address of addresses) {
        try {
          const data = await client.fetchAccountInfo(address)
          names[address] = data?.account?.name?.default || address
        } catch (error) {
          console.error('Error fetching organization name:', error)
          names[address] = address
        }
      }
      return names
    },
    enabled: addresses.length > 0,
  })

  // Populate organizations for the selector
  const organizations = useMemo(() => {
    if (!profile?.organizations) return []
    return profile.organizations.map((org) => ({
      value: org.organization.address,
      label: names[org.organization.address] || org.organization.address,
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
    localStorage.setItem(LocalStorageKeys.SignerAddress, option.value)
    // clear all query client query cache
    queryClient.clear()
    // refresh signer
    await signerRefresh()
  }

  const numOrgs = organizations.length

  return (
    <>
      <PopoverBody minH={'unset'}>
        <Text fontSize='xs' fontWeight={600} px={1.5} py={2}>
          <Trans i18nKey='organizations' values={{ numOrgs }}>
            Organizations ({numOrgs})
          </Trans>
        </Text>
        <Flex flexDirection={'column'} maxH={'130px'} overflowY={'scroll'}>
          {organizations.map((org, idx) => (
            <Button key={idx} onClick={() => handleOrgChange(org)} variant='profilemenu' py={5}>
              <Stack direction='row' w='full'>
                <Icon
                  as={LuSquareStack}
                  border='1px solid'
                  borderColor='table.border'
                  borderRadius='xs'
                  p={1}
                  boxSize={6}
                />
                <Text as='span' fontSize='sm'>
                  {org.label}
                </Text>
                {org.value === selectedOrg && (
                  <TagRoot colorPalette='gray' ml='auto !important'>
                    <TagLabel>{t('current', { defaultValue: 'Current' })}</TagLabel>
                  </TagRoot>
                )}
              </Stack>
            </Button>
          ))}
        </Flex>
      </PopoverBody>
      <PopoverFooter minH={'unset'}>
        <Button
          asChild
          aria-label={t('create_org.title')}
          justifyContent={'start'}
          gap={2}
          variant='listmenu'
          w='full'
          px={2}
          py={1.5}
          h={'unset'}
          borderRadius={'xs'}
          mt={1}
          css={{ '& span:nth-of-type(2)': { marginLeft: 'auto' } }}
        >
          <ReactRouterLink to={Routes.dashboard.organizationCreate}>
            <Flex
              justifyContent={'center'}
              alignItems={'center'}
              border='1px solid'
              borderColor='table.border'
              w='22px'
              h='22px'
              borderRadius='xs'
            >
              <Icon as={LuPlus} boxSize={4} ml={2} mr={2} />
            </Flex>
            <Text as={'span'} h='unset' fontWeight={'bold'} fontSize='sm'>
              {t('add_new_org', { defaultValue: 'Add a new organization' })}
            </Text>
          </ReactRouterLink>
        </Button>
      </PopoverFooter>
    </>
  )
}

import { Box, Button, Flex, Icon, NativeSelect, Stack, Text } from '@chakra-ui/react'
import { LuBuilding2, LuGauge, LuKey, LuLogOut, LuSettings } from 'react-icons/lu'
import { NavLink, Outlet } from 'react-router-dom'
import { VocdoniLogo } from '~components/Layout/Logo'
import { useAuth } from '~platform/auth/AuthContext'
import { useOrg } from '~platform/auth/OrgContext'
import { useProfile } from '~platform/queries/profile'
import { Routes } from '~platform/routes'

const navItems = [
  { label: 'Overview', icon: LuGauge, to: Routes.dashboard.overview, end: true },
  { label: 'Managed organizations', icon: LuBuilding2, to: Routes.dashboard.organizations, end: false },
  { label: 'API Keys', icon: LuKey, to: Routes.dashboard.apiKeys, end: false },
  { label: 'Configuration', icon: LuSettings, to: Routes.dashboard.configuration, end: false },
]

const OrgSwitcher = () => {
  const { candidates, selectedAddress, setSelectedAddress } = useOrg()
  if (candidates.length <= 1) return null

  return (
    <NativeSelect.Root size='sm'>
      <NativeSelect.Field
        value={selectedAddress}
        onChange={(e) => setSelectedAddress(e.currentTarget.value)}
        aria-label='Select organization'
      >
        {candidates.map(({ organization }) => (
          <option key={organization.address} value={organization.address}>
            {organization.subdomain || organization.address.slice(0, 10)}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  )
}

const Sidebar = () => {
  const { logout } = useAuth()
  const { data: profile } = useProfile()

  return (
    <Flex
      direction='column'
      w='260px'
      flexShrink={0}
      borderRightWidth='1px'
      bg='bg.subtle'
      p={4}
      gap={6}
      position='sticky'
      top={0}
      h='100dvh'
    >
      <VocdoniLogo w='150px' h='auto' />

      <OrgSwitcher />

      <Stack as='nav' gap={1} flex='1'>
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            {({ isActive }) => (
              <Flex
                align='center'
                gap={3}
                px={3}
                py={2}
                borderRadius='md'
                fontSize='sm'
                fontWeight='medium'
                bg={isActive ? 'bg.emphasized' : undefined}
                color={isActive ? 'fg' : 'fg.muted'}
                _hover={{ bg: 'bg.emphasized' }}
              >
                <Icon as={item.icon} />
                {item.label}
              </Flex>
            )}
          </NavLink>
        ))}
      </Stack>

      <Stack gap={2}>
        {profile && (
          <Text fontSize='xs' color='fg.muted' truncate>
            {profile.email}
          </Text>
        )}
        <Button variant='outline' size='sm' onClick={logout}>
          <Icon as={LuLogOut} />
          Sign out
        </Button>
      </Stack>
    </Flex>
  )
}

const DashboardLayout = () => (
  <Flex minH='100dvh'>
    <Sidebar />
    <Box flex='1' p={{ base: 4, md: 8 }} maxW='6xl' mx='auto' w='full'>
      <Outlet />
    </Box>
  </Flex>
)

export default DashboardLayout

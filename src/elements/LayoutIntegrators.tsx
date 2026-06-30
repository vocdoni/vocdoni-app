import { Button, Flex, Icon, IconButton, Popover, Text, useBreakpointValue, useDisclosure } from '@chakra-ui/react'
import { OrganizationProvider, useClient } from '@vocdoni/react-components'
import React, { createContext, PropsWithChildren, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { LuBuilding, LuChevronsUpDown, LuLogOut, LuPanelLeft } from 'react-icons/lu'
import { Trans, useTranslation } from 'react-i18next'
import AnnouncementBanner from '~components/Layout/AnnouncementBanner'
import { PricingModalProvider } from '~components/Pricing/PricingModalProvider'
import { LocalStorageKeys } from '~constants'
import { useAuth } from '~components/Auth/useAuth'
import { OrganizationSwitcher } from '~components/Dashboard/Menu/OrganizationSwitcher'

export type IntegratorsOutletContext = {
  reduced: boolean
}

export const IntegratorsLayoutContext = createContext<IntegratorsOutletContext | undefined>(undefined)

const LayoutIntegrators: React.FC = () => {
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [reduced, setReduced] = React.useState(false)
  const { isAuthenticated, logout } = useAuth()
  const { t } = useTranslation()

  // Close the mobile drawer when the screen size changes
  useEffect(() => {
    if (!isMobile) onClose()
  }, [isMobile])

  return (
    <IntegratorsLayoutContext.Provider value={{ reduced: reduced && !isMobile }}>
      <IntegratorsLayoutProviders>
        <Flex minH='100svh' w='full' _dark={{ bg: 'brand.650' }} maxW='max-window-width' margin='0 auto'>
          {/* Sidebar for large screens */}
          {/* TODO: Add IntegratorsMenu component if different from DashboardMenu */}
          <Flex flex='1 1 0' flexDirection='column' minW={0}>
            <AnnouncementBanner />
            <Flex alignItems='center' px={4} pt={3} pb={2} display={{ base: 'flex', md: 'none' }} gap={2}>
              <IconButton aria-label='menu.open' colorPalette='gray' variant='subtle' size='xs' onClick={onOpen}>
                <LuPanelLeft />
              </IconButton>
            </Flex>
            {/* Minimal authenticated header */}
            <Flex
              alignItems='center'
              gap={2}
              px={4}
              py={2}
              borderBottom='1px solid'
              borderColor='table.border'
              bg='white'
              _dark={{ bg: 'brand.700' }}
            >
              {/* OrganizationSwitcher only renders the popover body/footer, so it must live inside a Popover.Root */}
              <Popover.Root positioning={{ placement: 'bottom-start' }}>
                <Popover.Trigger asChild>
                  <Button variant='subtle' colorPalette='gray' size='sm' gap={2} mr='auto'>
                    <Icon as={LuBuilding} />
                    <Trans i18nKey='switch_organization' />
                    <Icon as={LuChevronsUpDown} />
                  </Button>
                </Popover.Trigger>
                <Popover.Positioner>
                  <Popover.Content w='user-profile'>
                    <OrganizationSwitcher />
                  </Popover.Content>
                </Popover.Positioner>
              </Popover.Root>
              <IconButton
                aria-label={t('logout')}
                variant='ghost'
                size='sm'
                onClick={logout}
                title={t('logout')}
              >
                <LuLogOut />
              </IconButton>
            </Flex>
            <Outlet context={{ reduced: reduced && !isMobile } satisfies IntegratorsOutletContext} />
          </Flex>
        </Flex>
      </IntegratorsLayoutProviders>
    </IntegratorsLayoutContext.Provider>
  )
}

const IntegratorsLayoutProviders = (props: PropsWithChildren) => {
  const { account } = useClient()
  return (
    <OrganizationProvider organization={account}>
      <PricingModalProvider {...props} />
    </OrganizationProvider>
  )
}

export default LayoutIntegrators

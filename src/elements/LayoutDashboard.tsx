import { Flex, IconButton, useBreakpointValue, useDisclosure } from '@chakra-ui/react'
import { useLocalStorage } from '@uidotdev/usehooks'
import { OrganizationProvider, useClient } from '@vocdoni/react-providers'
import React, { createContext, PropsWithChildren, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LuPanelLeft } from 'react-icons/lu'
import { Outlet } from 'react-router-dom'
import DashboardMenu from '~components/Dashboard/Menu'
import AnnouncementBanner from '~components/Layout/AnnouncementBanner'
import { PricingModalProvider } from '~components/Pricing/PricingModalProvider'
import { LocalStorageKeys, MaxWindowWidth } from '~constants'

export type DashboardLayoutContextType = {
  reduced: boolean
}

export const DashboardLayoutContext = createContext<DashboardLayoutContextType | undefined>(undefined)

const LayoutDashboard: React.FC = () => {
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [reduced, setReduced] = useLocalStorage(LocalStorageKeys.DashboardMenuReduced, false)
  const { t } = useTranslation()

  // Close the mobile drawer when the screen size changes
  useEffect(() => {
    if (!isMobile) onClose()
  }, [isMobile])

  return (
    <DashboardLayoutContext.Provider value={{ reduced: reduced && !isMobile }}>
      <DashboardLayoutProviders>
        <Flex minH='100svh' w='full' _dark={{ bg: 'brand.650' }} maxW={MaxWindowWidth} margin='0 auto'>
          {/* Sidebar for large screens */}
          <DashboardMenu isOpen={isOpen} onClose={onClose} onToggleReduced={() => setReduced((prev) => !prev)} />

          <Flex flex='1 1 0' flexDirection='column' minW={0}>
            <AnnouncementBanner />
            <Flex alignItems='center' px={4} pt={3} pb={2} display={{ base: 'flex', md: 'none' }} gap={2}>
              <IconButton aria-label={t('menu.open')} colorPalette='gray' variant='subtle' size='xs' onClick={onOpen}>
                <LuPanelLeft />
              </IconButton>
            </Flex>
            <Outlet />
          </Flex>
        </Flex>
      </DashboardLayoutProviders>
    </DashboardLayoutContext.Provider>
  )
}

const DashboardLayoutProviders = (props: PropsWithChildren) => {
  const { account } = useClient()
  return (
    <OrganizationProvider organization={account}>
      <PricingModalProvider {...props} />
    </OrganizationProvider>
  )
}

export default LayoutDashboard

import { Flex, IconButton, useBreakpointValue, useDisclosure } from '@chakra-ui/react'
import { useLocalStorage } from '@uidotdev/usehooks'
import { OrganizationProvider, useClient } from '@vocdoni/react-components'
import React, { PropsWithChildren, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { LuPanelLeft } from 'react-icons/lu'
import { Outlet } from 'react-router-dom'
import DashboardMenu from '~components/Dashboard/Menu'
import { DashboardMenuConfig } from '~components/Dashboard/Menu/menus'
import AnnouncementBanner from '~components/Layout/AnnouncementBanner'
import { PricingModalProvider } from '~components/Pricing/PricingModalProvider'
import { LocalStorageKeys } from '~constants'
import { DashboardLayoutContext, DashboardOutletContext } from '~elements/DashboardLayoutContext'

/**
 * Shared dashboard layout (sidebar + user menu + content) used by both the admin and integrator
 * apps. The only difference between the two is the `menu` config passed in.
 */
const DashboardShell: React.FC<{ menu: DashboardMenuConfig }> = ({ menu }) => {
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const [reduced, setReduced] = useLocalStorage(LocalStorageKeys.DashboardMenuReduced, false)
  const { t } = useTranslation()

  // Close the mobile drawer when the screen size changes
  useEffect(() => {
    if (!isMobile) onClose()
  }, [isMobile])

  const reducedValue = reduced && !isMobile

  return (
    <DashboardLayoutContext.Provider value={{ reduced: reducedValue }}>
      <DashboardLayoutProviders>
        <Flex minH='100svh' w='full' bg='dashboard.menu' maxW='max-window-width' margin='0 auto'>
          {/* Sidebar for large screens */}
          <DashboardMenu
            isOpen={isOpen}
            onClose={onClose}
            onToggleReduced={() => setReduced((prev) => !prev)}
            menu={menu}
          />

          {/* Inset content panel: floats on the sidebar background with its own border and radius */}
          <Flex
            flex='1 1 0'
            flexDirection='column'
            minW={0}
            m={{ base: 1.5, md: 2 }}
            ml={{ base: 1.5, md: 0 }}
            bg='chakra.body.bg'
            borderRadius='2xl'
            border='1px solid'
            borderColor='table.border'
            boxShadow='var(--box-shadow)'
          >
            <AnnouncementBanner />
            <Flex alignItems='center' px={4} pt={3} pb={2} display={{ base: 'flex', md: 'none' }} gap={2}>
              <IconButton aria-label={t('menu.open')} colorPalette='gray' variant='subtle' size='xs' onClick={onOpen}>
                <LuPanelLeft />
              </IconButton>
            </Flex>
            <Outlet context={{ reduced: reducedValue } satisfies DashboardOutletContext} />
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

export default DashboardShell

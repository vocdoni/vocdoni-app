import { Flex, IconButton, useBreakpointValue, useDisclosure } from '@chakra-ui/react'
import { useLocalStorage } from '@uidotdev/usehooks'
import { OrganizationProvider, useClient } from '@vocdoni/react-components'
import React, { PropsWithChildren, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LuPanelLeft } from 'react-icons/lu'
import { Outlet, useLocation } from 'react-router-dom'
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
  const [headerActionsNode, setHeaderActionsNode] = useState<HTMLDivElement | null>(null)
  const { t } = useTranslation()
  const { pathname } = useLocation()

  // Close the mobile drawer when the screen size changes
  useEffect(() => {
    if (!isMobile) onClose()
  }, [isMobile])

  // Close the mobile drawer after navigating to another section
  useEffect(() => {
    onClose()
  }, [pathname])

  const reducedValue = reduced && !isMobile

  return (
    <DashboardLayoutContext.Provider value={{ reduced: reducedValue, headerActionsNode }}>
      <DashboardLayoutProviders>
        <Flex minH='100svh' w='full' bg='bg' maxW='max-window-width' margin='0 auto'>
          {/* Sidebar for large screens */}
          <DashboardMenu
            isOpen={isOpen}
            onClose={onClose}
            onToggleReduced={() => setReduced((prev) => !prev)}
            menu={menu}
          />

          <Flex flex='1 1 0' flexDirection='column' minW={0}>
            <AnnouncementBanner />
            <Flex
              alignItems='center'
              justifyContent='space-between'
              px={4}
              pt={3}
              pb={2}
              display={{ base: 'flex', md: 'none' }}
              gap={2}
            >
              <IconButton aria-label={t('menu.open')} colorPalette='gray' variant='subtle' size='xs' onClick={onOpen}>
                <LuPanelLeft />
              </IconButton>
              {/* Slot for a page's top-right action (e.g. the integrator "Upgrade plan" button),
                  portaled here so it aligns with the sidebar toggle on mobile. */}
              <Flex ref={setHeaderActionsNode} alignItems='center' gap={2} />
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

import { Flex, useDisclosure } from '@chakra-ui/react'
import { useLocalStorage } from '@uidotdev/usehooks'
import { OrganizationProvider } from '@vocdoni/react-components'
import React, { PropsWithChildren, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { useAuth } from '~components/Auth/useAuth'
import DashboardMenu from '~components/Dashboard/Menu'
import { OrganizationGate } from '~components/Organization/OrganizationGate'
import { DashboardMenuConfig } from '~components/Dashboard/Menu/menus'
import { DashboardTopBar } from '~components/Dashboard/TopBar'
import AnnouncementBanner from '~components/Layout/AnnouncementBanner'
import SupportChat from '~components/SupportChat'
import { LocalStorageKeys } from '~constants'
import { DashboardLayoutContext, DashboardOutletContext } from '~elements/DashboardLayoutContext'
import { useIsDesktop } from '~components/ui/useIsMobile'

/**
 * Shared dashboard layout used by both the admin and integrator apps: from `lg` a fixed sidebar, below it a top bar
 * whose button opens the same navigation in a drawer. The only difference between the two apps is the `menu` config.
 */
const DashboardShell: React.FC<{ menu: DashboardMenuConfig }> = ({ menu }) => {
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const isDesktop = useIsDesktop()
  const [reduced, setReduced] = useLocalStorage(LocalStorageKeys.DashboardMenuReduced, false)
  const { pathname } = useLocation()

  // Close the navigation drawer once the sidebar takes over
  useEffect(() => {
    if (isDesktop) {
      onClose()
    }
  }, [isDesktop])

  // Close the navigation drawer after navigating to another section
  useEffect(() => {
    onClose()
  }, [pathname])

  // Only the sidebar collapses: the drawer always shows the full menu
  const reducedValue = reduced && isDesktop

  return (
    <DashboardLayoutContext.Provider value={{ reduced: reducedValue }}>
      <DashboardLayoutProviders>
        <Flex minH='dvh' w='full' bg='surface.canvas'>
          {/* The sidebar from `lg`, and the drawer below it */}
          <DashboardMenu
            isOpen={isOpen}
            onClose={onClose}
            onToggleReduced={() => setReduced((prev) => !prev)}
            menu={menu}
          />

          <Flex flex='1 1 0' flexDirection='column' minW='0'>
            <DashboardTopBar isMenuOpen={isOpen} onOpenMenu={onOpen} />
            <AnnouncementBanner />
            <OrganizationGate>
              <Outlet context={{ reduced: reducedValue } satisfies DashboardOutletContext} />
            </OrganizationGate>
          </Flex>
          <SupportChat />
        </Flex>
      </DashboardLayoutProviders>
    </DashboardLayoutContext.Provider>
  )
}

const DashboardLayoutProviders = (props: PropsWithChildren) => {
  const { currentAddress } = useAuth()
  return (
    // Only the id: useSaasAccount()'s organization is the app's `.account`-nested adapter
    // shape, not a v2 Organization, so it must not seed the provider cache.
    //
    // The id is the session address rather than useSaasAccount()'s (which prefers the
    // API-reported one): both this provider and useSaasOrganization key their query by
    // address, so feeding them the same value is what keeps them on a single cache entry
    // even when the API echoes the address back in a different case.
    <OrganizationProvider id={currentAddress}>{props.children}</OrganizationProvider>
  )
}

export default DashboardShell

import { Box, Button, Flex, HStack, Icon, IconButton, Text, useBreakpointValue, useDisclosure } from '@chakra-ui/react'
import { useLocalStorage } from '@uidotdev/usehooks'
import { OrganizationProvider, useClient } from '@vocdoni/react-providers'
import React, { createContext, PropsWithChildren, useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LuCircleHelp, LuPanelLeft, LuPlus } from 'react-icons/lu'
import { generatePath, Outlet, Link as ReactRouterLink } from 'react-router-dom'
import { PricingModalProvider } from '~components/Pricing/PricingModalProvider'
import AnnouncementBanner from '~components/shared/Layout/AnnouncementBanner'
import { LocalStorageKeys, MaxWindowWidth } from '~constants'
import { Routes } from '~routes'
import { DashboardBookerModalButton } from '~shared/Dashboard/Booker'
import Breadcrumb, { BreadcrumbItem } from '~shared/Dashboard/Breadcrumb'
import DashboardMenu from '~shared/Dashboard/Menu'

export type DashboardLayoutContext = {
  setBreadcrumb: (items: BreadcrumbItem[]) => void
}

export type DashboardLayoutContextType = {
  reduced: boolean
}

export const DashboardLayoutContext = createContext<DashboardLayoutContextType | undefined>(undefined)

const LayoutDashboard: React.FC = () => {
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([])
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
          <DashboardMenu isOpen={isOpen} onClose={onClose} />

          <Flex flex='1 1 0' flexDirection='column' minW={0}>
            <AnnouncementBanner />
            {/* Top Menu */}
            <Box
              position='sticky'
              borderBottom='1px solid'
              borderColor='table.border'
              bgColor='chakra.body.bg'
              top={0}
              pr={4}
              pl={{ base: 4, md: 2 }}
              gap={4}
              display='flex'
              h={16}
              flexShrink={0}
              alignItems='center'
              zIndex={100}
            >
              <IconButton
                aria-label={t('menu.open')}
                colorScheme='gray'
                variant='subtle'
                size='xs'
                onClick={isMobile ? onOpen : () => setReduced((prev) => !prev)}
              >
                <LuPanelLeft />
              </IconButton>

              <Box borderRight='1px solid' borderRightColor='table.border' h={6} />

              <Breadcrumb breadcrumb={breadcrumb} setBreadcrumb={setBreadcrumb} />

              <Flex gap={2} ml='auto' alignItems='center'>
                <DashboardBookerModalButton
                  leftIcon={<Icon as={LuCircleHelp} />}
                  iconSpacing={{ base: 0, lg: 2 }}
                  variant='subtle'
                  colorPalette='gray'
                  size='sm'
                >
                  <Text as='span' display={{ base: 'none', lg: 'flex' }} fontSize='sm'>
                    <Trans i18nKey='do_you_need_help'>Do you need help?</Trans>
                  </Text>
                </DashboardBookerModalButton>
                <Button asChild size='sm'>
                  <ReactRouterLink to={generatePath(Routes.processes.create)}>
                    <HStack gap={{ base: 0, lg: 2 }}>
                      <Icon as={LuPlus} />
                      <Text as='span' fontSize='sm' display={{ base: 'none', lg: 'flex' }}>
                        <Trans i18nKey='new_voting'>New vote</Trans>
                      </Text>
                    </HStack>
                  </ReactRouterLink>
                </Button>
              </Flex>
            </Box>
            <Outlet context={{ setBreadcrumb } satisfies DashboardLayoutContext} />
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

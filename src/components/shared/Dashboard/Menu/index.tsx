import {
  Box,
  Button,
  CloseButton,
  DrawerBackdrop,
  DrawerContent,
  DrawerPositioner,
  DrawerRoot,
  Flex,
  HStack,
  Icon,
  ProgressRange,
  ProgressRoot,
  ProgressTrack,
  Text,
} from '@chakra-ui/react'
import { useContext } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LuPlus } from 'react-icons/lu'
import { generatePath, Link as ReactRouterLink, Link as RouterLink } from 'react-router-dom'
import { DashboardLayoutContext } from '~elements/LayoutDashboard'
import { DashboardBox } from '~shared/Dashboard/Contents'
import { VocdoniLogo } from '~shared/Layout/Logo'
import { useTutorials } from '~src/queries/organization'
import { Routes } from '~src/router/routes'
import { DashboardBookerModalButton } from '../Booker'
import { DashboardMenuOptions } from './Options'
import UserProfile from './UserProfile'

const DashboardMenu = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { reduced } = useContext(DashboardLayoutContext)

  return (
    <>
      {/* Sidebar for large screens */}
      <Box
        borderRight='1px solid'
        borderRightColor='table.border'
        bgColor='dashboard.menu'
        display={{ base: 'none', md: 'flex' }}
        flexDirection={'column'}
        position={'sticky'}
        top={0}
        minW={reduced ? '48px' : '255px'}
        maxW={reduced ? '48px' : '255px'}
        w={reduced ? '48px' : '255px'}
        h='100vh'
        p={2}
        zIndex={100}
        transition='width .3s ease, min-width .3s ease, max-width .3s ease'
      >
        <DashboardMenuContent />
      </Box>

      {/* Sidebar for small screens */}
      <DrawerRoot open={isOpen} placement='start' onOpenChange={({ open }) => (!open ? onClose() : undefined)}>
        <DrawerBackdrop />
        <DrawerPositioner>
          <DrawerContent p={2}>
            <DashboardMenuContent />
          </DrawerContent>
        </DrawerPositioner>
      </DrawerRoot>
    </>
  )
}

const SidebarTutorial = () => {
  const { t } = useTranslation()
  const { reduced } = useContext(DashboardLayoutContext)
  const { isSidebarTutorialClosed, isLoading, closeSidebarTutorial } = useTutorials()

  if (isLoading) {
    return (
      <ProgressRoot value={null}>
        <ProgressTrack>
          <ProgressRange />
        </ProgressTrack>
      </ProgressRoot>
    )
  }

  if (isSidebarTutorialClosed) return null

  return (
    <DashboardBox
      position={'relative'}
      flexDirection={'column'}
      display={reduced ? 'none' : 'flex'}
      gap={2}
      p={4}
      bgColor='chakra.body.bg'
      borderColor='table.border'
    >
      <CloseButton
        onClick={() => closeSidebarTutorial()}
        position={'absolute'}
        top={1}
        right={1}
        colorScheme='gray'
        size='sm'
      />
      <Text fontSize={'sm'} fontWeight={'bold'}>
        {t('need_help.title', { defaultValue: 'First steps' })}
      </Text>
      <Text fontSize={'xs'} lineHeight={'16px'} color='dashboard.schedule_call.description'>
        {t('need_help.description', {
          defaultValue: 'Do you need some help with your first voting process? Watch this tutorial or schedule a call.',
        })}
      </Text>
      <DashboardBookerModalButton variant='solid' colorScheme='gray' w='full' size={'sm'} fontSize={'12px'} />
    </DashboardBox>
  )
}

// Common menu contents
const DashboardMenuContent = () => {
  const { reduced } = useContext(DashboardLayoutContext)

  return (
    <>
      <Flex asChild justifyContent={'center'} alignItems={'center'} h='47px' mb={2}>
        <ReactRouterLink to={Routes.dashboard.base}>
          <VocdoniLogo width={reduced ? '32px' : '148px'} minimal={reduced} />
        </ReactRouterLink>
      </Flex>
      <Button asChild w='full' minW={0} mt={'8px'} mb={'32px'} size={'xs'}>
        <RouterLink to={generatePath(Routes.processes.create)}>
          <HStack gap={reduced ? 0 : 2}>
            <Icon as={LuPlus} boxSize={4} />
            {!reduced && (
              <Text as='span'>
                <Trans i18nKey='new_vote'>New vote</Trans>
              </Text>
            )}
          </HStack>
        </RouterLink>
      </Button>

      <DashboardMenuOptions />

      <Box mt='auto'>
        <SidebarTutorial />
        <UserProfile />
      </Box>
    </>
  )
}

export default DashboardMenu

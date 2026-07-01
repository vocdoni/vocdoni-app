import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  HStack,
  Icon,
  IconButton,
  Progress,
  Text,
  useMediaQuery,
  useToken,
} from '@chakra-ui/react'
import { useContext } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LuPanelLeft, LuPlus } from 'react-icons/lu'
import { generatePath, Link as ReactRouterLink, Link as RouterLink } from 'react-router-dom'
import { DashboardBox } from '~components/Dashboard/Contents'
import { VocdoniLogo } from '~components/Layout/Logo'
import { DashboardLayoutContext } from '~elements/DashboardLayoutContext'
import { useTutorials } from '~src/queries/organization'
import { Routes } from '~src/router/routes'
import { DashboardBookerModalButton } from '../Booker'
import { DashboardMenuConfig } from './menus'
import { DashboardMenuOptions } from './Options'
import UserProfile from './UserProfile'

const DashboardMenu = ({
  isOpen,
  onClose,
  onToggleReduced,
  menu,
}: {
  isOpen: boolean
  onClose: () => void
  onToggleReduced: () => void
  menu: DashboardMenuConfig
}) => {
  const { reduced } = useContext(DashboardLayoutContext)
  const [width, rWidth] = useToken('sizes', ['dashboard-menu.default', 'dashboard-menu.reduced'])

  return (
    <>
      {/* Sidebar for large screens */}
      <Box
        borderRight='1px solid'
        borderRightColor='table.border'
        bgColor='dashboard.menu'
        display={{ base: 'none', md: 'flex' }}
        flexDirection='column'
        position='sticky'
        top={0}
        w={reduced ? rWidth : width}
        h='100vh'
        zIndex={100}
        transition='width .3s ease'
      >
        <DashboardMenuContent onToggleReduced={onToggleReduced} menu={menu} />
      </Box>

      {/* Sidebar for small screens */}
      <Drawer.Root open={isOpen} placement='start' onOpenChange={({ open }) => (!open ? onClose() : undefined)}>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content p={4}>
            <DashboardMenuContent onToggleReduced={onToggleReduced} menu={menu} alignLogoCenter />
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </>
  )
}

const SidebarTutorial = () => {
  const { t } = useTranslation()
  const { reduced } = useContext(DashboardLayoutContext)
  const { isSidebarTutorialClosed, isLoading, closeSidebarTutorial } = useTutorials()

  if (isLoading) {
    return (
      <Progress.Root value={null}>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
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
      m={2}
      bgColor='chakra.body.bg'
      borderColor='table.border'
    >
      <CloseButton
        onClick={() => closeSidebarTutorial()}
        position={'absolute'}
        top={1}
        right={1}
        colorPalette='gray'
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
      <DashboardBookerModalButton variant='solid' colorPalette='gray' w='full' />
    </DashboardBox>
  )
}

// Common menu contents
const DashboardMenuContent = ({
  onToggleReduced,
  menu,
  alignLogoCenter = false,
}: {
  onToggleReduced: () => void
  menu: DashboardMenuConfig
  alignLogoCenter?: boolean
}) => {
  const { reduced } = useContext(DashboardLayoutContext)
  const { t } = useTranslation()
  const [isTouchLike] = useMediaQuery(['(hover: none), (pointer: coarse)'])

  return (
    <>
      <Box p={2}>
        <Flex
          alignItems='center'
          justifyContent={alignLogoCenter ? 'center' : 'flex-start'}
          h='47px'
          mb={2}
          role='group'
          position='relative'
          w='full'
          data-group
          css={{
            '&:hover .dashboard-collapse-toggle, &:focus-within .dashboard-collapse-toggle': {
              opacity: 1,
              pointerEvents: 'auto',
            },
          }}
        >
          <ReactRouterLink
            to={menu.homeRoute}
            onClick={() => {
              if (reduced && isTouchLike) onToggleReduced()
            }}
          >
            <VocdoniLogo width={reduced ? 'full' : '150px'} minimal={reduced} maxH='2rem' />
          </ReactRouterLink>
          <IconButton
            className='dashboard-collapse-toggle'
            aria-label={
              reduced
                ? t('menu.expand', { defaultValue: 'Expand menu' })
                : t('menu.collapse', { defaultValue: 'Collapse menu' })
            }
            colorPalette='gray'
            variant='subtle'
            size='xs'
            onClick={onToggleReduced}
            display={{ base: 'none', md: 'inline-flex' }}
            position='absolute'
            right={1}
            top='50%'
            left={reduced ? '50%' : undefined}
            transform={reduced ? 'translate(-50%, -50%)' : 'translateY(-50%)'}
            opacity={reduced ? 0 : 1}
            pointerEvents={reduced ? 'none' : 'auto'}
            zIndex={1}
          >
            <Icon as={LuPanelLeft} />
          </IconButton>
        </Flex>
        {menu.newVote && (
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
        )}

        <DashboardMenuOptions sections={menu.sections} />
      </Box>
      <Box mt='auto'>
        {menu.tutorial && <SidebarTutorial />}
        <UserProfile />
      </Box>
    </>
  )
}

export default DashboardMenu

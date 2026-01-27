import {
  Box,
  Button,
  ButtonProps,
  DrawerBackdrop,
  DrawerContent,
  DrawerPositioner,
  DrawerRoot,
  Flex,
  HStack,
  Icon,
  IconButton,
  Link,
  List,
  Separator,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { IoPricetagOutline } from 'react-icons/io5'
import { LuLogOut } from 'react-icons/lu'
import { RiContactsBook3Line, RiMenuLine } from 'react-icons/ri'
import { generatePath, Link as ReactRouterLink, useMatch, useMatches } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import ContactButton from '~shared/ContactLink'
import { ColorModeSwitcher, ColorModeSwitcherDetailed } from '~shared/Layout/ColorModeSwitcher'
import Logo from '~shared/Layout/Logo'
import { Routes } from '~src/router/routes'
import LanguagesListAccordion, { LanguagesMenu } from './LanguagesList'

type MenuItem = {
  icon: any
  label: string
  route?: string
  component?: React.ReactNode
}

type RouteHandle = {
  hideNavbar?: boolean
}

const BREAKPOINT = 'lg'

export function useHideNavbar() {
  const matches = useMatches() as Array<{ handle?: RouteHandle }>
  return Boolean(matches.some((m) => m.handle?.hideNavbar))
}

const Navbar = () => {
  const { isAuthenticated } = useAuth()
  const isOnProcessesPage = useMatch(Routes.processes.view)
  const reducedMenu = !!isOnProcessesPage && !isAuthenticated
  const hideNavbar = useHideNavbar()

  return (
    <Flex width='full' m='0 auto' mx='auto' py={3} position='relative'>
      <Flex
        justifyContent='space-between'
        alignItems='center'
        zIndex={1}
        w='100%'
        display={{ base: 'flex', [BREAKPOINT]: 'grid' }}
        gridTemplateColumns={`minmax(0, 1fr) ${hideNavbar ? '' : 'auto'} minmax(0, 1fr)`}
      >
        <Logo />
        <DesktopNav display={{ base: reducedMenu ? 'flex' : 'none', [BREAKPOINT]: 'flex' }} />
        {!reducedMenu && <Mobile />}
      </Flex>
    </Flex>
  )
}

const DesktopNav = ({ display }: { display?: any }) => {
  const { isAuthenticated } = useAuth()
  const isOnProcessesPage = useMatch(Routes.processes.view)
  const reducedMenu = !!isOnProcessesPage && !isAuthenticated
  const hideNavbar = useHideNavbar()
  return (
    <>
      {!hideNavbar && !reducedMenu && <NavMenu display={display} />}
      <Flex alignItems='center' display={display ? display : 'flex'} gap={2} justifySelf='end'>
        {!hideNavbar && !reducedMenu && <DashboardButton />}
        <LanguagesMenu />
        <ColorModeSwitcher />
      </Flex>
    </>
  )
}

const Mobile = () => {
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const { logout, isAuthenticated } = useAuth()
  const { t } = useTranslation()
  const isBreakpointSize = useBreakpointValue({
    base: false,
    [BREAKPOINT]: true,
  })
  const hideNavbar = useHideNavbar()
  const privacyPolicyUrl = import.meta.env.PRIVACY_POLICY_URL
  const termsOfServiceUrl = import.meta.env.TERMS_OF_SERVICE_URL

  useEffect(() => {
    if (isBreakpointSize) onClose()
  }, [isBreakpointSize])

  return (
    <>
      <IconButton
        onClick={onOpen}
        aria-label={t('menu.open', { defaultValue: 'Open Menu' })}
        display={{ base: 'block', [BREAKPOINT]: 'none' }}
      >
        <RiMenuLine />
      </IconButton>
      <DrawerRoot open={isOpen} placement='end' onOpenChange={({ open }) => (!open ? onClose() : undefined)}>
        <DrawerBackdrop />
        <DrawerPositioner>
          <DrawerContent>
            <Box p={4} display='flex' flexDirection='column' gap={4}>
              <NavMenu>
                {!hideNavbar && (
                  <>
                    <Separator />
                    <List.Item>
                      <DashboardButton />
                    </List.Item>
                    <Separator />
                  </>
                )}

                <List.Item>
                  <LanguagesListAccordion />
                </List.Item>
                <List.Item>
                  <ColorModeSwitcherDetailed />
                </List.Item>
                <Separator />
                {isAuthenticated && (
                  <>
                    <List.Item>
                      <Button onClick={logout} display='flex' alignItems='center' gap={2} h='fit-content'>
                        <Icon as={LuLogOut} />
                        <Text as={'span'} fontWeight={'semibold'}>
                          <Trans i18nKey='logout'>Logout</Trans>
                        </Text>
                      </Button>
                    </List.Item>
                    <Separator />
                  </>
                )}
                <List.Item>
                  <Link
                    fontSize={'xs'}
                    fontWeight={'semibold'}
                    href={termsOfServiceUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Trans i18nKey='menu.terms'>Terms</Trans>
                  </Link>
                </List.Item>
                <List.Item>
                  <Link
                    fontSize={'xs'}
                    fontWeight={'semibold'}
                    href={privacyPolicyUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <Trans i18nKey='menu.privacy'>Privacy</Trans>
                  </Link>
                </List.Item>
              </NavMenu>
            </Box>
          </DrawerContent>
        </DrawerPositioner>
      </DrawerRoot>
    </>
  )
}

const NavMenu = ({ display, children }: { display?: any; children?: any }) => {
  const { t } = useTranslation()
  const isMobile = useBreakpointValue({ base: true, [BREAKPOINT]: false })
  const { isAuthenticated } = useAuth()
  const isOnProcessesPage = useMatch(Routes.processes.view)
  const reducedMenu = !!isOnProcessesPage && !isAuthenticated
  const hideNavbar = useHideNavbar()
  const menuItems: MenuItem[] = [
    {
      icon: <IoPricetagOutline />,
      label: t('navbar.pricing', { defaultValue: 'Pricing' }),
      route: Routes.plans,
    },
    {
      icon: <RiContactsBook3Line />,
      label: t('navbar.contact', { defaultValue: 'Contact Us' }),
      component: (
        <ContactButton variant='navbar' leftIcon={isMobile ? <RiContactsBook3Line /> : undefined}>
          {t('navbar.contact', { defaultValue: 'Contact Us' })}
        </ContactButton>
      ),
    },
    {
      icon: <RiContactsBook3Line />,
      label: t('navbar.usecases', { defaultValue: 'Use Cases' }),
      route: Routes.usecases.base,
    },
  ]
  return (
    <List.Root
      as='nav'
      display={display ? display : 'flex'}
      flexDirection={{ base: 'column', [BREAKPOINT]: 'row' }}
      gap={4}
    >
      {!hideNavbar && !reducedMenu && (
        <>
          {menuItems.map((item, index) => (
            <List.Item key={index}>
              {item.component ? (
                item.component
              ) : (
                <Button asChild variant='navbar'>
                  <ReactRouterLink to={item.route ?? ''}>
                    {isMobile ? (
                      <HStack gap={2}>
                        {item.icon}
                        <Text as='span'>{item.label}</Text>
                      </HStack>
                    ) : (
                      item.label
                    )}
                  </ReactRouterLink>
                </Button>
              )}
            </List.Item>
          ))}
        </>
      )}

      <>{children}</>
    </List.Root>
  )
}
const DashboardButton = (props?: ButtonProps) => {
  const { t } = useTranslation()
  const { isAuthenticated } = useAuth()

  return (
    <Button asChild px={6} fontSize='xs' {...props}>
      <ReactRouterLink to={isAuthenticated ? generatePath(Routes.dashboard.base) : Routes.auth.signIn}>
        {isAuthenticated ? t('menu.dashboard', { defaultValue: 'Dashboard' }) : t('menu.login')}
      </ReactRouterLink>
    </Button>
  )
}
export default Navbar

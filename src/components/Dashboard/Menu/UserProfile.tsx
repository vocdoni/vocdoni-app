import {
  Avatar,
  Box,
  Button,
  Field,
  Flex,
  HStack,
  Icon,
  Link,
  Popover,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useContext, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LuBuilding, LuChevronLeft, LuChevronRight, LuChevronsUpDown, LuLogOut, LuUserPen } from 'react-icons/lu'
import { Link as ReactRouterLink } from 'react-router'
import { useSaasAccount } from '~components/Account/SaasAccountProvider'
import { useAuth } from '~components/Auth/useAuth'
import { ThemeToggleGroup } from '~components/Layout/ColorModeSwitcher'
import { LanguageListDashboard } from '~components/Navbar/LanguagesList'
import { DashboardLayoutContext } from '~elements/DashboardLayoutContext'
import { Routes } from '~routes'
import { useAppEnv } from '~src/app-env'
import { useProfile } from '~src/queries/account'
import { OrganizationSwitcher } from './OrganizationSwitcher'

const UserProfile = () => {
  const { t } = useTranslation()
  const { logout } = useAuth()
  const { data: profile } = useProfile()
  const { organization } = useSaasAccount()
  const { reduced } = useContext(DashboardLayoutContext)
  const variant = useBreakpointValue({
    base: false,
    md: true,
  })
  const [switchOrg, setSwitchOrg] = useState(false)

  const appEnv = useAppEnv()
  const privacyPolicyUrl = appEnv.PRIVACY_POLICY_URL
  const termsOfServiceUrl = appEnv.TERMS_OF_SERVICE_URL

  const placement = variant ? 'right-end' : 'bottom'
  const avatarSrc = organization?.account?.avatar || ''

  if (!profile) return

  return (
    <Popover.Root positioning={{ placement }}>
      <Popover.Trigger asChild>
        <Button
          aria-label={t('user_menu', 'User menu')}
          size='xl'
          display={'flex'}
          alignItems={'center'}
          gap={2}
          w='full'
          colorPalette='gray'
          variant='subtle'
          justifyContent='start'
          borderRadius='none'
          mt={2}
          p={2}
          minW={0}
        >
          <Flex alignItems='center' gap={2} w='full'>
            <Avatar.Root size='xs' borderRadius='full'>
              {avatarSrc ? <Avatar.Image src={avatarSrc} /> : null}
              <Avatar.Fallback name={`${profile.firstName} ${profile.lastName}`} />
            </Avatar.Root>
            {!reduced && (
              <Flex
                css={{ '--size': 'calc(var(--chakra-sizes-dashboard-menu-default) - 7rem)' }}
                flexDirection='column'
                justifyContent='start'
                alignItems='start'
                gap={0.5}
                ml={0}
              >
                <Text fontWeight='light' fontSize='sm' lineHeight={1} maxW='var(--size)' truncate>
                  {profile.firstName}
                </Text>
                <Text fontWeight='light' fontSize='xs' lineHeight={1} color='fg.muted' maxW='var(--size)' truncate>
                  {organization?.account?.name?.default}
                </Text>
              </Flex>
            )}
            {!reduced && <Icon as={LuChevronsUpDown} color='fg.muted' ml='auto' />}
          </Flex>
        </Button>
      </Popover.Trigger>
      <Popover.Positioner>
        <Popover.Content w='user-profile'>
          <Popover.Header>
            <Box display={'flex'} gap={2} alignItems={'center'} justifyContent={'start'} px={1} py={1.5} mb={1}>
              <Avatar.Root size='sm' borderRadius='md'>
                {avatarSrc ? <Avatar.Image src={avatarSrc} /> : null}
                <Avatar.Fallback name={`${profile.firstName} ${profile.lastName}`} />
              </Avatar.Root>
              <Flex
                css={{ '--size': 'calc(var(--chakra-sizes-user-profile) - 4rem)' }}
                flexDirection='column'
                justifyContent='start'
                gap={0.5}
              >
                <Text fontSize='sm' lineHeight={1} textAlign='start' fontWeight='bolder' maxW='var(--size)' truncate>
                  {profile.firstName}
                </Text>
                {switchOrg ? (
                  <Button
                    onClick={() => setSwitchOrg(false)}
                    fontSize='xs'
                    h='unset'
                    variant='plain'
                    p={0}
                    display='inline'
                    asChild
                  >
                    <Link>
                      <Icon as={LuChevronLeft} boxSize={3} />
                      {t('back')}
                    </Link>
                  </Button>
                ) : (
                  <Text
                    title={profile.email}
                    fontWeight='light'
                    fontSize='xs'
                    color='dashboard.profile.email'
                    maxW='var(--size)'
                    truncate
                  >
                    {profile.email}
                  </Text>
                )}
              </Flex>
            </Box>
          </Popover.Header>
          {switchOrg ? (
            <OrganizationSwitcher />
          ) : (
            <>
              <Popover.Body>
                <Box borderBottom='1px solid' borderBottomColor='table.border' py={1}>
                  <Button
                    fontWeight='normal'
                    colorPalette='gray'
                    variant='profilemenu'
                    onClick={() => setSwitchOrg(true)}
                  >
                    <Flex alignItems='center' gap={2} w='full'>
                      <Icon as={LuBuilding} />
                      <Trans i18nKey={'switch_organization'} />
                      <Icon as={LuChevronRight} marginLeft='auto' />
                    </Flex>
                  </Button>
                  <Button fontWeight='normal' colorPalette='gray' variant='profilemenu' asChild>
                    <ReactRouterLink to={Routes.dashboard.profile}>
                      <HStack gap={2}>
                        <Icon as={LuUserPen} />
                        <Trans i18nKey={'user_settings'} />
                      </HStack>
                    </ReactRouterLink>
                  </Button>
                </Box>
                <Box borderBottom='1px solid' borderBottomColor='table.border' py={1}>
                  <Text fontWeight='extrabold' fontSize='sm' px={2} py={1.5}>
                    {t('preferences', { defaultValue: 'Preferences' })}
                  </Text>
                  <Field.Root
                    display='flex'
                    justifyContent='space-between'
                    p={2}
                    alignItems='center'
                    flexDirection='row'
                  >
                    <Field.Label m={0} htmlFor='theme-toggle'>
                      <Trans i18nKey='theme'>Theme</Trans>
                    </Field.Label>
                    <ThemeToggleGroup />
                  </Field.Root>
                  <LanguageListDashboard px={2} py={1.5} />
                </Box>
                <Button colorPalette='gray' fontWeight='bold' variant='profilemenu' onClick={logout}>
                  <HStack gap={2}>
                    <Icon as={LuLogOut} />
                    <Trans i18nKey={'logout'} />
                  </HStack>
                </Button>
              </Popover.Body>
              <Popover.Footer pt={1}>
                <Flex gap={2} alignItems='center' justifyContent='center' w='full'>
                  <Link
                    href={privacyPolicyUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    fontSize='xs'
                    color='dashboard.support_link'
                  >
                    <Trans i18nKey='privacy_policy'>Privacy policy</Trans>
                  </Link>
                  <Text fontSize='xs'>•</Text>
                  <Link
                    href={termsOfServiceUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    fontSize='xs'
                    color='dashboard.support_link'
                  >
                    <Trans i18nKey='terms_of_service'>Terms of Service</Trans>
                  </Link>
                </Flex>
              </Popover.Footer>
            </>
          )}
        </Popover.Content>
      </Popover.Positioner>
    </Popover.Root>
  )
}

export default UserProfile

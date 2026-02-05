import {
  AvatarFallback,
  AvatarImage,
  AvatarRoot,
  Box,
  Button,
  FieldLabel,
  FieldRoot,
  Flex,
  HStack,
  Icon,
  Link,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverPositioner,
  PopoverRoot,
  PopoverTrigger,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useContext, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LuBuilding, LuChevronLeft, LuChevronRight, LuChevronsUpDown, LuLogOut, LuUserPen } from 'react-icons/lu'
import { Link as ReactRouterLink } from 'react-router-dom'
import { useSaasAccount } from '~components/Account/SaasAccountProvider'
import { useAuth } from '~components/Auth/useAuth'
import { DashboardLayoutContext } from '~elements/LayoutDashboard'
import { Routes } from '~routes'
import { ThemeToggleGroup } from '~shared/Layout/ColorModeSwitcher'
import { LanguageListDashboard } from '~shared/Navbar/LanguagesList'
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

  const privacyPolicyUrl = import.meta.env.PRIVACY_POLICY_URL
  const termsOfServiceUrl = import.meta.env.TERMS_OF_SERVICE_URL

  const placement = variant ? 'right-end' : 'bottom'
  const avatarSrc = organization?.account?.avatar || ''

  if (!profile) return

  return (
    <PopoverRoot positioning={{ placement }}>
      <PopoverTrigger asChild>
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
          mt={2}
          p={reduced ? 0 : 2}
          minW={0}
        >
          <Flex alignItems='center' gap={2} w='full'>
            <AvatarRoot size='sm' borderRadius='md'>
              {avatarSrc ? <AvatarImage src={avatarSrc} /> : null}
              <AvatarFallback name={`${profile.firstName} ${profile.lastName}`} />
            </AvatarRoot>
            {!reduced && (
              <Flex flexDirection={'column'} justifyContent={'start'} gap={0.5} ml={0}>
                <Text fontWeight='light' fontSize='sm' lineHeight={'14px'} textAlign={'start'} maxW={'165px'} truncate>
                  {profile.firstName}
                </Text>
                <Text
                  fontWeight='light'
                  fontSize='xs'
                  lineHeight={'14px'}
                  color='dashboard.profile.email'
                  maxW={'165px'}
                  truncate
                >
                  {organization?.account?.name?.default}
                </Text>
              </Flex>
            )}
            {!reduced && <Icon as={LuChevronsUpDown} color='dashboard.chevron' ml='auto' />}
          </Flex>
        </Button>
      </PopoverTrigger>
      <PopoverPositioner>
        <PopoverContent w='max-content' minW='280px'>
          <PopoverHeader>
            <Box display={'flex'} gap={2} alignItems={'center'} justifyContent={'start'} px={1} py={1.5} mb={1}>
              <AvatarRoot size='sm' borderRadius='md'>
                {avatarSrc ? <AvatarImage src={avatarSrc} /> : null}
                <AvatarFallback name={`${profile.firstName} ${profile.lastName}`} />
              </AvatarRoot>
              <Flex flexDirection={'column'} justifyContent={'start'} gap={0.5}>
                <Text fontSize='sm' lineHeight={'14px'} textAlign={'start'} fontWeight={500} maxW={'170px'} truncate>
                  {profile.firstName}
                </Text>
                {switchOrg ? (
                  <Button
                    onClick={() => setSwitchOrg(false)}
                    display='flex'
                    alignItems='center'
                    fontSize='xs'
                    h='unset'
                  >
                    <HStack gap={2}>
                      <Icon as={LuChevronLeft} />
                      {t('back')}
                    </HStack>
                  </Button>
                ) : (
                  <Text fontWeight='light' fontSize='xs' color='dashboard.profile.email' maxW='165px' truncate>
                    {profile.email}
                  </Text>
                )}
              </Flex>
            </Box>
          </PopoverHeader>
          {switchOrg ? (
            <OrganizationSwitcher />
          ) : (
            <>
              <PopoverBody>
                <Box borderBottom='1px solid' borderBottomColor='table.border' py={1}>
                  <Button
                    fontWeight='normal'
                    colorScheme='gray'
                    variant='profilemenu'
                    onClick={() => setSwitchOrg(true)}
                  >
                    <Flex alignItems='center' gap={2} w='full'>
                      <Icon as={LuBuilding} />
                      <Trans i18nKey={'switch_organization'} />
                      <Icon as={LuChevronRight} marginLeft='auto' />
                    </Flex>
                  </Button>
                  <Button fontWeight='normal' colorScheme='gray' variant='profilemenu' asChild>
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
                  <FieldRoot display='flex' justifyContent='space-between' p={2} alignItems='center'>
                    <FieldLabel m={0} htmlFor='theme-toggle'>
                      <Trans i18nKey='theme'>Theme</Trans>
                    </FieldLabel>
                    <ThemeToggleGroup />
                  </FieldRoot>
                  <LanguageListDashboard px={2} py={1.5} />
                </Box>
                <Button colorScheme='gray' fontWeight='bold' variant='profilemenu' onClick={logout}>
                  <HStack gap={2}>
                    <Icon as={LuLogOut} />
                    <Trans i18nKey={'logout'} />
                  </HStack>
                </Button>
              </PopoverBody>
              <PopoverFooter pt={1}>
                <Flex gap={2} alignItems='center' justifyContent='center'>
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
              </PopoverFooter>
            </>
          )}
        </PopoverContent>
      </PopoverPositioner>
    </PopoverRoot>
  )
}

export default UserProfile

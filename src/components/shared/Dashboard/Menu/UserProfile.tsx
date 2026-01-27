import {
  Avatar,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Icon,
  Link,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
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

  const placement = variant ? 'right-end' : 'auto'

  if (!profile) return

  return (
    <Popover placement={placement}>
      <PopoverTrigger>
        <Button
          leftIcon={
            <Avatar
              name={`${profile.firstName} ${profile.lastName}`}
              src={organization?.account?.avatar || ''}
              size='sm'
              borderRadius='md'
            />
          }
          rightIcon={!reduced && <Icon as={LuChevronsUpDown} color='dashboard.chevron' />}
          aria-label={t('user_menu', 'User menu')}
          size='xl'
          display={'flex'}
          alignItems={'center'}
          gap={2}
          w='full'
          justifyContent='start'
          variant='unstyled'
          mt={2}
          p={reduced ? 0 : 2}
          minW={0}
          sx={{ '& span:nth-of-type(2)': { marginLeft: 'auto' } }}
        >
          {!reduced && (
            <Flex flexDirection={'column'} justifyContent={'start'} gap={0.5} ml={0}>
              <Text fontWeight='light' size='sm' lineHeight={'14px'} textAlign={'start'} maxW={'165px'} isTruncated>
                {profile.firstName}
              </Text>
              <Text
                fontWeight='light'
                size='xs'
                lineHeight={'14px'}
                color='dashboard.profile.email'
                maxW={'165px'}
                isTruncated
              >
                {organization?.account?.name?.default}
              </Text>
            </Flex>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent w='max-content' minW='280px'>
        <PopoverHeader>
          <Box display={'flex'} gap={2} alignItems={'center'} justifyContent={'start'} px={1} py={1.5} mb={1}>
            <Avatar
              name={`${profile.firstName} ${profile.lastName}`}
              src={organization?.account?.avatar || ''}
              size='sm'
              borderRadius='md'
            />
            <Flex flexDirection={'column'} justifyContent={'start'} gap={0.5}>
              <Text size='sm' lineHeight={'14px'} textAlign={'start'} fontWeight={500} maxW={'170px'} isTruncated>
                {profile.firstName}
              </Text>
              {switchOrg ? (
                <Button
                  onClick={() => setSwitchOrg(false)}
                  leftIcon={<Icon as={LuChevronLeft} />}
                  variant='link'
                  display='flex'
                  alignItems='center'
                  fontSize='xs'
                  h='unset'
                  color='dashboard.back'
                >
                  {t('back')}
                </Button>
              ) : (
                <Text fontWeight='light' size='xs' color='dashboard.profile.email' maxW='165px' isTruncated>
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
                  leftIcon={<LuBuilding />}
                >
                  <Trans i18nKey={'switch_organization'} />
                  <Icon as={LuChevronRight} marginLeft='auto' />
                </Button>
                <Button
                  fontWeight='normal'
                  colorScheme='gray'
                  variant='profilemenu'
                  as={ReactRouterLink}
                  to={Routes.dashboard.profile}
                  leftIcon={<LuUserPen />}
                >
                  <Trans i18nKey={'user_settings'} />
                </Button>
              </Box>
              <Box borderBottom='1px solid' borderBottomColor='table.border' py={1}>
                <Text fontWeight='extrabold' size={'sm'} px={2} py={1.5}>
                  {t('preferences', { defaultValue: 'Preferences' })}
                </Text>
                <FormControl display='flex' justifyContent='space-between' p={2} alignItems='center'>
                  <FormLabel m={0} htmlFor='theme-toggle'>
                    <Trans i18nKey='theme'>Theme</Trans>
                  </FormLabel>
                  <ThemeToggleGroup />
                </FormControl>
                <LanguageListDashboard px={2} py={1.5} />
              </Box>
              <Button
                colorScheme='gray'
                fontWeight='bold'
                variant='profilemenu'
                onClick={logout}
                leftIcon={<LuLogOut />}
              >
                <Trans i18nKey={'logout'} />
              </Button>
            </PopoverBody>
            <PopoverFooter pt={1}>
              <Flex gap={2} alignItems='center' justifyContent='center'>
                <Link href={privacyPolicyUrl} isExternal fontSize='xs' color='dashboard.support_link'>
                  <Trans i18nKey='privacy_policy'>Privacy policy</Trans>
                </Link>
                <Text fontSize='xs'>•</Text>
                <Link href={termsOfServiceUrl} isExternal fontSize='xs' color='dashboard.support_link'>
                  <Trans i18nKey='terms_of_service'>Terms of Service</Trans>
                </Link>
              </Flex>
            </PopoverFooter>
          </>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default UserProfile

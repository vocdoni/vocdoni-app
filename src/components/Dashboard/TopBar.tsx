import { Avatar, Flex, HStack, Icon, IconButton, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useSaasAccount } from '~components/Account/SaasAccountProvider'
import { MenuIcon } from '~theme/icons'
import UserProfile from './Menu/UserProfile'

type DashboardTopBarProps = {
  isMenuOpen: boolean
  onOpenMenu: () => void
}

/**
 * The dashboard's top bar below `lg`, where the sidebar gives way to a drawer: the button that opens it, the
 * organization and the account menu. Hidden from `lg` by CSS, so the first paint is right at every width.
 */
export const DashboardTopBar = ({ isMenuOpen, onOpenMenu }: DashboardTopBarProps) => {
  const { t } = useTranslation()
  const { organization } = useSaasAccount()
  const name = organization?.account?.name?.default
  const avatar = organization?.account?.avatar

  return (
    <Flex
      as='header'
      display={{ base: 'flex', lg: 'none' }}
      alignItems='center'
      gap='1.5'
      h='dashboard.topbar'
      flexShrink={0}
      ps='1'
      pe='2'
      bg='surface.sidebar'
      borderBottom='sm'
      borderBottomColor='border'
    >
      <IconButton
        aria-label={t('menu.open', { defaultValue: 'Open menu' })}
        aria-haspopup='dialog'
        aria-expanded={isMenuOpen}
        colorPalette='gray'
        variant='ghost'
        size='xs'
        onClick={onOpenMenu}
      >
        <Icon as={MenuIcon} boxSize='icon.md' />
      </IconButton>
      <HStack gap='2.5' flex='1' minW='0'>
        {name && (
          <>
            <Avatar.Root size='2xs' shape='rounded' flexShrink={0}>
              {avatar ? <Avatar.Image src={avatar} /> : null}
              <Avatar.Fallback name={name} />
            </Avatar.Root>
            <Text as='span' fontSize='item' fontWeight='semibold' truncate>
              {name}
            </Text>
          </>
        )}
      </HStack>
      <UserProfile compact />
    </Flex>
  )
}

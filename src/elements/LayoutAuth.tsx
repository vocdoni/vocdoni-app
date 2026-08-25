import { Box, Flex, Heading, Icon, Link, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Trans } from 'react-i18next'
import { LuArrowLeft } from 'react-icons/lu'
import { Outlet, Link as RouterLink, useLocation } from 'react-router'
import { AuthShowcase, AuthTrustBar, useAuthVertical } from '~components/Auth/vertical'
import { Routes } from '~routes'

export type AuthOutletContextType = {
  setTitle: React.Dispatch<React.SetStateAction<string>>
  setSubtitle: React.Dispatch<React.SetStateAction<string>>
}

/**
 * Chrome shared by every auth screen (sign in, sign up, verify, recovery, password reset, create
 * organization).
 *
 * The form column is deliberately untouched by the vertical: only the showcase panel beside it and
 * the trust bar below it react to `?type=` (see `~components/Auth/vertical`), so the auth flows
 * rendered into the outlet know nothing about verticals.
 */
const LayoutAuth = () => {
  const [title, setTitle] = useState<string | null>(null)
  const [subtitle, setSubtitle] = useState<string | null>(null)
  const vertical = useAuthVertical()
  const { pathname } = useLocation()
  const isSignin = pathname === Routes.auth.signIn

  return (
    <Flex justifyContent='center' minH='100dvh' p={{ base: 6, md: 10 }}>
      <Flex w='full' maxW={{ base: 'md', md: '4xl', lg: '6xl' }} flexDir='column' gap={2} my='auto'>
        <Link asChild display='flex' alignItems='center' alignSelf='start'>
          <RouterLink to={isSignin ? Routes.vocdoni : Routes.auth.signIn}>
            <Icon as={LuArrowLeft} />
            {isSignin ? <Trans i18nKey='common.home'>Home</Trans> : <Trans i18nKey='common.back'>Back</Trans>}
          </RouterLink>
        </Link>
        <Flex
          w='full'
          // Floor, not a fixed height: the row still grows for a long form or a long quote. It only
          // stops the panel from collapsing to the height of whichever form sits next to it — the
          // verify and recovery screens are barely three fields tall.
          minH={{ md: '34rem', lg: '38rem' }}
          _light={{ border: '1px solid', borderColor: 'auth.card.border' }}
          borderRadius='sm'
          // Clips the showcase panel to the rounded corners, and keeps a long quote or a long email
          // from stretching either column past its share of the row.
          overflow='hidden'
          bgColor='auth.card.bg'
        >
          <Flex
            p={{ base: 6, sm: 8, lg: 10 }}
            flex={{ base: '1 1 100%', md: '0 0 52%', lg: '0 0 46%' }}
            minW={0}
            flexDir='column'
            justifyContent='center'
          >
            {(title || subtitle) && (
              <Box mb={6}>
                {title && (
                  <Heading size='lg' mb={1} letterSpacing={'-0.6px'}>
                    {title}
                  </Heading>
                )}
                {subtitle && (
                  <Text color='fg.muted' fontSize='sm'>
                    {subtitle}
                  </Text>
                )}
              </Box>
            )}
            <Outlet context={{ setTitle, setSubtitle } satisfies AuthOutletContextType} />
          </Flex>
          <AuthShowcase vertical={vertical} />
        </Flex>
        <AuthTrustBar vertical={vertical} />
      </Flex>
    </Flex>
  )
}

export default LayoutAuth

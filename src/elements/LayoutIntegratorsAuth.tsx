import { Box, Flex, Heading, Icon, Link, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Trans } from 'react-i18next'
import { LuArrowLeft } from 'react-icons/lu'
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom'
import { IntegratorsPageTitle } from '~constants'
import { AuthOutletContextType } from '~elements/LayoutAuth'
import { Routes } from '~routes'
import { useDocumentTitle } from '~utils/use-document-title'

// Single-column auth layout for the integrators app. Mirrors LayoutAuth's card styling but
// drops the testimonials column — integrators get a focused, single-column experience.
const LayoutIntegratorsAuth = () => {
  useDocumentTitle(IntegratorsPageTitle)
  const [title, setTitle] = useState<string | null>(null)
  const [subtitle, setSubtitle] = useState<string | null>(null)
  const { pathname } = useLocation()
  const isSignin = pathname === Routes.integrators.signIn

  return (
    <Flex justifyContent='center' minH='100dvh' p={{ base: 6, md: 10 }}>
      <Flex w='full' maxW='md' flexDir='column' gap={2} my='auto'>
        <Link asChild display='flex' alignItems='center' alignSelf='start'>
          <RouterLink to={isSignin ? Routes.vocdoni : Routes.integrators.signIn}>
            <Icon as={LuArrowLeft} />
            {isSignin ? <Trans i18nKey='common.home'>Home</Trans> : <Trans i18nKey='common.back'>Back</Trans>}
          </RouterLink>
        </Link>
        <Box
          w='full'
          _light={{ border: '1px solid', borderColor: 'auth.card.border' }}
          borderRadius='sm'
          bgColor='auth.card.bg'
          p={{ base: 6, sm: 8 }}
        >
          {(title || subtitle) && (
            <Box mb={6}>
              {title && (
                <Heading size='lg' mb={1} letterSpacing={'-0.6px'}>
                  {title}
                </Heading>
              )}
              {subtitle && (
                <Text color='gray.500' fontSize='sm'>
                  {subtitle}
                </Text>
              )}
            </Box>
          )}
          <Outlet context={{ setTitle, setSubtitle } satisfies AuthOutletContextType} />
        </Box>
      </Flex>
    </Flex>
  )
}

export default LayoutIntegratorsAuth

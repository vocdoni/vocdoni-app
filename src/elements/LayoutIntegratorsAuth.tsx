import { Box, Flex, Heading, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Outlet, useLocation } from 'react-router'
import { AuthLayoutHeader } from '~components/Auth/AuthLayoutHeader'
import { AuthOutletContextType } from '~elements/LayoutAuth'
import { Routes } from '~routes'

// Single-column auth layout for the integrators app. Mirrors LayoutAuth's card styling but
// drops the testimonials column — integrators get a focused, single-column experience.
const LayoutIntegratorsAuth = () => {
  const [title, setTitle] = useState<string | null>(null)
  const [subtitle, setSubtitle] = useState<string | null>(null)
  const { pathname } = useLocation()
  const isSignin = pathname === Routes.integrators.signIn

  return (
    <Flex justifyContent='center' minH='100dvh' p={{ base: 6, md: 10 }}>
      <Flex w='full' maxW='md' flexDir='column' gap={2} my='auto'>
        <AuthLayoutHeader isSignin={isSignin} signInRoute={Routes.integrators.signIn} />
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
                <Text color='fg.muted' fontSize='sm'>
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

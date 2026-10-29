import { Box, Card, Flex, Heading, Text } from '@chakra-ui/react'
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
        {/* A block, not the card's flex column: the routed pages below lay themselves out. */}
        <Card.Root variant='standalone' display='block' w='full' p={{ base: 6, sm: 8 }}>
          {(title || subtitle) && (
            <Box mb={6}>
              {title && (
                <Heading size='lg' mb={1} letterSpacing='heading.tight'>
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
        </Card.Root>
      </Flex>
    </Flex>
  )
}

export default LayoutIntegratorsAuth

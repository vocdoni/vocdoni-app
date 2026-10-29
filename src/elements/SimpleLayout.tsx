import { Box, Flex, HStack } from '@chakra-ui/react'
import { ReactNode, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router'
import { ColorModeSwitcher } from '~components/Layout/ColorModeSwitcher'
import CrispChat from '~components/Layout/CrispChat'
import Footer from '~components/Layout/Footer'
import { VocdoniLogo } from '~components/Layout/Logo'
import { LanguagesMenu } from '~components/Navbar/LanguagesList'

export type SimpleLayoutOutletContext = {
  setLogo: (logo?: ReactNode) => void
}

const Layout = () => {
  const [logo, setLogo] = useState<React.ReactNode>()

  return (
    <Flex position='relative' flexDirection='column' minH='100dvh' mx='auto'>
      <HStack
        as='header'
        position='sticky'
        top={0}
        w='full'
        backdropFilter='blur(40px)'
        zIndex='public-header'
        px={{ base: 4, md: 6, xl: 10 }}
        py={3}
        maxW='navbar'
        mx='auto'
        justifyContent='space-between'
      >
        {logo ?? <VocdoniLogo height={6} />}
        <Box display='flex' alignItems='center' gap={4}>
          <LanguagesMenu />
          <ColorModeSwitcher />
        </Box>
      </HStack>
      <ScrollRestoration />
      <CrispChat />
      <Flex
        flexDirection='column'
        as='main'
        flexGrow={1}
        mb={{ base: 20, lg: 32 }}
        maxW='content.public'
        mx='auto'
        px={{
          base: 2.5,
          sm: 5,
          md: 20,
        }}
        w='full'
      >
        <Outlet context={{ setLogo } satisfies SimpleLayoutOutletContext} />
      </Flex>
      <Box as='footer' w='full' px={{ base: 4, md: 6, xl: 10 }} maxW='navbar' mx='auto'>
        <Footer simplified />
      </Box>
    </Flex>
  )
}

export default Layout

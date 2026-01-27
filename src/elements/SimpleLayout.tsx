import { Box, Flex, HStack } from '@chakra-ui/react'
import { ReactNode, useState } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { ColorModeSwitcher } from '~components/shared/Layout/ColorModeSwitcher'
import CrispChat from '~components/shared/Layout/CrispChat'
import { VocdoniLogo } from '~components/shared/Layout/Logo'
import { LanguagesMenu } from '~components/shared/Navbar/LanguagesList'
import { MaxNavbarWidth } from '~constants'
import Footer from '~shared/Layout/Footer'

export type SimpleLayoutOutletContext = {
  setLogo: (logo?: ReactNode) => void
}

const Layout = () => {
  const [logo, setLogo] = useState<React.ReactNode>()

  return (
    <Flex position='relative' flexDirection='column' minH='100vh' mx='auto'>
      <HStack
        as='header'
        position='sticky'
        top={0}
        w='full'
        backdropFilter='blur(40px)'
        zIndex={30}
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
        maxW='1600px'
        mx='auto'
        px={{
          base: '10px',
          sm: '20px',
          md: '80px',
        }}
        w='full'
      >
        <Outlet context={{ setLogo }} />
      </Flex>
      <Box as='footer' w='full' px={{ base: 4, md: 6, xl: 10 }} maxW={MaxNavbarWidth} mx='auto'>
        <Footer simplified />
      </Box>
    </Flex>
  )
}

export default Layout

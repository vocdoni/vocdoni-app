import { Box, Flex, HStack, Link } from '@chakra-ui/react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import AnnouncementBanner from '~components/Layout/AnnouncementBanner'
import CrispChat from '~components/Layout/CrispChat'
import Navbar from '~components/Navbar'
import { Routes } from '~routes'

const Layout = () => {
  const location = useLocation()

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
        maxW='navbar'
        mx='auto'
      >
        <Navbar />
      </HStack>
      <ScrollRestoration />
      <CrispChat />
      {[Routes.root, Routes.plans].includes(location.pathname) && <AnnouncementBanner limited />}
      <Flex
        flexDirection='column'
        as='main'
        mt={{ base: 4, lg: 6, xl: 10 }}
        mb={8}
        maxW='1600px'
        mx='auto'
        px={{
          base: '10px',
          sm: '20px',
          md: '80px',
        }}
        w='full'
      >
        <Outlet />
      </Flex>
      <Box
        as='footer'
        bgColor={`${location.pathname.startsWith('/organization') ? 'footer.gray' : 'footer.white'}`}
        w='full'
        backdropFilter='blur(40px)'
        maxW='voting-page'
        mx={'auto'}
        mb={10}
        textAlign='center'
      >
        <strong>Esquerra republicana</strong> utilitza la plataforma de programari lliure Vocdoni basada en tecnologia
        blockchain per gestionar i registrar les votacions de manera segura i transparent. Per més informació sobre la
        plataforma podeu consultar el següent enllaç:{' '}
        <Link href='https://vocdoni.io/' target='_blank' rel='noopener noreferrer' textDecor='underline'>
          vocdoni.io
        </Link>
      </Box>
    </Flex>
  )
}

export default Layout

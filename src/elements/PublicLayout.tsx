import { Box, Flex, HStack } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import AnnouncementBanner from '~components/Layout/AnnouncementBanner'
import CrispChat from '~components/Layout/CrispChat'
import Footer from '~components/Layout/Footer'
import Navbar from '~components/Navbar'
import { Routes } from '~routes'

type PublicLayoutProps = PropsWithChildren<{
  pathname: string
  publicLanguageLinks?: Record<string, string>
}>

const PublicLayout = ({ pathname, publicLanguageLinks, children }: PublicLayoutProps) => {
  const isOrganizationPage = pathname === '/organization' || pathname.includes('/organization/')

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
        <Navbar publicLanguageLinks={publicLanguageLinks} />
      </HStack>
      <CrispChat />
      {[Routes.root, Routes.plans].includes(pathname) && <AnnouncementBanner limited />}
      <Flex
        flexDirection='column'
        as='main'
        flexGrow={1}
        mt={{ base: 4, lg: 6, xl: 10 }}
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
        {children}
      </Flex>
      <Box
        as='footer'
        bgColor={`${isOrganizationPage ? 'footer.gray' : 'footer.white'}`}
        w='full'
        backdropFilter='blur(40px)'
        px={{ base: 4, md: 6, xl: 10 }}
        maxW={'1920px'}
        mx={'auto'}
      >
        <Footer />
      </Box>
    </Flex>
  )
}

export default PublicLayout

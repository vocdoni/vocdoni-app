import { Box, Flex, HStack, Text } from '@chakra-ui/react'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
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
          <SharedCensusMemberNumber />
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
        <Outlet context={{ setLogo } satisfies SimpleLayoutOutletContext} />
      </Flex>
      <Box as='footer' w='full' px={{ base: 4, md: 6, xl: 10 }} maxW='navbar' mx='auto'>
        <Footer simplified />
      </Box>
    </Flex>
  )
}

const SharedCensusMemberNumber = () => {
  const { t } = useTranslation()
  const { memberNumber } = useAuth()

  if (!memberNumber) return null

  return (
    <Text color='texts.default' fontSize='sm' fontWeight='bold' whiteSpace='nowrap'>
      {t('shared_census.member_number_label', { defaultValue: 'Member No.' })} {memberNumber}
    </Text>
  )
}

export default Layout

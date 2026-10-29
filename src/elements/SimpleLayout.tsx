import { Box, Flex } from '@chakra-ui/react'
import { ReactNode, useState } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'
import { ColorModeSwitcher } from '~components/Layout/ColorModeSwitcher'
import { VocdoniLogo } from '~components/Layout/Logo'
import { LanguagesMenu } from '~components/Navbar/LanguagesList'
import PublicLayout from './PublicLayout'

export type SimpleLayoutOutletContext = {
  setLogo: (logo?: ReactNode) => void
}

// The shared-census home: the public shell with the page's own logo and no dashboard button.
const Layout = () => {
  const [logo, setLogo] = useState<React.ReactNode>()
  const { pathname } = useLocation()

  return (
    <PublicLayout
      pathname={pathname}
      header={
        <Flex w='full' py={3} alignItems='center' justifyContent='space-between' gap={2}>
          {logo ?? <VocdoniLogo height={6} />}
          <Box display='flex' alignItems='center' gap={4}>
            <LanguagesMenu />
            <ColorModeSwitcher />
          </Box>
        </Flex>
      }
      hideAnnouncement
      flushContent
      simpleFooter
    >
      <ScrollRestoration />
      <Outlet context={{ setLogo } satisfies SimpleLayoutOutletContext} />
    </PublicLayout>
  )
}

export default Layout

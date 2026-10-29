import { Box, Flex } from '@chakra-ui/react'
import { PropsWithChildren, ReactNode } from 'react'
import AnnouncementBanner from '~components/Layout/AnnouncementBanner'
import CrispChat from '~components/Layout/CrispChat'
import Footer from '~components/Layout/Footer'
import Navbar from '~components/Navbar'
import { PageContainer } from '~components/ui/PageContainer'
import { stripPublicLanguagePrefix } from '~i18n/public-language'
import { Routes } from '~routes'
import { useAppEnv, useLanguagesEnv } from '~src/app-env'
import type { HeaderOrganizationLogo } from '~src/pages/shared/headerOrganizationLogo'

type PublicLayoutProps = PropsWithChildren<{
  pathname: string
  publicLanguageLinks?: Record<string, string>
  enableChat?: boolean
  showDashboardButton?: boolean
  /**
   * Organization branding of the process this page shows, when it has one. Only
   * honored while SHOW_ORG_LOGO is on, and only for the header — the footer logo
   * stays Vocdoni in every deployment.
   */
  organizationLogo?: HeaderOrganizationLogo
  /** Replaces the navbar, for the shared-census home that brings its own logo and switchers. */
  header?: ReactNode
  // The shared-census home's other differences: no announcement banner, no space under the header
  // and the short footer, without its band.
  hideAnnouncement?: boolean
  flushContent?: boolean
  simpleFooter?: boolean
}>

const PublicLayout = ({
  pathname,
  publicLanguageLinks,
  enableChat = true,
  showDashboardButton = true,
  organizationLogo,
  header,
  hideAnnouncement = false,
  flushContent = false,
  simpleFooter = false,
  children,
}: PublicLayoutProps) => {
  const { SHOW_ORG_LOGO } = useAppEnv()
  const normalizedPathname = stripPublicLanguagePrefix(pathname, Object.keys(useLanguagesEnv()))
  const isOrganizationPage = normalizedPathname === '/organization' || normalizedPathname.includes('/organization/')
  const footerBg = isOrganizationPage ? 'footer.bg.muted' : 'footer.bg'
  const showLimitedAnnouncementBanner = !hideAnnouncement && [Routes.root, Routes.plans].includes(normalizedPathname)

  return (
    <Flex position='relative' flexDirection='column' minH='dvh'>
      <Box as='header' position='sticky' top={0} w='full' backdropFilter='blur(40px)' zIndex='public-header'>
        <PageContainer w='full'>
          {header ?? (
            <Navbar
              publicLanguageLinks={publicLanguageLinks}
              showDashboardButton={showDashboardButton}
              organizationLogo={SHOW_ORG_LOGO ? organizationLogo : undefined}
            />
          )}
        </PageContainer>
      </Box>
      {enableChat ? <CrispChat /> : null}
      {showLimitedAnnouncementBanner && <AnnouncementBanner limited />}
      <PageContainer asChild>
        <Flex
          flexDirection='column'
          as='main'
          flexGrow={1}
          mt={flushContent ? undefined : { base: 4, lg: 6, xl: 10 }}
          mb={{ base: 20, lg: 32 }}
          w='full'
        >
          {children}
        </Flex>
      </PageContainer>
      {/* The band spans the window; its content keeps to the page column. */}
      <Box
        as='footer'
        w='full'
        bgColor={simpleFooter ? undefined : footerBg}
        backdropFilter={simpleFooter ? undefined : 'blur(40px)'}
      >
        <PageContainer w='full'>
          <Footer simplified={simpleFooter} />
        </PageContainer>
      </Box>
    </Flex>
  )
}

export default PublicLayout

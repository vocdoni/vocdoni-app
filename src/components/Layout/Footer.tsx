import { Box, Flex, Icon, Image, Link, Text } from '@chakra-ui/react'
import { Trans, useTranslation } from 'react-i18next'
import { DiscordIcon, GithubIcon, TwitterXIcon } from '~theme/icons'
import { useAppEnv } from '~src/app-env'
import vcdLogo from '/assets/logo-classic.svg'

const Footer = ({ simplified }: { simplified?: boolean }) => {
  const { t } = useTranslation()
  const appEnv = useAppEnv()
  const privacyPolicyUrl = appEnv.PRIVACY_POLICY_URL
  const termsOfServiceUrl = appEnv.TERMS_OF_SERVICE_URL

  return (
    <>
      <Flex pt={6} flexDirection={{ base: 'column', xl: 'row' }} alignItems='start' pb={{ base: 12, xl: 6 }} gap={6}>
        <Box flex='1 1 33%'>
          <Link href='https://www.vocdoni.io' target='_blank' rel='noopener noreferrer' display='inline-block'>
            <Image src={vcdLogo} w='125px' mb={3} _dark={{ filter: 'invert(100%)' }} alt={t('vocdoni_logo')} />
          </Link>
          <Text fontSize='md' lineHeight={1.75}>
            {t('footer.footer_subtitle')}
          </Text>
        </Box>
        {!simplified && (
          <Flex
            flex='1 1 67%'
            flexDirection={{ base: 'column', sm: 'row' }}
            justifyContent={{ sm: 'space-between', lg: 'space-between' }}
            gap={{ base: 8, sm: 0 }}
            mt={1}
            ml={{ xl: 10 }}
            w='full'
          >
            <Flex
              flexDirection={{ base: 'column', sm: 'row' }}
              justifyContent='space-between'
              gap={{ base: '0px', xl: 24 }}
              w='full'
            >
              <Text fontWeight='bold' fontSize='lg' lineHeight={1.15} mb={4} display='none'>
                {t('footer.company')}
              </Text>
              <Link
                emphasis='strong'
                variant='footer'
                href='https://www.vocdoni.io'
                target='_blank'
                rel='noopener noreferrer'
              >
                Vocdoni
              </Link>
              <Link
                emphasis='strong'
                variant='footer'
                href='https://www.vocdoni.io/contact'
                target='_blank'
                rel='noopener noreferrer'
              >
                {t('footer.contact')}
              </Link>
              <Link
                emphasis='strong'
                variant='footer'
                href='https://blog.vocdoni.io'
                target='_blank'
                rel='noopener noreferrer'
              >
                Blog
              </Link>
            </Flex>
          </Flex>
        )}
      </Flex>
      <Flex
        width='full'
        m='0 auto'
        flexDirection={{ base: 'column', md: 'row' }}
        gap={{ base: 5, md: 2.5 }}
        justifyContent='space-between'
        alignItems='center'
        py={3}
        borderTop='1px solid'
        borderTopColor='border'
      >
        <Text as='span' textAlign='center'>
          <Trans
            i18nKey='footer.terms_and_privacy'
            components={{
              link1: <Link href={termsOfServiceUrl} target='_blank' rel='noopener noreferrer' tone='muted' />,
              link2: <Link href={privacyPolicyUrl} target='_blank' rel='noopener noreferrer' tone='muted' />,
            }}
          />
        </Text>
        <Flex gap={2.5}>
          <Link
            variant='icon'
            href='https://twitter.com/vocdoni'
            target='_blank'
            rel='noopener noreferrer'
            aria-label={t('link.twitter')}
          >
            <Icon as={TwitterXIcon} />
          </Link>

          <Link
            variant='icon'
            href='https://chat.vocdoni.io/'
            target='_blank'
            rel='noopener noreferrer'
            aria-label={t('link.discord')}
          >
            <Icon as={DiscordIcon} />
          </Link>

          <Link
            variant='icon'
            href='https://github.com/vocdoni'
            target='_blank'
            rel='noopener noreferrer'
            aria-label={t('link.github')}
          >
            <Icon as={GithubIcon} />
          </Link>
        </Flex>
      </Flex>
    </>
  )
}

export default Footer

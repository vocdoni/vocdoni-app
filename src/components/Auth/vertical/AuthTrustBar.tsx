import { Flex, Image, Stack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import type { ResolvedVertical } from './types'

/** Logos beyond this are dropped at the narrower breakpoints rather than wrapped onto a second row. */
const VisibleLogos = { base: 5, md: 8 }

/**
 * Social proof under the login card, at every breakpoint — on mobile the showcase panel is hidden,
 * so this is the only place customer logos appear.
 *
 * The logos sit on a muted disc because several of them are transparent or white PNGs converted to
 * webp, which vanish against a dark background on their own.
 */
const AuthTrustBar = ({ vertical }: { vertical: ResolvedVertical }) => {
  const { t } = useTranslation()
  const { copy, logos } = vertical

  if (!logos.length) return null

  return (
    <Stack gap={4} mt={6} align={{ base: 'center', md: 'flex-start' }}>
      <Text fontSize='sm' color='fg.muted' textAlign={{ base: 'center', md: 'left' }} maxW='2xl'>
        {copy.trustBar}
      </Text>
      <Flex gap={{ base: 2, md: 3 }} wrap='wrap' justify={{ base: 'center', md: 'flex-start' }}>
        {logos.map((logo, index) => (
          <Image
            key={logo.id}
            src={logo.src}
            alt={t('alt.images.org_logo', { defaultValue: '{{org}} logo', org: logo.name })}
            title={logo.name}
            display={{
              base: index < VisibleLogos.base ? 'block' : 'none',
              md: index < VisibleLogos.md ? 'block' : 'none',
              lg: 'block',
            }}
            boxSize={{ base: '36px', md: '40px' }}
            flexShrink={0}
            borderRadius='full'
            objectFit='contain'
            bgColor='bg.muted'
            p={1}
            filter='grayscale(1)'
            opacity={0.75}
            transition='filter 0.2s, opacity 0.2s'
            _hover={{ filter: 'grayscale(0)', opacity: 1 }}
          />
        ))}
      </Flex>
    </Stack>
  )
}

export default AuthTrustBar

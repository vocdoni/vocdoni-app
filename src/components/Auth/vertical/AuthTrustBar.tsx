import { Flex, Image, Stack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import type { ResolvedVertical } from './types'

/** Logos beyond this are dropped at the narrower breakpoints rather than wrapped onto a second row. */
const VisibleLogos = { base: 5, md: 8 }

/**
 * Social proof under the login card, at every breakpoint — on mobile the showcase panel is hidden,
 * so this is the only place customer logos appear.
 *
 * Same tile as the showcase attribution: a light rounded square, because the set mixes round
 * badges with square marks, crests and wordmarks, and several are dark artwork on a transparent
 * background that vanishes on a dark surface. Shown at full color and at rest — a grayscale row
 * that only resolves on hover says nothing on touch, and reads as an effect rather than a
 * customer list.
 */
const AuthTrustBar = ({ vertical }: { vertical: ResolvedVertical }) => {
  const { t } = useTranslation()
  const { copy, logos } = vertical

  if (!logos.length) return null

  return (
    <Stack gap={4} mt={6} align={{ base: 'center', md: 'flex-start' }}>
      <Text fontSize='xs' lineHeight='1.6' color='fg.muted' textAlign={{ base: 'center', md: 'left' }} maxW='2xl'>
        {copy.trustBar}
      </Text>
      <Flex gap={2} wrap='wrap' justify={{ base: 'center', md: 'flex-start' }}>
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
            boxSize={{ base: '38px', md: '42px' }}
            flexShrink={0}
            borderRadius='md'
            objectFit='contain'
            bgColor='auth.logo.tile.bg'
            border='1px solid'
            borderColor='auth.logo.tile.border'
            p={1.5}
          />
        ))}
      </Flex>
    </Stack>
  )
}

export default AuthTrustBar

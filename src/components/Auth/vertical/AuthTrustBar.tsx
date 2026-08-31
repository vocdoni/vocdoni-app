import { Flex, Image, Stack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import type { ResolvedVertical } from './types'

/** Logos beyond this are dropped at the narrower breakpoints rather than wrapped onto a second row. */
const VisibleLogos = { base: 5, md: 8 }

/**
 * Social proof under the login card, at every breakpoint — on mobile the showcase panel is hidden,
 * so this is the only place customer logos appear.
 *
 * Same tile treatment as the showcase attribution — a light rounded square, because the set mixes
 * round badges with square marks, crests and wordmarks, and several are dark artwork on a
 * transparent background that vanishes on a dark surface. Larger here, though: the attribution tile
 * sits beside two lines of text and is sized by them, while this row is the social proof itself and
 * has to be legible on its own. Crests carry detail — a club shield or a city coat of arms is
 * unreadable at thumbnail size — so the tile is sized for the busiest mark in the set, not the
 * simplest, and the inset is kept to the minimum that stops dark artwork touching the border.
 *
 * Shown at full color and at rest — a grayscale row that only resolves on hover says nothing on
 * touch, and reads as an effect rather than a customer list.
 */
const AuthTrustBar = ({ vertical }: { vertical: ResolvedVertical }) => {
  const { t } = useTranslation()
  const { copy, logos } = vertical

  if (!logos.length) return null

  return (
    <Stack gap={4} mt={6} align={{ base: 'center', md: 'flex-start' }}>
      {/* No max width: the sentence introduces the row below it and reads as one line with it. Capping
          the measure broke it into two, which on a line this quiet looks like a paragraph rather than
          a caption. It still wraps on mobile, where nothing fits on one line. */}
      <Text fontSize='xs' lineHeight='1.6' color='fg.muted' textAlign={{ base: 'center', md: 'left' }}>
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
            boxSize={{ base: '48px', md: '52px' }}
            flexShrink={0}
            borderRadius='lg'
            objectFit='contain'
            bgColor='auth.logo.tile.bg'
            border='1px solid'
            borderColor='auth.logo.tile.border'
            p={1}
          />
        ))}
      </Flex>
    </Stack>
  )
}

export default AuthTrustBar

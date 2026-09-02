import { Box, Flex, Heading, Image, Stack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LogoTones } from '~theme/logoTones'
import { TrustLogos } from './logos'
import type { ResolvedVertical } from './types'

/**
 * Quotes run from 135 to 398 characters across locales. A single type size either leaves the short
 * ones floating in empty space or pushes the long ones past the panel, so past this length the
 * quote drops a step and widens its measure. Purely presentational — it reads nothing but the
 * string.
 */
const LongQuote = 240

/**
 * The panel beside the login card, and the only place in the product that carries colour. The
 * organization's own logo is its single graphic — set large, bleeding off the bottom corner at low
 * opacity, and masked so it fades out before it reaches the type. It is decorative here (a `Box`
 * background, not an `Image`): the same logo is named for screen readers by the attribution tile
 * below, and announcing it twice would be noise.
 *
 * The surface is derived from that mark — the logo's own hue driven down to a deep, desaturated
 * tone (see `~theme/logoTones`), so field and watermark always agree instead of a fixed sector
 * colour fighting whatever the customer's brand happens to be. Flat, not a gradient, and dark in
 * both color modes, so the foreground never flips with the theme and the white card next to it
 * stays the focus. Organizations with no tone yet fall back to the vertical's accent.
 *
 * Deliberately no author portrait. Only three of the fifteen testimonials have one, and a panel
 * that changes shape depending on whether we happen to own a photo can't read as one design.
 *
 * Hidden below `md` — the card takes the full width there, and the trust bar carries the social
 * proof instead.
 */
const AuthShowcase = ({ vertical }: { vertical: ResolvedVertical }) => {
  const { t } = useTranslation()
  const { accent, copy, testimonial } = vertical
  const logo = testimonial ? TrustLogos[testimonial.logo] : undefined
  const isLongQuote = (testimonial?.quote.length ?? 0) > LongQuote
  const surface = (logo && LogoTones[logo.id]) ?? `${accent}.900`

  return (
    <Flex
      display={{ base: 'none', md: 'flex' }}
      position='relative'
      // Clips the bleeding watermark, and rounds its own outer corners to match the card's radius —
      // the card can't clip for it without also clipping the form column's dropdown menus.
      overflow='hidden'
      borderRightRadius='sm'
      flexDirection='column'
      justifyContent='center'
      flex={{ md: '0 0 48%', lg: '0 0 54%' }}
      minW={0}
      p={{ md: 8, lg: 12 }}
      bgColor={surface}
    >
      {logo && (
        <Box
          position='absolute'
          right={{ md: '-50px', lg: '-70px' }}
          bottom={{ md: '-40px', lg: '-55px' }}
          boxSize={{ md: '305px', lg: '420px' }}
          opacity={0.09}
          backgroundImage={`url(${logo.src})`}
          backgroundSize='contain'
          backgroundRepeat='no-repeat'
          // Fades the mark out towards the type instead of painting a scrim over it, which would
          // mean a third layer and would dull the panel tone along with the logo.
          css={{
            maskImage: 'linear-gradient(to left, #000 30%, transparent 85%)',
            WebkitMaskImage: 'linear-gradient(to left, #000 30%, transparent 85%)',
          }}
        />
      )}

      {!testimonial ? (
        // Reached only if every testimonial is dropped: a vertical with none of its own borrows the
        // whole pool rather than emptying. One sentence, not a per-vertical one — a state that needs
        // the entire quote library gone has nothing sector-specific left to say, and eight
        // translated variants of it would be eight nobody can ever see.
        <Heading
          size={{ md: 'md', lg: 'lg' }}
          fontWeight='bolder'
          letterSpacing='-0.4px'
          maxW='20ch'
          color='auth.showcase.fg'
        >
          {t('auth.showcase.fallback_headline', { defaultValue: 'Decisions your members can verify' })}
        </Heading>
      ) : (
        <Stack as='figure' position='relative' m={0} gap={{ md: 5, lg: 7 }} minW={0}>
          <Text
            fontSize='xs'
            fontWeight='bolder'
            textTransform='uppercase'
            letterSpacing='0.14em'
            color='auth.showcase.fg.muted'
          >
            {copy.label}
          </Text>
          {/* Deliberately unclamped: a quote cut mid-sentence reads as a bug, and the panel is a
              flex column in a stretch row, so a long one grows the card instead of overflowing. */}
          <Box
            as='blockquote'
            m={0}
            fontWeight='bold'
            lineHeight='1.4'
            letterSpacing='-0.3px'
            color='auth.showcase.fg'
            fontSize={isLongQuote ? { md: 'md', lg: 'xl' } : { md: 'lg', lg: '2xl' }}
            maxW={isLongQuote ? '40ch' : '32ch'}
          >
            {testimonial.quote}
          </Box>
          <Flex
            as='figcaption'
            align='center'
            gap={3}
            minW={0}
            pt={{ md: 5, lg: 6 }}
            borderTop='1px solid'
            borderColor='auth.showcase.rule'
          >
            {logo && (
              <Image
                src={logo.src}
                alt={t('alt.images.org_logo', { defaultValue: '{{org}} logo', org: logo.name })}
                boxSize='40px'
                flexShrink={0}
                // A tile, not a disc: the logo set mixes round badges with square marks, heraldic
                // crests and wordmarks, and a circle clips or strands everything that isn't round.
                borderRadius='md'
                objectFit='contain'
                bgColor='auth.logo.tile.bg'
                p='5px'
              />
            )}
            <Box minW={0}>
              <Text fontSize='sm' fontWeight='bolder' color='auth.showcase.fg'>
                {testimonial.author}
              </Text>
              <Text fontSize='xs' lineHeight='1.35' color='auth.showcase.fg.muted'>
                {testimonial.position} · {testimonial.company}
              </Text>
            </Box>
          </Flex>
        </Stack>
      )}
    </Flex>
  )
}

export default AuthShowcase

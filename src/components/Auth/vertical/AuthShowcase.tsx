import { Box, Flex, Heading, Icon, Image, Stack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuQuote } from 'react-icons/lu'
import { TrustLogos } from './logos'
import type { ResolvedVertical } from './types'

/**
 * The panel beside the login card. Dark in both color modes: it sits on a vertical accent gradient,
 * so its foreground never flips with the theme, and the white card next to it stays the focus.
 *
 * Hidden below `md` — the card takes the full width there, and the trust bar carries the social
 * proof instead.
 */
const AuthShowcase = ({ vertical }: { vertical: ResolvedVertical }) => {
  const { t } = useTranslation()
  const { accent, copy, testimonial } = vertical
  const logo = testimonial ? TrustLogos[testimonial.logo] : undefined
  const portrait = testimonial?.portrait

  return (
    <Flex
      display={{ base: 'none', md: 'flex' }}
      position='relative'
      overflow='hidden'
      flexDirection='column'
      justifyContent='flex-end'
      flex={{ md: '0 0 48%', lg: '0 0 54%' }}
      minW={0}
      bgGradient='to-br'
      gradientFrom={`${accent}.700`}
      gradientVia='brand.650'
      gradientTo='brand.550'
    >
      {portrait && (
        <Image
          src={portrait}
          alt={t('alt.images.testimonial_portrait', {
            defaultValue: 'Portrait of {{author}}',
            author: testimonial.author,
          })}
          position='absolute'
          inset={0}
          w='full'
          h='full'
          objectFit='cover'
          objectPosition={testimonial.portraitPosition ?? 'center'}
        />
      )}
      {/* Scrim. Without a photo the gradient already carries the contrast, so it only needs to
          deepen the bottom where the quote sits. */}
      <Box
        position='absolute'
        inset={0}
        bgGradient='to-t'
        gradientFrom={portrait ? 'black/90' : 'black/70'}
        gradientVia={portrait ? 'black/70' : 'black/30'}
        gradientTo={portrait ? 'black/50' : 'transparent'}
      />
      {/* Dot grid + accent glow: texture without shipping an asset */}
      <Box
        position='absolute'
        inset={0}
        color='white'
        opacity={0.07}
        backgroundImage='radial-gradient(currentColor 1px, transparent 1px)'
        backgroundSize='18px 18px'
      />
      {!portrait && (
        <Box
          position='absolute'
          top='-20%'
          left='-15%'
          boxSize='60%'
          borderRadius='full'
          bgColor={`${accent}.500`}
          opacity={0.28}
          filter='blur(80px)'
        />
      )}

      <Stack position='relative' gap={{ md: 4, lg: 5 }} p={{ md: 8, lg: 10 }} minW={0}>
        <Text
          fontSize='xs'
          fontWeight='bolder'
          textTransform='uppercase'
          letterSpacing='0.14em'
          color={`${accent}.200`}
        >
          {copy.label}
        </Text>
        <Heading size={{ md: 'lg', lg: 'xl' }} color='auth.showcase.fg' letterSpacing='-0.6px'>
          {copy.headline}
        </Heading>

        {testimonial && (
          <Stack gap={3} pt={{ md: 1, lg: 2 }}>
            <Flex align='center' gap={3}>
              {logo && (
                <Image
                  src={logo.src}
                  alt={t('alt.images.org_logo', { defaultValue: '{{org}} logo', org: logo.name })}
                  boxSize={portrait ? { md: '44px', lg: '52px' } : { md: '64px', lg: '80px' }}
                  flexShrink={0}
                  borderRadius='full'
                  objectFit='contain'
                  bgColor='white'
                  p={1}
                  outline='1px solid'
                  outlineColor='auth.showcase.ring'
                />
              )}
              <Icon as={LuQuote} boxSize={7} color={`${accent}.300`} opacity={0.7} aria-hidden />
            </Flex>
            {/* Deliberately unclamped: a quote cut mid-sentence reads as a bug, and the panel is a
                flex column in a stretch row, so a long one grows the card instead of overflowing. */}
            <Text fontSize={{ md: 'md', lg: 'lg' }} fontWeight='bold' color='auth.showcase.fg'>
              {testimonial.quote}
            </Text>
            <Text fontSize='sm' color='auth.showcase.fg.muted'>
              — {testimonial.author}, {testimonial.position} @ {testimonial.company}
            </Text>
          </Stack>
        )}
      </Stack>
    </Flex>
  )
}

export default AuthShowcase

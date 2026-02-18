import { Box, Flex, Heading, Icon, Link, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LuArrowLeft } from 'react-icons/lu'
import { Outlet, Link as RouterLink, To, useLocation } from 'react-router-dom'
import { Routes } from '~routes'

export type NavigationFunctionParams = To | number

export type AuthOutletContextType = {
  setTitle: React.Dispatch<React.SetStateAction<string>>
  setSubtitle: React.Dispatch<React.SetStateAction<string>>
}

export const useTestimonials = () => {
  const { t } = useTranslation()

  const testimonials = [
    {
      image: '/assets/testimonials/ceec.webp',
      text: t('testimonials.ceec.text', {
        defaultValue:
          'We chose Vocdoni because it guarantees secure, reliable, and transparent participation for all our members in our Annual General Meeting.',
      }),
      author: 'Ton Barnils',
      position: t('testimonials.ceec.position', { defaultValue: 'CEO' }),
      company: 'Centre Excursionista de Catalunya',
    },
    {
      image: '/assets/testimonials/bellpuig.png',
      text: t('testimonials.bellpuig.text', {
        defaultValue:
          'We chose Vocdoni because we believe this is the future of what real elections of any kind should be. Electronic voting is open to everyone and makes the voting process easier for citizens.',
      }),
      author: 'Jordi Estiarte',
      position: t('testimonials.bellpuig.position', { defaultValue: 'Mayor' }),
      company: t('testimonials.bellpuig.company', { defaultValue: 'Bellpuig City Council' }),
    },
    {
      image: '/assets/testimonials/eic.png',
      text: t('testimonials.eic.text', {
        defaultValue:
          'Vocdoni provides us with an easy, secure, anonymous, scalable voting system that is fully integrated into our institutional environment. We will certainly continue to trust their solution.',
      }),
      author: 'Oscar Tirvió',
      position: t('testimonials.eic.position', { defaultValue: 'IT Director' }),
      company: t('testimonials.eic.company', { defaultValue: 'Enginyers Industrials de Catalunya' }),
    },
  ]

  const getRandomTestimonial = () => testimonials[Math.floor(Math.random() * testimonials.length)]
  const [testimonial] = useState(() => getRandomTestimonial())

  return { testimonials, getRandomTestimonial, testimonial }
}

const LayoutAuth = () => {
  const [title, setTitle] = useState<string | null>(null)
  const [subtitle, setSubtitle] = useState<string | null>(null)
  const { testimonial } = useTestimonials()
  const { pathname } = useLocation()
  const isSignin = pathname === Routes.auth.signIn

  return (
    <Flex justifyContent='center' alignItems='center' minH='100vh' p={{ base: 6, md: 10 }}>
      <Flex w='full' maxW={{ base: 'sm', md: '3xl' }} flexDir='column' gap={2}>
        <Link asChild display='flex' alignItems='center' alignSelf='start'>
          <RouterLink to={isSignin ? Routes.vocdoni : Routes.auth.signIn}>
            <Icon as={LuArrowLeft} />
            {isSignin ? <Trans i18nKey='common.home'>Home</Trans> : <Trans i18nKey='common.back'>Back</Trans>}
          </RouterLink>
        </Link>
        <Flex
          w='full'
          maxW={{ base: 'sm', md: '3xl' }}
          _light={{ border: '1px solid', borderColor: 'auth.card.border' }}
          borderRadius='sm'
          bgColor='auth.card.bg'
        >
          <Box p={{ base: 6, sm: 8 }} flex={{ base: '1 1 100%', md: '0 0 50%' }}>
            {(title || subtitle) && (
              <Box mb={6}>
                {title && (
                  <Heading size='lg' mb={1} letterSpacing={'-0.6px'}>
                    {title}
                  </Heading>
                )}
                {subtitle && (
                  <Text color='gray.500' fontSize='sm'>
                    {subtitle}
                  </Text>
                )}
              </Box>
            )}
            <Outlet context={{ setTitle, setSubtitle } satisfies AuthOutletContextType} />
          </Box>
          <Flex
            position='relative'
            flexDirection='column'
            flex={'0 0 50%'}
            display={{ base: 'none', md: 'block' }}
            bgImage={`linear-gradient(to top, rgb(17 24 39 / 0.8), rgb(17 24 39 / 0.3)), url(${testimonial.image})`}
            bgSize='cover'
            backgroundPosition='center'
            minH='100%'
            borderRightRadius='sm'
          >
            <Box position='absolute' left={0} bottom={0} right={0} p={8}>
              <Text bottom={0} fontSize='lg' fontWeight='bold' mb={2} color='gray.100'>
                {testimonial.text}
              </Text>
              <Text color='gray.400' fontSize='sm'>
                — {testimonial.author}, {testimonial.position} @ {testimonial.company}
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default LayoutAuth

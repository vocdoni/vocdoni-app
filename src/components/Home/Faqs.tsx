import { Box, BoxProps, Button, Card, Flex, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const Faqs = (props: BoxProps) => {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)
  const faqs = [
    {
      title: t('home.faqs.faq_1.title'),
      description: t('home.faqs.faq_1.description'),
    },
    {
      title: t('home.faqs.faq_2.title'),
      description: t('home.faqs.faq_2.description'),
    },
    {
      title: t('home.faqs.faq_3.title'),
      description: t('home.faqs.faq_3.description'),
    },
    {
      title: t('home.faqs.faq_4.title'),
      description: t('home.faqs.faq_4.description'),
    },
    {
      title: t('home.faqs.faq_5.title'),
      description: t('home.faqs.faq_5.description'),
    },
    {
      title: t('home.faqs.faq_6.title'),
      description: t('home.faqs.faq_6.description'),
    },
    {
      title: t('home.faqs.faq_7.title'),
      description: t('home.faqs.faq_7.description'),
    },
    {
      title: t('home.faqs.faq_8.title'),
      description: t('home.faqs.faq_8.description'),
    },
    {
      title: t('home.faqs.faq_9.title'),
      description: t('home.faqs.faq_9.description'),
    },
    {
      title: t('home.faqs.faq_10.title'),
      description: t('home.faqs.faq_10.description'),
    },
    {
      title: t('home.faqs.faq_11.title'),
      description: t('home.faqs.faq_11.description'),
    },
    {
      title: t('home.faqs.faq_12.title'),
      description: t('home.faqs.faq_12.description'),
    },
    {
      title: t('home.faqs.faq_13.title'),
      description: t('home.faqs.faq_13.description'),
    },
    {
      title: t('home.faqs.faq_14.title'),
      description: t('home.faqs.faq_14.description'),
    },
    {
      title: t('home.faqs.faq_15.title'),
      description: t('home.faqs.faq_15.description'),
    },
    {
      title: t('home.faqs.faq_16.title'),
      description: t('home.faqs.faq_16.description'),
    },
    {
      title: t('home.faqs.faq_17.title'),
      description: t('home.faqs.faq_17.description'),
    },
    {
      title: t('home.faqs.faq_18.title'),
      description: t('home.faqs.faq_18.description'),
    },
    {
      title: t('home.faqs.faq_19.title'),
      description: t('home.faqs.faq_19.description'),
    },
    {
      title: t('home.faqs.faq_20.title'),
      description: t('home.faqs.faq_20.description'),
    },
    {
      title: t('home.faqs.faq_21.title'),
      description: t('home.faqs.faq_21.description'),
    },
    {
      title: t('home.faqs.faq_22.title'),
      description: t('home.faqs.faq_22.description'),
    },
    {
      title: t('home.faqs.faq_23.title'),
      description: t('home.faqs.faq_23.description'),
    },
    {
      title: t('home.faqs.faq_24.title'),
      description: t('home.faqs.faq_24.description'),
    },
    {
      title: t('home.faqs.faq_25.title'),
      description: t('home.faqs.faq_25.description'),
    },
    {
      title: t('home.faqs.faq_26.title'),
      description: t('home.faqs.faq_26.description'),
    },
    {
      title: t('home.faqs.faq_27.title'),
      description: t('home.faqs.faq_27.description'),
    },
    {
      title: t('home.faqs.faq_28.title'),
      description: t('home.faqs.faq_28.description'),
    },
    {
      title: t('home.faqs.faq_29.title'),
      description: t('home.faqs.faq_29.description'),
    },
    {
      title: t('home.faqs.faq_30.title'),
      description: t('home.faqs.faq_30.description'),
    },
    {
      title: t('home.faqs.faq_31.title'),
      description: t('home.faqs.faq_31.description'),
    },
    {
      title: t('home.faqs.faq_32.title'),
      description: t('home.faqs.faq_32.description'),
    },
    {
      title: t('home.faqs.faq_33.title'),
      description: t('home.faqs.faq_33.description'),
    },
    {
      title: t('home.faqs.faq_34.title'),
      description: t('home.faqs.faq_34.description'),
    },
    {
      title: t('home.faqs.faq_35.title'),
      description: t('home.faqs.faq_35.description'),
    },
    {
      title: t('home.faqs.faq_36.title'),
      description: t('home.faqs.faq_36.description'),
    },
    {
      title: t('home.faqs.faq_37.title'),
      description: t('home.faqs.faq_37.description'),
    },
    {
      title: t('home.faqs.faq_38.title'),
      description: t('home.faqs.faq_38.description'),
    },
    {
      title: t('home.faqs.faq_39.title'),
      description: t('home.faqs.faq_39.description'),
    },
    {
      title: t('home.faqs.faq_40.title'),
      description: t('home.faqs.faq_40.description'),
    },
    {
      title: t('home.faqs.faq_41.title'),
      description: t('home.faqs.faq_41.description'),
    },
    {
      title: t('home.faqs.faq_42.title'),
      description: t('home.faqs.faq_42.description'),
    },
    {
      title: t('home.faqs.faq_43.title'),
      description: t('home.faqs.faq_43.description'),
    },
    {
      title: t('home.faqs.faq_44.title'),
      description: t('home.faqs.faq_44.description'),
    },
    {
      title: t('home.faqs.faq_10.title'),
      description: t('home.faqs.faq_10.description'),
    },
    {
      title: t('home.faqs.faq_45.title'),
      description: t('home.faqs.faq_45.description'),
    },
  ]

  return (
    <Box position='relative' width='full' {...props}>
      <Box width='full' m='0 auto' maxW='1920px' position='relative' zIndex={10}>
        <Text
          fontSize={{ base: '32px', xl: '42px' }}
          lineHeight={{ base: '36px', xl: '46px' }}
          fontWeight='bold'
          textAlign='center'
          mb='10px'
        >
          {t('home.faqs.title')}
        </Text>
        <Text
          mb='60px'
          maxW={{ base: '100%', sm: '70%', md: '80%', lg: '840px' }}
          mx='auto'
          fontSize='xl'
          color='fg.muted'
          lineHeight={1.4}
          textAlign='center'
        >
          {t('home.faqs.subtitle')}
        </Text>
        <Flex flexWrap={'wrap'} gap={6}>
          {faqs.map((el, idx) => {
            if (!showAll && idx > 7) return null
            return (
              <Card.Root key={idx} variant='faqs' flex={{ base: '1 1 100%', lg: '1 1 45%' }}>
                <Card.Header>{el.title}</Card.Header>
                <Card.Body>{el.description}</Card.Body>
              </Card.Root>
            )
          })}
        </Flex>
        <Button mx='auto' mt={4} onClick={() => setShowAll((prev) => !prev)}>
          {showAll ? t('home.faqs.show_less') : t('home.faqs.show_more')}
        </Button>
      </Box>
    </Box>
  )
}

export default Faqs

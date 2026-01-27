import { Box, Card, Flex, Image, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

const Benefits = () => {
  const { t } = useTranslation()

  return (
    <Box as='section' id='benefits' width='full' mx='auto' mb={{ base: '100px', lg: '160px' }}>
      <Text
        fontSize={{ base: '40px', xl: '46px' }}
        lineHeight={{ base: '36px', xl: '50px' }}
        fontWeight='bold'
        textAlign='center'
        mb={'30px'}
        fontFamily='basier'
      >
        {t('home.benefits.title')}
      </Text>
      <Text mb={'60px'} maxW={'90%'} mx='auto' textAlign='center' fontFamily='basier' fontSize='20px' lineHeight='28px'>
        {t('home.benefits.subtitle_1')}
      </Text>

      <Flex flexWrap='wrap' justifyContent='center' maxW='1240px' mx='auto' gap={'30px'}>
        <Card.Root variant='benefits'>
          <Image
            role='none'
            src='https://assets-global.website-files.com/6398d7c1bcc2b775ebaa4f2f/6398f29a3e8913631fd48de5_card-feature-img-control.png'
          />
          <Card.Header>{t('home.benefits.card_1.title')}</Card.Header>
          <Card.Body>{t('home.benefits.card_1.description')}</Card.Body>
        </Card.Root>

        <Card.Root variant='benefits'>
          <Image
            role='none'
            src='https://assets-global.website-files.com/6398d7c1bcc2b775ebaa4f2f/6398f29a7812b3fd5db1d246_card-feature-img-agile.png'
          />
          <Card.Header>{t('home.benefits.card_2.title')}</Card.Header>
          <Card.Body>{t('home.benefits.card_2.description')}</Card.Body>
        </Card.Root>

        <Card.Root variant='benefits'>
          <Image
            role='none'
            src='https://assets-global.website-files.com/6398d7c1bcc2b775ebaa4f2f/6398f29ae37bf52a3ec72b34_card-feature-img-privacy.png'
          />
          <Card.Header>{t('home.benefits.card_3.title')}</Card.Header>
          <Card.Body>{t('home.benefits.card_3.description')}</Card.Body>
        </Card.Root>

        <Card.Root variant='benefits'>
          <Image
            role='none'
            src='https://assets-global.website-files.com/6398d7c1bcc2b775ebaa4f2f/6398f29a2fc101547d4ca362_card-feature-img-anonymous.png'
          />
          <Card.Header>{t('home.benefits.card_4.title')}</Card.Header>
          <Card.Body>{t('home.benefits.card_4.description')}</Card.Body>
        </Card.Root>

        <Card.Root variant='benefits'>
          <Image
            role='none'
            src='https://assets-global.website-files.com/6398d7c1bcc2b775ebaa4f2f/6398f29a2c93ed6cd6d1faf0_card-feature-img-guarantee.png'
          />
          <Card.Header>{t('home.benefits.card_5.title')}</Card.Header>
          <Card.Body>{t('home.benefits.card_5.description')}</Card.Body>
        </Card.Root>

        <Card.Root variant='benefits'>
          <Image
            role='none'
            src='https://assets-global.website-files.com/6398d7c1bcc2b775ebaa4f2f/6398f29ad60f67fa065d02bd_card-feature-img-accesible.png'
          />
          <Card.Header>{t('home.benefits.card_6.title')}</Card.Header>
          <Card.Body>{t('home.benefits.card_6.description')}</Card.Body>
        </Card.Root>
      </Flex>
    </Box>
  )
}

export default Benefits

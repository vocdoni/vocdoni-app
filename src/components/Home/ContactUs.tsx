import { Box, Card, Flex, Image, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { FaFingerprint } from 'react-icons/fa'
import { MdDesignServices } from 'react-icons/md'
import ContactButton from '~components/shared/ContactLink'
import advFeature from '/assets/vocdoni.jpeg'

const ContactUs = () => {
  const { t } = useTranslation()

  return (
    <Flex
      as='section'
      id='contactus'
      flexDirection={{ base: 'column', xl: 'row' }}
      mb={{ base: '100px', lg: '160px' }}
      gap={{ base: '100px', lg: '60px', xl: '120px' }}
      scrollMarginTop='100px'
      minH={{ base: '60vh' }}
    >
      <Box
        flex='1 1'
        flexBasis={{ lg: '45%' }}
        position='relative'
        display={'flex'}
        justifyContent={'center'}
        alignItems={'center'}
        maxW={{ base: '400px', xl: 'none' }}
        mx='auto'
      >
        <Image role='none' src={advFeature} borderRadius='xl' />
      </Box>
      <Flex
        flex='1 1 40%'
        justifyContent={{ base: 'center', xl: 'start' }}
        display={{ xl: 'flex' }}
        alignItems='center'
        position='relative'
        zIndex={10}
      >
        <Flex
          flexDirection='column'
          gap='30px'
          maxW={{ base: 'full', xl: '960px' }}
          px={{ base: '30px', xl: 0 }}
          pr={{ xl: '37px', '2xl': 0 }}
        >
          <Box>
            <Text
              fontSize={{ base: '32px', xl: '42px' }}
              lineHeight={{ base: '36px', xl: '46px' }}
              fontWeight='bold'
              fontFamily='basier'
              textAlign={{ base: 'center', xl: 'left' }}
              marginBottom='10px'
            >
              {t('home.contactus.title')}
            </Text>
          </Box>
          <Card.Root variant='icon-card' mt='10px'>
            <Card.Body>
              <Box>
                <MdDesignServices />
              </Box>
              <Box>
                <Text style={{ fontSize: '22px', marginTop: '6px', marginBottom: '6px' }}>
                  {t('home.contactus.card_1.title')}
                </Text>
                <Text>{t('home.contactus.card_1.description')}</Text>
              </Box>
            </Card.Body>
          </Card.Root>
          <Card.Root variant='icon-card'>
            <Card.Body>
              <Box>
                <FaFingerprint />
              </Box>
              <Box>
                <Text style={{ fontSize: '22px', marginTop: '6px', marginBottom: '6px' }}>
                  {t('home.contactus.card_2.title')}
                </Text>
                <Text>{t('home.contactus.card_2.description')}</Text>
              </Box>
            </Card.Body>
          </Card.Root>
          <Card.Root variant='icon-card' mb={'30px'}>
            <Card.Body>
              <Box>
                <FaFingerprint />
              </Box>
              <Box>
                <Text style={{ fontSize: '22px', marginTop: '6px', marginBottom: '6px' }}>
                  {t('home.contactus.card_3.title', {
                    defaultValue: 'Expert Guidance',
                  })}
                </Text>
                <Text>
                  {t('home.contactus.card_3.description', {
                    defaultValue: 'We advise you throughout the process to ensure a flawless voting experience.',
                  })}
                </Text>
              </Box>
            </Card.Body>
          </Card.Root>

          <ContactButton
            w={{ base: 'full', sm: 'fit-content', xl: 'full' }}
            mx='auto'
            aria-label={t('home.contactus.btn')}
            title={t('home.contactus.btn')}
            height='52px'
            fontSize='20px'
            px={{ md: '130px' }}
          >
            {t('home.contactus.btn')}
          </ContactButton>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default ContactUs

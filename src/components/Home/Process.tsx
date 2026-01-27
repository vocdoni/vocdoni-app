import { Box, Card, Flex, Image, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import {
  PiNumberSquareFourFill,
  PiNumberSquareOneFill,
  PiNumberSquareThreeFill,
  PiNumberSquareTwoFill,
} from 'react-icons/pi'
import process from '/assets/vocdoni_usage.jpg'

const Process = () => {
  const { t } = useTranslation()

  return (
    <Box as='section' width='full' m='0 auto' mb={{ base: '100px', lg: '160px' }} minH={{ base: '75vh' }}>
      <Text
        fontSize={{ base: '40px', xl: '46px' }}
        lineHeight={{ base: '36px', xl: '50px' }}
        fontWeight='bold'
        mb={'30px'}
        fontFamily='basier'
        textAlign='center'
      >
        {t('home.process.title')}
      </Text>
      <Text mb={'60px'} maxW={'90%'} mx='auto' textAlign='center' fontFamily='basier' fontSize='20px' lineHeight='28px'>
        {t('home.process.description_1')}
        {t('home.process.description_2')}
      </Text>
      <Flex flexDirection={{ base: 'column', lg: 'row' }} gap={{ base: '60px', lg: '30px' }}>
        <Flex flex='1 1 40%' justifyContent={{ base: 'center', lg: 'end' }} alignItems='center'>
          <Image
            role='none'
            src={process}
            borderRadius='lg'
            maxW={{ base: '350px', xl: '550px' }}
            m={{ base: '-20px auto 0px' }}
          />
        </Flex>
        <Flex
          flex='1 1'
          flexBasis={{ lg: '45%' }}
          flexDirection='column'
          justifyContent='space-between'
          alignItems={{ base: 'center', lg: 'start' }}
          gap='40px'
        >
          <Card.Root variant='icon-card' maxW={{ base: '700px' }}>
            <Card.Body>
              <Box>
                <PiNumberSquareOneFill />
              </Box>
              <Box>
                <Text>{t('home.process.step_1.title')}</Text>
                <Text textAlign='justify'>{t('home.process.step_1.description')}</Text>
              </Box>
            </Card.Body>
          </Card.Root>
          <Card.Root variant='icon-card' maxW={{ base: '700px' }}>
            <Card.Body>
              <Box>
                <PiNumberSquareTwoFill />
              </Box>
              <Box>
                <Text>{t('home.process.step_2.title')}</Text>
                <Text textAlign='justify'>{t('home.process.step_2.description')}</Text>
              </Box>
            </Card.Body>
          </Card.Root>
          <Card.Root variant='icon-card' maxW={{ base: '700px' }}>
            <Card.Body>
              <Box>
                <PiNumberSquareThreeFill />
              </Box>
              <Box>
                <Text>{t('home.process.step_3.title')}</Text>
                <Text textAlign='justify'>{t('home.process.step_3.description')}</Text>
              </Box>
            </Card.Body>
          </Card.Root>
          <Card.Root variant='icon-card' maxW={{ base: '700px' }}>
            <Card.Body>
              <Box>
                <PiNumberSquareFourFill color='#fff' />
              </Box>
              <Box>
                <Text>{t('home.process.step_4.title')}</Text>
                <Text textAlign='justify'>{t('home.process.step_4.description')}</Text>
              </Box>
            </Card.Body>
          </Card.Root>
        </Flex>
      </Flex>
    </Box>
  )
}
export default Process

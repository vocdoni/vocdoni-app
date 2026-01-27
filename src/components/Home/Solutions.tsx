import { Box, Card, Flex, Image, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { FaCircleCheck } from 'react-icons/fa6'
import solutions from '/assets/solutions.png'

const Solutions = () => {
  const { t } = useTranslation()

  return (
    <Box as='section' width='full' m='0 auto' mb={{ base: '100px', lg: '200px' }}>
      <Flex
        flexDirection={{ base: 'column', xl: 'row' }}
        gap={{ lg: '20px', xl: '120px' }}
        margin={{ base: '0px auto' }}
      >
        <Box flex='1 1' flexBasis={{ xl: '45%' }} order={{ base: 2, xl: 1 }}>
          <Box>
            <Text
              fontSize={{ base: '40px', xl: '46px' }}
              lineHeight={{ base: '36px', xl: '50px' }}
              fontWeight='bold'
              mb={'30px'}
              fontFamily='basier'
              textAlign={{ base: 'center', xl: 'start' }}
            >
              {t('home.solutions.title')}
            </Text>
            <Text textAlign={{ base: 'center', xl: 'start' }} fontFamily='basier' lineHeight='28px' mb={'60px'}>
              {t('home.solutions.subtitle_1')}
            </Text>
          </Box>
          <Flex flexDirection='column' gap={{ base: '45px', lg: '30px' }}>
            <Card.Root variant='image-card'>
              <Card.Body>
                <Box>
                  <Image
                    role='none'
                    src='https://assets-global.website-files.com/6398d7c1bcc2b775ebaa4f2f/6398d7c1bcc2b771a2aa4f48_large-organizations-api-icon.svg'
                  />
                </Box>
                <Box>
                  <Text>{t('home.solutions.card_1.title')}</Text>
                  <Text>{t('home.solutions.card_1.description')}</Text>
                </Box>
              </Card.Body>
            </Card.Root>
            <Card.Root variant='image-card'>
              <Card.Body>
                <Box>
                  <Image
                    role='none'
                    src='https://assets-global.website-files.com/6398d7c1bcc2b775ebaa4f2f/6398d7c1bcc2b73337aa4f63_services-suppliers-icon.svg'
                  />
                </Box>
                <Box>
                  <Text>{t('home.solutions.card_2.title')}</Text>
                  <Text>{t('home.solutions.card_2.description')}</Text>
                </Box>
              </Card.Body>
            </Card.Root>
            <Card.Root variant='image-card'>
              <Card.Body>
                <Box>
                  <Image
                    role='none'
                    src='https://assets-global.website-files.com/6398d7c1bcc2b775ebaa4f2f/6398d7c1bcc2b79b4caa4f51_gov-institutions-api-icon.svg'
                  />
                </Box>
                <Box>
                  <Text>{t('home.solutions.card_3.title')}</Text>
                  <Text>{t('home.solutions.card_3.description')}</Text>
                </Box>
              </Card.Body>
            </Card.Root>
          </Flex>
        </Box>
        <Flex
          flex='1 1 40%'
          justifyContent={{ base: 'center', xl: 'start' }}
          alignItems='center'
          order={{ base: 1, xl: 2 }}
          mb={{ base: '100px', xl: 0 }}
        >
          <Image role='none' src={solutions} borderRadius='lg' maxW={{ base: '250px', xl: '550px' }} />
          <Box position={'absolute'}>
            <Card.Root variant='solutions' mb={4}>
              <FaCircleCheck size={22} />
              <Text as='span'> {t('home.solutions.img_card_1')}</Text>
            </Card.Root>
            <Card.Root variant='solutions' mb={4}>
              <FaCircleCheck size={22} />
              <Text as='span'> {t('home.solutions.img_card_2')}</Text>
            </Card.Root>
            <Card.Root variant='solutions'>
              <FaCircleCheck size={22} />
              <Text as='span' whiteSpace={{ sm: 'nowrap' }}>
                {t('home.solutions.img_card_3')}
              </Text>
            </Card.Root>
          </Box>
        </Flex>
      </Flex>
    </Box>
  )
}
export default Solutions

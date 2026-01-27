import { Box, Card, Flex, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import {
  FaBullseye,
  FaCubes,
  FaLanguage,
  FaNewspaper,
  FaPalette,
  FaTasks,
  FaUserLock,
  FaUsers,
  FaVoteYea,
} from 'react-icons/fa'

const Features = () => {
  const { t } = useTranslation()

  return (
    <Box id='features' width='full' mb={{ base: '100px', xl: '200px' }}>
      <Box mx='auto'>
        <Text
          fontSize={{ base: '32px', xl: '42px' }}
          lineHeight={{ base: '36px', xl: '46px' }}
          fontWeight='bold'
          textAlign='center'
          mb={'30px'}
          fontFamily='basier'
        >
          {t('home.features.title')}
        </Text>
        <Text
          maxW={'90%'}
          mx='auto'
          mb={'60px'}
          textAlign='center'
          fontFamily='basier'
          fontSize='20px'
          lineHeight='28px'
        >
          {t('home.features.subtitle_1')}
        </Text>
      </Box>

      <Flex mx='auto' flexWrap='wrap' gap={{ base: '45px', lg: '30px' }}>
        <Card.Root variant='icon-card' flex={{ base: '1 0 100%', lg: '1 1 30%' }}>
          <Card.Body>
            <Box>
              <FaVoteYea />
            </Box>
            <Box>
              <Text>{t('home.features.card_1.title')}</Text>
              <Text>{t('home.features.card_1.description')}</Text>
            </Box>
          </Card.Body>
        </Card.Root>
        <Card.Root variant='icon-card' flex={{ base: '1 0 100%', lg: '1 1 30%' }}>
          <Card.Body>
            <Box>
              <FaPalette />
            </Box>
            <Box>
              <Text>{t('home.features.card_2.title')}</Text>
              <Text>{t('home.features.card_2.description')}</Text>
            </Box>
          </Card.Body>
        </Card.Root>
        <Card.Root variant='icon-card' flex={{ base: '1 0 100%', lg: '1 1 30%' }}>
          <Card.Body>
            <Box>
              <FaUsers />
            </Box>
            <Box>
              <Text>{t('home.features.card_3.title')}</Text>
              <Text>{t('home.features.card_3.description')}</Text>
            </Box>
          </Card.Body>
        </Card.Root>
        <Card.Root variant='icon-card' flex={{ base: '1 0 100%', lg: '1 1 30%' }}>
          <Card.Body>
            <Box>
              <FaUserLock />
            </Box>
            <Box>
              <Text>{t('home.features.card_4.title')}</Text>
              <Text>{t('home.features.card_4.description')}</Text>
            </Box>
          </Card.Body>
        </Card.Root>
        <Card.Root variant='icon-card' flex={{ base: '1 0 100%', lg: '1 1 30%' }}>
          <Card.Body>
            <Box>
              <FaTasks />
            </Box>
            <Box>
              <Text>{t('home.features.card_5.title')}</Text>
              <Text>{t('home.features.card_5.description')}</Text>
            </Box>
          </Card.Body>
        </Card.Root>
        <Card.Root variant='icon-card' flex={{ base: '1 0 100%', lg: '1 1 30%' }}>
          <Card.Body>
            <Box>
              <FaNewspaper />
            </Box>
            <Box>
              <Text>{t('home.features.card_6.title')}</Text>
              <Text>{t('home.features.card_6.description')}</Text>
            </Box>
          </Card.Body>
        </Card.Root>
        <Card.Root variant='icon-card' flex={{ base: '1 0 100%', lg: '1 1 30%' }}>
          <Card.Body>
            <Box>
              <FaLanguage />
            </Box>
            <Box>
              <Text>{t('home.features.card_7.title')}</Text>
              <Text>{t('home.features.card_7.description')}</Text>
            </Box>
          </Card.Body>
        </Card.Root>
        <Card.Root variant='icon-card' flex={{ base: '1 0 100%', lg: '1 1 30%' }}>
          <Card.Body>
            <Box>
              <FaBullseye />
            </Box>
            <Box>
              <Text>{t('home.features.card_8.title')}</Text>
              <Text>{t('home.features.card_8.description')}</Text>
            </Box>
          </Card.Body>
        </Card.Root>
        <Card.Root variant='icon-card' flex={{ base: '1 0 100%', lg: '1 1 30%' }}>
          <Card.Body>
            <Box>
              <FaCubes />
            </Box>
            <Box>
              <Text>{t('home.features.card_9.title')}</Text>
              <Text>{t('home.features.card_9.description')}</Text>
            </Box>
          </Card.Body>
        </Card.Root>
      </Flex>
    </Box>
  )
}

export default Features

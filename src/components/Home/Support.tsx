import { Box, Flex, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { FaRegCheckCircle } from 'react-icons/fa'
import ContactButton from '~components/shared/ContactLink'
import { BookerModalButton } from '~components/shared/Dashboard/Booker'

const Support = () => {
  const { t } = useTranslation()

  return (
    <Box
      backgroundImage='url("https://assets-global.website-files.com/6398d7c1bcc2b775ebaa4f2f/6398d7c1bcc2b75c38aa4f55_Net.svg")'
      background={'home.support.bg.light'}
      _dark={{
        background: 'home.support.bg.dark',
      }}
      mb={{ base: '100px', lg: '160px' }}
      boxShadow='inset 0 -1px 0 1px rgba(68, 67, 67, 0.38),0 8px 22px rgba(0, 0, 0, 0.44)'
      maxW='1500px'
      borderRadius={{ base: '0px', md: '16px' }}
      mx='auto'
      display='flex'
      flexDirection={{ base: 'column', xl: 'row' }}
      gap={6}
    >
      <Box width='full' m='0 auto' position='relative' overflow='hidden' px={'40px'} py={'60px'}>
        <Box
          w='356px'
          h='356px'
          borderRadius='full'
          bgColor='#738A57cf'
          position='absolute'
          right='25px'
          top='-240px'
          display={{ base: 'none', lg: 'block' }}
        />
        <Box
          w='300px'
          h='300px'
          borderRadius='full'
          bgColor='#D8E1D1cf'
          position='absolute'
          left='20px'
          bottom='-250px'
          display={{ base: 'none', lg: 'block' }}
        />
        <Text
          fontSize={{ base: '20px', md: '14px' }}
          lineHeight={{ base: '20px', md: '14px' }}
          mb={{ base: '10px', md: '6px' }}
          color='home.support.title'
          textAlign='center'
          fontWeight='bold'
        >
          {t('home.support.header')}
        </Text>
        <Text
          fontSize={{ base: '40px', md: '68px' }}
          lineHeight={{ base: '40px', md: '68px' }}
          mb={{ base: '20px', md: '10px' }}
          color='white'
          textAlign='center'
          fontFamily='basier'
          maxW='550px'
          mx='auto'
        >
          {t('home.support.title')}
        </Text>
        <Text
          fontSize={{ base: '20px', md: '22px' }}
          lineHeight={{ base: '26px', md: '28px' }}
          mb={{ base: '30px', md: '50px' }}
          color='white'
          textAlign='center'
          fontFamily='basier'
          fontWeight='100'
        >
          {t('home.support.subtitle')}
        </Text>
        <Flex
          flexDirection={{ base: 'column', lg: 'row' }}
          justifyContent='center'
          alignItems='center'
          mb='40px'
          gap={'15px'}
        >
          <ContactButton
            variant='outline'
            aria-label={t('home.support.btn_contact')}
            title={t('home.support.btn_contact')}
            height='60px'
          >
            {t('home.support.btn_contact')}
          </ContactButton>
          <BookerModalButton aria-label={t('home.support.btn_watch')} title={t('home.support.btn_watch')} height='60px'>
            <Text as='span' ml='10px'>
              {t('home.support.btn_watch')}
            </Text>
          </BookerModalButton>
        </Flex>
        <Flex gap='20px' flexDirection={{ base: 'column', md: 'row' }} justifyContent='center'>
          <Flex justifyContent='center' alignItems='center' gap='2' color='home.support.helper' opacity='.8'>
            <FaRegCheckCircle />
            <Text as='span'>{t('home.support.helper_1')}</Text>
          </Flex>
          <Flex justifyContent='center' alignItems='center' gap='2' color='home.support.helper' opacity='.8'>
            <FaRegCheckCircle />
            <Text as='span'>{t('home.support.helper_2')}</Text>
          </Flex>
          <Flex justifyContent='center' alignItems='center' gap='2' color='home.support.helper' opacity='.8'>
            <FaRegCheckCircle />
            <Text as='span'>{t('home.support.helper_3')}</Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}

export default Support

import { Box, Button, Card, Flex, Heading, Text } from '@chakra-ui/react'
import { ArrowUpRight } from '@untitled-ui/icons-react'
import { Trans, useTranslation } from 'react-i18next'
import { generatePath, Link as ReactRouterLink } from 'react-router-dom'
import { Routes } from '~routes'
import cityCouncils from '/assets/agm.avif'
import web3 from '/assets/budgeting.avif'
import organizations from '/assets/community.webp'
import coops from '/assets/software-integration.avif'
import sportClubs from '/assets/sport.jpeg'
import politicalParties from '/assets/voting.webp'

const UseCases = () => {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.language

  const Cases = [
    {
      title: t('usecases.city_councils.title'),
      eyebrow: t('usecases.city_councils.eyebrow'),
      description: t('usecases.city_councils.description'),
      image: cityCouncils,
      case: 'city-councils',
    },
    {
      title: t('usecases.community_organizations.title'),
      eyebrow: t('usecases.community_organizations.eyebrow'),
      description: t('usecases.community_organizations.description'),
      image: organizations,
      case: 'community-organizations',
    },
    {
      title: t('usecases.political_parties.title'),
      eyebrow: t('usecases.political_parties.eyebrow'),
      description: t('usecases.political_parties.description'),
      image: politicalParties,
      case: 'political-parties',
    },
    {
      title: t('usecases.integrators.title'),
      eyebrow: t('usecases.integrators.eyebrow'),
      description: t('usecases.integrators.description'),
      image: coops,
      case: 'integrators',
    },
    {
      title: t('usecases.professional_associations.title'),
      eyebrow: t('usecases.professional_associations.eyebrow'),
      description: t('usecases.professional_associations.description'),
      image: web3,
      case: 'professional-associations',
    },
    {
      title: t('usecases.sport_clubs.title'),
      eyebrow: t('usecases.sport_clubs.eyebrow'),
      description: t('usecases.sport_clubs.description'),
      image: sportClubs,
      case: 'sports-clubs',
    },
  ]

  return (
    <Box w='full'>
      <Text
        as={'h2'}
        size={'md'}
        fontWeight={'600'}
        textAlign={'center'}
        color={'usecases.subtitle'}
        _dark={{ color: 'white' }}
        mb={6}
      >
        <Trans i18nKey={'usecases.eyebrow'}>Use Cases</Trans>
      </Text>
      <Heading as={'h1'} size='md' mb={6} textAlign={'center'}>
        <Trans i18nKey={'usecases.title'}>Our success stories</Trans>
      </Heading>
      <Text textAlign={'center'} maxW='700px' mx='auto' mb={20}>
        <Trans i18nKey={'usecases.description'}>
          Vocdoni helped a wide range of organizations and institutions improve their participatory processes, voting
          and elections with out cutting-edge software. Know more about our success stories and understand how we can
          help you, we adapt to all verticals
        </Trans>
      </Text>
      <Flex rowGap={14} columnGap={'5%'} flexWrap={'wrap'} mx='auto' mb={24}>
        {Cases.map((el) => (
          <Card.Root
            key={el.title}
            asChild
            flex={{ base: '0 0 100%', md: '0 0 47.5%', xl: '0 0 30%' }}
            bgColor={'transparent'}
            boxShadow={'none'}
          >
            <ReactRouterLink to={`${generatePath(Routes.usecases.view, { lang: currentLanguage, case: el.case })}`}>
              <Card.Header
                p={0}
                h='200px'
                overflow='hidden'
                bgImage={`url(${el.image})`}
                bgSize='cover'
                backgroundPosition='center'
                bgRepeat='no-repeat'
                borderRadius={'lg'}
              ></Card.Header>

              <Card.Body p={0} pt={2}>
                <Text
                  color={'usecases.eyebrow.light'}
                  _dark={{ color: 'usecases.eyebrow.dark' }}
                  fontWeight={'600'}
                  fontSize={'xs'}
                >
                  {el.eyebrow}
                </Text>
                <Flex justifyContent={'space-between'} alignItems={'center'} pb={1}>
                  <Text fontWeight={'bold'} fontSize={'lg'}>
                    {el.title}
                  </Text>
                  <ArrowUpRight />
                </Flex>
                <Text
                  color={'usecases.description.light'}
                  _dark={{ color: 'usecases.description.dark' }}
                  lineHeight={1.3}
                >
                  {el.description}
                </Text>
              </Card.Body>
            </ReactRouterLink>
          </Card.Root>
        ))}
      </Flex>
      <Box
        maxW={{ lg: '95%' }}
        mx='auto'
        py={'100px'}
        bgColor={'usecases.banner.bg.light'}
        _dark={{ bgColor: 'usecases.banner.bg.dark' }}
      >
        <Heading as={'h3'} size={'xs'} textAlign={'center'} mb={4}>
          <Trans i18nKey={'usecases.banner.title'}>Use Cases</Trans>
        </Heading>
        <Text textAlign={'center'} mb={6} color={'usecases.banner.subtitle'} _dark={{ color: 'white' }}>
          <Trans i18nKey={'usecases.banner.subtitle'}>
            Join our network of +500 organizations using our secure voting platform
          </Trans>
        </Text>
        <Flex justifyContent={'center'} gap={4}>
          <Button>
            <Trans i18nKey={'usecases.banner.chat'}>Chat to sales</Trans>
          </Button>
          <Button>
            <Trans i18nKey={'home.create_process.btn'}> Try it for free</Trans>
          </Button>
        </Flex>
      </Box>
    </Box>
  )
}

export default UseCases

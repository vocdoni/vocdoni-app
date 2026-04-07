import { Box, Flex, Image, Text } from '@chakra-ui/react'
import {
  ElectionDescription,
  ElectionSchedule,
  ElectionStatusBadge,
  ElectionTitle,
  useElection,
} from '@vocdoni/react-components'
import { PublishedElection, Strategy } from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'
import { useReadMoreMarkdown } from '~components/Layout/use-read-more'
import { StampIcon } from './Census/StampIcon'

const ProcessHeader = () => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { ReadMoreMarkdownWrapper, ReadMoreMarkdownButton } = useReadMoreMarkdown(600, 20)

  if (!(election instanceof PublishedElection)) return null

  return (
    <>
      {election?.header && (
        <Box w='100%' mx='auto' maxH='300px' my='30px' overflow='hidden'>
          <Image src={election?.header} w='100%' h='auto' objectFit='cover' />
        </Box>
      )}
      <Flex flexDir='column'>
        <ElectionTitle fontSize={{ base: '3xl', md: '4xl' }} textAlign='left' mb={5} />
        <Flex
          flexDirection={{ base: 'column', xl: 'row' }}
          flexWrap={{ base: 'nowrap', xl: 'wrap' }}
          mb={4}
          justifyContent='space-between'
          columnGap={4}
          rowGap={3}
        >
          <Flex
            gap={2}
            flexDirection={{ base: 'column', xl: 'row' }}
            alignItems={{ base: 'start', xl: 'center' }}
            flex='1'
          >
            <Flex gap={3} justifyContent='space-between' w={{ base: 'full', xl: 'fit-content' }}>
              <ElectionStatusBadge whiteSpace='nowrap' />
            </Flex>
            <ElectionSchedule
              textAlign='left'
              color='process.info_title.light'
              _dark={{ color: 'process.info_title.dark' }}
              display='block'
              fontSize='sm'
              lineHeight='short'
            />
          </Flex>
        </Flex>
        <Flex flexDirection='column'>
          {!election?.description?.default.length && (
            <Text color='process.description'>{t('process.no_description')}</Text>
          )}
          <Box className='md-sizes'>
            <ReadMoreMarkdownWrapper toDark='var(--chakra-colors-process-read_more_dark)'>
              <ElectionDescription mb={0} fontSize='lg' lineHeight={1.5} color='process.description' />
            </ReadMoreMarkdownWrapper>
          </Box>
          <ReadMoreMarkdownButton colorPalette='primary' alignSelf='center' />
        </Flex>
      </Flex>
    </>
  )
}

const GitcoinStrategyInfo = () => {
  const { t } = useTranslation()
  const { election } = useElection()

  if (!election || !(election instanceof PublishedElection) || !election?.meta?.strategy) {
    return null
  }

  const strategy: Strategy = election.get('strategy')
  const score = strategy.tokens['GPS'].minBalance
  const firstParenthesesMatch = strategy.predicate.match(/\(([^)]+)\)/)
  let unionTypeString: string | null = null
  if (firstParenthesesMatch) {
    // split by space and get the second element which should be the union type
    const [, unionType] = firstParenthesesMatch[1].split(' ')
    if (unionType === 'AND') {
      unionTypeString = t('process.gitcoin.all_of_them')
    } else if (unionType === 'OR') {
      unionTypeString = t('process.gitcoin.one_of_them')
    }
  }
  const tokens = Object.entries(strategy.tokens).filter(([key, token]) => key !== 'GPS')

  return (
    <>
      <Text>{t('process.gitcoin.gps_score', { score: score })}</Text>
      {unionTypeString && (
        <Flex direction={'column'} gap={2} mt={4}>
          <Flex direction={{ base: 'column', lg: 'row' }} gap={{ base: 0, lg: 1 }}>
            <Text fontWeight='bold'>{t('process.gitcoin.needed_stamps')}</Text>
            <Text>{unionTypeString}</Text>
          </Flex>
          <Flex direction={'row'} gap={1} flexWrap={'wrap'}>
            {Object.values(tokens).map(([, token], n) => {
              return (
                <StampIcon key={n} size={6} iconURI={token.iconURI} alt={token.externalID} tooltip={token.externalID} />
              )
            })}
          </Flex>
        </Flex>
      )}
    </>
  )
}

export default ProcessHeader

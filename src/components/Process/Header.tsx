import { AspectRatio, Box, Flex, Image, Text } from '@chakra-ui/react'
import {
  ElectionDescription,
  ElectionSchedule,
  ElectionStatusBadge,
  ElectionTitle,
  getElectionDescription,
  useElection,
} from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { useReadMoreMarkdown } from '~components/Layout/use-read-more'

const ProcessHeader = () => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { ReadMoreMarkdownWrapper, ReadMoreMarkdownButton } = useReadMoreMarkdown(600, 20)

  if (!election) return null

  return (
    <>
      {election?.header && (
        <Box w='100%' mx='auto' my='30px' overflow='hidden'>
          <AspectRatio ratio={3 / 1} maxH='300px'>
            <Image
              src={election?.header}
              alt={
                election.title
                  ? typeof election.title === 'string'
                    ? election.title
                    : (election.title.default ?? '')
                  : ''
              }
              w='100%'
              h='100%'
              objectFit='cover'
              loading='eager'
              fetchPriority='high'
            />
          </AspectRatio>
        </Box>
      )}
      <Flex flexDir='column'>
        <ElectionTitle fontSize='4xl' textAlign='left' mb={5} />
        <Flex gap={2} flexDirection={{ base: 'column', xl: 'row' }} alignItems={{ base: 'start', xl: 'center' }} mb={4}>
          <ElectionStatusBadge whiteSpace='nowrap' />
          <ElectionSchedule
            textAlign='left'
            color='process.info_title.light'
            _dark={{ color: 'process.info_title.dark' }}
            display='block'
            fontSize='sm'
            lineHeight='short'
          />
        </Flex>
        <Flex flexDirection='column'>
          {!getElectionDescription(election)?.length && <Text color='fg.muted'>{t('process.no_description')}</Text>}
          <Box className='md-sizes'>
            <ReadMoreMarkdownWrapper>
              <ElectionDescription mb={0} fontSize='lg' lineHeight={1.5} color='fg.muted' />
            </ReadMoreMarkdownWrapper>
          </Box>
          <ReadMoreMarkdownButton alignSelf='center' />
        </Flex>
      </Flex>
    </>
  )
}

export default ProcessHeader

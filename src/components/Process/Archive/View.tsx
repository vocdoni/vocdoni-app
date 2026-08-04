import { Badge, Box, Card, Flex, Heading, HStack, Image, Link, Progress, Text, VStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { LuExternalLink } from 'react-icons/lu'
import Editor from '~components/Editor'
import { useDateFns } from '~i18n/use-date-fns'
import { useAppEnv } from '~src/app-env'
import { useLocalizedText } from '~src/legacy/use-localized-text'
import type { LegacyElection, LegacyElectionStatus } from '~src/legacy/vochain-archive'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'

const StatusBadge = ({ status }: { status: LegacyElectionStatus }) => {
  const { t } = useTranslation()

  const labels: Record<LegacyElectionStatus, string> = {
    UPCOMING: t('process.status.upcoming', { defaultValue: 'Upcoming' }),
    ONGOING: t('process.status.active', { defaultValue: 'Active' }),
    ENDED: t('process.status.ended', { defaultValue: 'Ended' }),
    CANCELED: t('process.status.canceled', { defaultValue: 'Canceled' }),
    PAUSED: t('process.status.paused', { defaultValue: 'Paused' }),
    RESULTS: t('process.status.results', { defaultValue: 'Results available' }),
    PROCESS_UNKNOWN: t('process.status.unknown', { defaultValue: 'Unknown' }),
  }
  const palettes: Partial<Record<LegacyElectionStatus, string>> = {
    ONGOING: 'green',
    RESULTS: 'teal',
    CANCELED: 'red',
    PAUSED: 'orange',
  }

  return <Badge colorPalette={palettes[status] ?? 'gray'}>{labels[status]}</Badge>
}

/**
 * Read-only rendering of a finished legacy (vochain archive) election: status,
 * dates, census size, per-choice tallies and an explorer verification link.
 * All archive elections are finished, so this view never needs to vote.
 */
export const ArchiveProcessView = ({ election }: { election: LegacyElection }) => {
  const { t } = useTranslation()
  const { format } = useDateFns()
  const localize = useLocalizedText()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  const explorerUrl = getVocdoniClientConfig(VOCDONI_ENVIRONMENT).explorerUrl ?? 'https://explorer.vote'

  const title = localize(election.title) || election.id
  const description = localize(election.description)

  return (
    <VStack align='stretch' gap={6} maxW='4xl' mx='auto' px={4} py={8} w='full'>
      {election.header && <Image src={election.header} alt='' borderRadius='md' maxH='240px' objectFit='cover' />}

      <Box>
        <HStack mb={2} gap={2} flexWrap='wrap'>
          <StatusBadge status={election.status} />
          {election.secretUntilTheEnd && !election.resultsAvailable && (
            <Badge colorPalette='purple'>
              {t('results_state.hidden_until_end', { defaultValue: 'Hidden until the end' })}
            </Badge>
          )}
        </HStack>
        <Heading size='2xl'>{title}</Heading>
        <Text color='texts.subtle' fontSize='sm' mt={2}>
          {election.startDate &&
            `${t('process.date.starts', { defaultValue: 'Starts' })} ${format(election.startDate, t('organization.date_format'))}`}
          {election.startDate && election.endDate && ' · '}
          {election.endDate &&
            `${t('process.date.ends', { defaultValue: 'Ends' })} ${format(election.endDate, t('organization.date_format'))}`}
        </Text>
        <Text color='texts.subtle' fontSize='sm'>
          {t('process.summary.votes_cast', {
            defaultValue: '{{votes}} votes cast',
            votes: election.voteCount,
            count: election.voteCount,
          })}
          {election.maxCensusSize > 0 && ' · '}
          {election.maxCensusSize > 0 && t('process.people_in_census', { count: election.maxCensusSize })}
        </Text>
      </Box>

      {description && (
        <Box className='md-sizes'>
          <Editor defaultValue={description} isDisabled />
        </Box>
      )}

      <VStack align='stretch' gap={4}>
        {election.questions.map((question, questionIndex) => (
          <Card.Root key={questionIndex} variant='outline'>
            <Card.Header>
              <Heading size='md'>{localize(question.title)}</Heading>
              {localize(question.description) && (
                <Text color='texts.subtle' fontSize='sm'>
                  {localize(question.description)}
                </Text>
              )}
            </Card.Header>
            <Card.Body>
              {!election.resultsAvailable ? (
                <Text color='texts.subtle' fontSize='sm'>
                  {t('process_pdf.voting_process.results_hidden', {
                    defaultValue: 'Results are hidden until the process reaches the final results stage.',
                  })}
                </Text>
              ) : (
                <VStack align='stretch' gap={3}>
                  {question.choices.map((choice, choiceIndex) => (
                    <Box key={choiceIndex}>
                      <Flex justify='space-between' fontSize='sm' mb={1} gap={4}>
                        <Text>{localize(choice.title)}</Text>
                        <Text color='texts.subtle' whiteSpace='nowrap'>
                          {choice.votes === null
                            ? t('public_process.no_tally', { defaultValue: 'No tally' })
                            : `${choice.votes} · ${choice.percentage === null ? '—' : `${choice.percentage.toFixed(1)}%`}`}
                        </Text>
                      </Flex>
                      <Progress.Root value={choice.percentage ?? 0} size='sm' colorPalette='teal'>
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </Box>
                  ))}
                </VStack>
              )}
            </Card.Body>
          </Card.Root>
        ))}
      </VStack>

      <Box>
        <Text fontSize='sm' color='texts.subtle' mb={1}>
          {t('public_process.verify', { defaultValue: 'Verify on the blockchain explorer:' })}
        </Text>
        <Link
          href={`${explorerUrl}/process/${election.id}`}
          target='_blank'
          rel='noopener noreferrer'
          fontSize='sm'
          display='inline-flex'
          alignItems='center'
          gap={1}
        >
          <LuExternalLink />
          {t('public_process.verify_process', { defaultValue: 'View process' })}
        </Link>
      </Box>
    </VStack>
  )
}

export default ArchiveProcessView

import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  List,
  Progress,
  Separator,
  SimpleGrid,
  Stat,
  Text,
} from '@chakra-ui/react'
import { ElectionResults, getElectionTitle, useElection } from '@vocdoni/react-components'
import { hasResults, isSecretUntilTheEnd, isUpcoming, processVoteCount } from '@vocdoni/api-client'
import type { QuestionStatus } from '@vocdoni/api-types'
import { TFunction } from 'i18next'
import { useEffect, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { RiBarChartBoxLine, RiLock2Line, RiSearchEyeLine, RiShieldCheckLine } from 'react-icons/ri'
import { useCensusSize } from '~queries/census'
import { Routes } from '~src/router/routes'

// Returns the milliseconds left until the relevant deadline (start when upcoming, end otherwise).
const useTimeLeft = (target?: Date) => {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(interval)
  }, [])

  if (!target) return 0
  return Math.max(0, target.getTime() - now.getTime())
}

const statusLabel = (t: TFunction, status: QuestionStatus | null) => {
  switch (status) {
    case 'RESULTS':
      return t('process.results')
    case 'ENDED':
      return t('process.status.ended')
    case 'CANCELED':
      return t('process.status.canceled')
    case 'PAUSED':
      return t('process.status.paused')
    case 'UPCOMING':
      return t('process.status.upcoming')
    case 'PROCESS_UNKNOWN':
      return t('process.status.unknown')
    default:
      return t('process.status.active')
  }
}

type CountdownStatProps = { target?: Date; upcoming: boolean; status: QuestionStatus | null }

const CountdownStat = ({ target, upcoming, status }: CountdownStatProps) => {
  const { t } = useTranslation()
  const left = useTimeLeft(target)

  // Once the deadline is reached, show the process status instead of a zeroed-out countdown.
  if (left <= 0) {
    return (
      <Badge colorPalette='gray' size='md' fontWeight='bold' fontSize='lg' alignSelf='end'>
        {statusLabel(t, status)}
      </Badge>
    )
  }

  const days = Math.floor(left / 86_400_000)
  const hours = Math.floor((left % 86_400_000) / 3_600_000)
  const minutes = Math.floor((left % 3_600_000) / 60_000)
  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <Stat.Root flex='0 0 auto' alignItems='end'>
      <Stat.Label color='texts.subtle' textTransform='uppercase' fontSize='xs' letterSpacing='wide'>
        {upcoming ? t('process.summary.time_until_start') : t('process.summary.time_remaining')}
      </Stat.Label>
      <Badge colorPalette='green' size='md' fontWeight='bold' fontSize='lg'>
        {t('process.summary.countdown', { days, hours: pad(hours), minutes: pad(minutes) })}
      </Badge>
    </Stat.Root>
  )
}

const ParticipationCard = () => {
  const { t, i18n } = useTranslation()
  const { election, results, status } = useElection()
  const { size: census } = useCensusSize()

  if (!election) return null

  const voteCount = processVoteCount(results)
  const percent = census > 0 ? (voteCount / census) * 100 : 0
  const upcoming = isUpcoming(election)
  const startDate = new Date(election.startDate)
  const endDate = new Date(election.endDate)
  const target = upcoming ? startDate : endDate
  const nf = (value: number, fractionDigits = 0) =>
    new Intl.NumberFormat(i18n.language, {
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(value)
  const datetime = (date?: Date) =>
    date
      ? new Intl.DateTimeFormat(i18n.language, {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }).format(date)
      : ''

  return (
    <Card.Root size='lg'>
      <Card.Body gap={6}>
        <Flex justify='space-between' align='start' gap={4} wrap='wrap'>
          <Box flex='1' minW='0'>
            <Heading as='h1' size='2xl' lineHeight={1.1}>
              {getElectionTitle(election)}
            </Heading>
          </Box>
          <CountdownStat target={target} upcoming={upcoming} status={status} />
        </Flex>

        <Box>
          <Flex justify='space-between' align='baseline' mb={2} gap={2} wrap='wrap'>
            <Text>
              <Trans
                i18nKey='process.summary.participation_current'
                values={{ percent: nf(percent, 1) }}
                components={{ b: <Text as='span' color='blue.500' fontWeight='bold' /> }}
              />
            </Text>
            <Text color='texts.subtle' fontSize='sm'>
              {t('process.summary.votes_cast', { count: voteCount, votes: nf(voteCount) })}
            </Text>
          </Flex>
          <Progress.Root value={percent} colorPalette='blue' size='lg' striped>
            <Progress.Track borderRadius='full'>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        </Box>

        <Separator />

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
          <Stat.Root>
            <Stat.Label color='texts.subtle' textTransform='uppercase' fontSize='xs' letterSpacing='wide'>
              {t('process.summary.start_label')}
            </Stat.Label>
            <Stat.ValueText fontSize='md' fontWeight='bold'>
              {datetime(startDate)}
            </Stat.ValueText>
          </Stat.Root>
          <Stat.Root>
            <Stat.Label color='texts.subtle' textTransform='uppercase' fontSize='xs' letterSpacing='wide'>
              {t('process.summary.end_label')}
            </Stat.Label>
            <Stat.ValueText fontSize='md' fontWeight='bold'>
              {datetime(endDate)}
            </Stat.ValueText>
          </Stat.Root>
        </SimpleGrid>
      </Card.Body>
    </Card.Root>
  )
}

type IndicatorProps = { label: string; value: string; accent?: boolean }

const Indicator = ({ label, value, accent }: IndicatorProps) => (
  <Card.Root size='sm' textAlign='center'>
    <Card.Body>
      <Stat.Root alignItems='center' gap={1}>
        <Stat.ValueText fontSize='3xl' fontWeight='bold' color={accent ? 'blue.500' : undefined}>
          {value}
        </Stat.ValueText>
        <Stat.Label color='texts.subtle'>{label}</Stat.Label>
      </Stat.Root>
    </Card.Body>
  </Card.Root>
)

const KeyIndicators = () => {
  const { t, i18n } = useTranslation()
  const { election, results } = useElection()
  const { size: census } = useCensusSize()

  if (!election) return null

  const voteCount = processVoteCount(results)
  const percent = census > 0 ? (voteCount / census) * 100 : 0
  const nf = (value: number, fractionDigits = 0) =>
    new Intl.NumberFormat(i18n.language, {
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(value)

  return (
    <Box>
      <Flex align='center' gap={4} mb={4}>
        <Heading as='h2' size='lg' flexShrink={0}>
          {t('process.summary.indicators_title')}
        </Heading>
        <Separator flex='1' />
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
        <Indicator label={t('process.summary.stat_census')} value={nf(census)} />
        <Indicator label={t('process.summary.stat_votes_received')} value={nf(voteCount)} />
        <Indicator label={t('process.summary.stat_participation')} value={`${nf(percent, 2)}%`} accent />
      </SimpleGrid>
    </Box>
  )
}

const ResultsNotice = () => {
  const { t, i18n } = useTranslation()
  const { election } = useElection()

  if (!election) return null

  const electionHasResults = hasResults(election)
  const isEncrypted = isSecretUntilTheEnd(election)

  // Show the actual results once published, otherwise the "encrypted until close" notice.
  // When results are neither published nor encrypted there's nothing to show here yet.
  if (!electionHasResults && !isEncrypted) return null

  const endDate = new Date(election.endDate)
  const closeDate = election.endDate
    ? new Intl.DateTimeFormat(i18n.language, { weekday: 'long', day: 'numeric', month: 'long' }).format(endDate)
    : ''

  return (
    <Box>
      <Flex align='center' gap={4} mb={4}>
        <Heading as='h2' size='lg' flexShrink={0}>
          {t('process.summary.results_title')}
        </Heading>
        <Separator flex='1' />
      </Flex>
      {electionHasResults ? (
        <Card.Root size='lg'>
          <Card.Body>
            <ElectionResults />
          </Card.Body>
        </Card.Root>
      ) : (
        <Box bg='blue.50' color='blue.900' borderRadius='lg' p={4} _dark={{ bg: 'blue.950', color: 'blue.100' }}>
          <Flex gap={3} align='start'>
            <Box as={RiBarChartBoxLine} boxSize={5} flexShrink={0} mt={0.5} />
            <Text fontSize='sm'>
              <Trans
                i18nKey='process.summary.results_private'
                values={{ date: closeDate }}
                components={{ b: <Text as='span' fontWeight='bold' /> }}
              />
            </Text>
          </Flex>
        </Box>
      )}
    </Box>
  )
}

// Rendered through a dynamic i18nKey below, so the extractor can't see them statically.
// The comment hints keep the keys registered (and preserved) on `pnpm translations`:
// t('process.summary.tech_privacy', { defaultValue: "<b>Privacy:</b> the vote is completely secret and it is not possible to link any cast vote with the voter's identity." })
// t('process.summary.tech_integrity', { defaultValue: '<b>Integrity:</b> the system guarantees that no vote can be altered, deleted or manipulated once cast.' })
// t('process.summary.tech_verifiability', { defaultValue: '<b>Verifiability:</b> any participant can check that their vote was correctly recorded and counted, without compromising vote secrecy.' })
const techItems = [
  { key: 'process.summary.tech_privacy', icon: RiLock2Line },
  { key: 'process.summary.tech_integrity', icon: RiShieldCheckLine },
  { key: 'process.summary.tech_verifiability', icon: RiSearchEyeLine },
] as const

const CertifiedTech = () => {
  const { t } = useTranslation()

  return (
    <Card.Root bg='gray.800' color='white' size='lg' borderWidth='0'>
      <Card.Body>
        <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
          <Box flex='1'>
            <Heading as='h2' size='lg' mb={3}>
              {t('process.summary.tech_title')}
            </Heading>
            <Text color='gray.400' mb={5}>
              {t('process.summary.tech_description')}
            </Text>
            <List.Root variant='plain' gap={3}>
              {techItems.map(({ key, icon }) => (
                <List.Item key={key} alignItems='start' gap={2}>
                  <List.Indicator asChild color='blue.400' mt={1}>
                    <Box as={icon} />
                  </List.Indicator>
                  <Text fontSize='sm'>
                    <Trans i18nKey={key} components={{ b: <Text as='span' fontWeight='bold' /> }} />
                  </Text>
                </List.Item>
              ))}
            </List.Root>
          </Box>
          <Flex
            direction='column'
            align='center'
            justify='center'
            gap={2}
            borderTopWidth={{ base: '1px', lg: '0' }}
            borderLeftWidth={{ lg: '1px' }}
            borderColor='whiteAlpha.300'
            pt={{ base: 6, lg: 0 }}
            pl={{ lg: 8 }}
            minW={{ lg: '240px' }}
          >
            <Button colorPalette='blue' mt={2} asChild>
              <a href={Routes.vocdoni} target='_blank' rel='noreferrer'>
                {t('process.summary.learn_more')}
              </a>
            </Button>
          </Flex>
        </Flex>
      </Card.Body>
    </Card.Root>
  )
}

const ProcessSummary = () => {
  const { election } = useElection()

  if (!election) return null

  return (
    <Flex direction='column' gap={8} mx='auto' w='full' maxW='breakpoint-lg' py={6}>
      <ParticipationCard />
      <KeyIndicators />
      <ResultsNotice />
      <CertifiedTech />
    </Flex>
  )
}

export { ProcessSummary }
export default ProcessSummary

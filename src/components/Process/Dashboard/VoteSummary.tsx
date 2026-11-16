import {
  Card,
  Flex,
  Grid,
  HStack,
  Icon,
  IconButton,
  Input,
  Link,
  SimpleGrid,
  Stack,
  Stat,
  Text,
  useClipboard,
} from '@chakra-ui/react'
import { isSecretUntilTheEnd, processVoteCount, resolveEndDate } from '@vocdoni/api-client'
import { tryInferQuestionBallotType } from '@vocdoni/ballot'
import { useElection } from '@vocdoni/react-components'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink } from 'react-router'
import { CensusRuler } from '~components/ui/CensusRuler'
import { FactList, type Fact } from '~components/ui/FactList'
import { ProcessStatus } from '~components/ui/ProcessStatus'
import { SectionHeader } from '~components/ui/SectionHeader'
import { useVoteText } from '~i18n/use-vote-text'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { useProcessEarlyEndDate } from '~queries/process-end-date'
import { Routes } from '~src/router/routes'
import { getPublicProcessPath } from '~src/ssr/public-pages'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { CopyIcon, ViewIcon } from '~theme/icons'
import { quantity } from '~utils/numbers'
import { useNow } from '~utils/use-now'
import { questionOutcome } from '~utils/vote-outcome'
import { deriveQuestionState, deriveVoteState, percentOf, questionElectorate } from '~utils/vote-state'
import { useAnonymityLabels } from '../anonymityLabels'
import { useResultTypeLabel } from '../resultTypeLabels'
import { CensusSearch } from './CensusSearch'

/** Resum: turnout, the vote's facts, its questions, the voting link and the voter lookup. */
export const VoteSummary = () => {
  const { t } = useTranslation()
  const { election, results } = useElection()
  const now = useNow()
  const { text, longDate, outcome } = useVoteText()
  const { data: earlyEndDate } = useProcessEarlyEndDate(election)
  const publicLanguage = usePublicLanguage()
  const labelId = useId()
  const votingLink = `${document.location.origin}${getPublicProcessPath({ id: election?.id ?? '', language: publicLanguage })}`
  const { copy } = useClipboard({ value: votingLink })
  const firstQuestion = election?.questions[0]
  const resultTypeLabel = useResultTypeLabel(firstQuestion ? tryInferQuestionBallotType(firstQuestion) : undefined, '')
  const { short: anonymityLabel, mechanismDescription } = useAnonymityLabels(election?.census?.anonymous)

  if (!election) return null

  const byQuestion = isQuestionByQuestion(election)
  const state = deriveVoteState(election, now)
  const weighted = !!election.census?.weighted
  const total = election.census?.size
  const count = processVoteCount(results)
  const percent = percentOf(count, total)
  const secret = isSecretUntilTheEnd(election)
  const manageRoute = generatePath(Routes.dashboard.processManage, { id: election.id })
  const resultsRoute = generatePath(Routes.dashboard.processResults, { id: election.id })
  const censusFields = [...(election.census?.authFields ?? []), ...(election.census?.twoFaFields ?? [])]

  const facts: Fact[] = [
    {
      id: 'census',
      label: t('votes.summary.label.census', { defaultValue: 'Census' }),
      value: t('votes.summary.fact.census', {
        defaultValue_one: '{{count}} person',
        defaultValue_other: '{{count}} people',
        count: total ?? 0,
      }),
    },
    {
      id: 'questions',
      label: t('votes.summary.label.questions', { defaultValue: 'Questions' }),
      value: byQuestion
        ? t('votes.summary.fact.questions_by_question', {
            defaultValue_one: '{{count}}, question by question',
            defaultValue_other: '{{count}}, question by question',
            count: election.questions.length,
          })
        : t('votes.summary.fact.questions_all', {
            defaultValue_one: '{{count}}, all at once',
            defaultValue_other: '{{count}}, all at once',
            count: election.questions.length,
          }),
    },
    state === 'ready'
      ? {
          id: 'starts',
          label: t('votes.summary.label.starts', { defaultValue: 'Starts' }),
          value: t('votes.summary.fact.starts', { defaultValue: '{{date}}', date: longDate(election.startDate) }),
        }
      : {
          id: 'closes',
          label:
            state === 'closed'
              ? t('votes.summary.label.closed', { defaultValue: 'Closed' })
              : t('votes.summary.label.closes', { defaultValue: 'Closes' }),
          value: t('votes.summary.fact.closes', {
            defaultValue: '{{date}}',
            date: longDate(earlyEndDate ?? resolveEndDate(election)),
          }),
        },
    {
      id: 'results',
      label: t('votes.summary.label.results', { defaultValue: 'Results' }),
      value: secret
        ? byQuestion
          ? t('votes.summary.fact.results_hidden_by_question', { defaultValue: 'Hidden until each question closes' })
          : t('votes.summary.fact.results_hidden', { defaultValue: 'Hidden until the vote closes' })
        : t('votes.summary.fact.results_live', { defaultValue: 'Live' }),
    },
    { id: 'ballot', label: t('results_type.title', 'Results type'), value: resultTypeLabel },
    {
      id: 'anonymity',
      label: t('voter_anonymity', 'Voter anonymity'),
      value: anonymityLabel,
      tooltip: mechanismDescription,
    },
    {
      id: 'overwrite',
      label: t('vote_overwrite', 'Vote overwrite'),
      value: firstQuestion?.ballotProtocol?.maxVoteOverwrites
        ? t('results_state.enabled', 'Enabled')
        : t('results_state.not_enabled', 'Not enabled'),
    },
  ]

  return (
    <Stack gap='6'>
      <Card.Root variant='frame' as='section' aria-labelledby={labelId}>
        <Card.Body>
          <Flex direction={{ base: 'column', lg: 'row' }} justify='space-between' gap='8'>
            <Stack justify='space-between' gap='4'>
              <Stat.Root size='hero' as='div'>
                <Stat.Label as='div' id={labelId}>
                  {t('votes.summary.turnout', { defaultValue: 'Turnout' })}
                </Stat.Label>
                <HStack align='flex-end' gap='5' wrap='wrap'>
                  {percent !== undefined && (
                    <>
                      <Stat.ValueText as='div'>{percent}</Stat.ValueText>
                      <Stat.ValueUnit>%</Stat.ValueUnit>
                    </>
                  )}
                  {total !== undefined && (
                    <Text textStyle='body' fontWeight='medium-plus'>
                      {byQuestion
                        ? t('votes.summary.voted_any', {
                            defaultValue: 'At least {{count}} of {{total}} voted on a question',
                            count,
                            total: quantity(total),
                          })
                        : t('votes.summary.voted_of', {
                            defaultValue: '{{count}} of {{total}} voted',
                            count,
                            total: quantity(total),
                          })}
                    </Text>
                  )}
                </HStack>
              </Stat.Root>
            </Stack>
            <FactList facts={facts} w={{ base: 'full', lg: 'sm' }} alignSelf='flex-end' />
          </Flex>
          <CensusRuler
            mt='8'
            maxW={{ base: 'full', md: 'md' }}
            value={count}
            max={total}
            marker
            label={t('votes.summary.ruler_label', {
              defaultValue: '{{count}} of {{total}} people voted, {{percent}}%',
              count,
              total: total ?? 0,
              percent: percent ?? 0,
            })}
          />
        </Card.Body>
      </Card.Root>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap='6'>
        <Card.Root variant='frame'>
          <Card.Header>
            <SectionHeader
              title={t('process.questions')}
              actions={
                byQuestion ? (
                  <Link asChild textStyle='control'>
                    <RouterLink to={manageRoute}>
                      {t('votes.summary.manage_link', { defaultValue: 'Manage questions' })}
                    </RouterLink>
                  </Link>
                ) : state !== 'canceled' ? (
                  <Link asChild textStyle='control'>
                    <RouterLink to={resultsRoute}>
                      {t('votes.summary.results_link', { defaultValue: 'See results' })}
                    </RouterLink>
                  </Link>
                ) : undefined
              }
            />
          </Card.Header>
          {election.questions.map((question, index) => {
            const questionState = deriveQuestionState(question, election, now)
            const voteCount = question.results?.voteCount ?? 0
            const questionPercent = percentOf(voteCount, questionElectorate(question, election))
            const parts: string[] = []
            const result =
              byQuestion && questionState === 'closed'
                ? outcome(questionOutcome(question, question.results, { weighted }))
                : null
            if (result) parts.push(result)
            if (voteCount > 0) {
              parts.push(
                t('votes.summary.question_turnout', {
                  defaultValue: '{{count}} · {{percent}}%',
                  count: voteCount,
                  percent: questionPercent ?? 0,
                })
              )
            }
            return (
              <Card.Body key={question.id}>
                <Grid templateColumns='[{sizes.6} minmax(0, 1fr) auto]' columnGap='3' alignItems='start'>
                  <Text textStyle='figure' color='fg.subtle'>
                    {index + 1}
                  </Text>
                  <Stack gap='1' minW='0'>
                    <Text lineClamp={2}>{text(question.title)}</Text>
                    {parts.length > 0 && (
                      <Text textStyle='body-sm' color='fg.subtle'>
                        {parts.join(' · ')}
                      </Text>
                    )}
                  </Stack>
                  {byQuestion && <ProcessStatus kind='question' state={questionState} />}
                </Grid>
              </Card.Body>
            )
          })}
        </Card.Root>

        <Stack gap='6'>
          <Card.Root variant='frame'>
            <Card.Header>
              <SectionHeader
                title={t('votes.summary.share_title', { defaultValue: 'Share' })}
                description={t('votes.summary.share_hint', { defaultValue: 'Public link for your voters.' })}
              />
            </Card.Header>
            <Card.Body>
              <Flex justifyContent='space-between' gap='2' wrap='wrap'>
                <Input
                  readOnly
                  aria-label={t('voting_link.title', 'Voting Link')}
                  value={votingLink}
                  flex='1 1 18rem'
                  minW='0'
                />
                <IconButton variant='outline' onClick={copy} title={t('copy.copy', 'Copy')} aria-label={t('copy.copy')}>
                  <Icon as={CopyIcon} />
                </IconButton>
                <IconButton asChild variant='outline' title={t('preview', 'Preview')} aria-label={t('preview')}>
                  <Link href={votingLink} target='_blank' rel='noopener noreferrer'>
                    <Icon as={ViewIcon} />
                  </Link>
                </IconButton>
              </Flex>
            </Card.Body>
          </Card.Root>
          {censusFields.length > 0 && (
            <Card.Root variant='frame'>
              <Card.Body>
                <CensusSearch />
              </Card.Body>
            </Card.Root>
          )}
        </Stack>
      </SimpleGrid>
    </Stack>
  )
}

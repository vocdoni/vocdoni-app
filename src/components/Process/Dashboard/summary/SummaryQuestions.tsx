import { Card, Flex, Icon, Link, Text } from '@chakra-ui/react'
import { hasResults, processVoteCount } from '@vocdoni/api-client'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { tryInferQuestionBallotType } from '@vocdoni/ballot'
import { ElectionResults, useElection } from '@vocdoni/react-components'
import { useEffect, useId, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink } from 'react-router'
import { ErrorBoundary } from '~components/Layout/ErrorBoundary'
import { useCensusSize } from '~queries/census'
import { Routes } from '~src/router/routes'
import { isLegacyProcess } from '~src/types/voting-process'
import { ChevronRightIcon, LockIcon } from '~theme/icons'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { isSettledQuestion } from '~utils/vote-state'
import { ByQuestionCard } from './by-question/ByQuestionCard'
import { AllAtOnceRow, showsTally } from './QuestionRows'
import { SummaryCardHeader } from './SummaryCardHeader'
import type { SummaryModel } from './use-summary-model'

/** The all-at-once card's last line: when the results show, and the way to the ballot. */
const ResultsLine = ({ model }: { model: SummaryModel }) => {
  const { t } = useTranslation()
  let line: string
  if (model.state === 'canceled')
    line = t('votes.summary.results_line.none', { defaultValue: 'There will be no results.' })
  // As the hero: public only once the server has every question over.
  else if (model.state === 'closed')
    line = model.election.questions.every((question) => isSettledQuestion(question))
      ? t('votes.summary.results_line.public', { defaultValue: 'The results are public now.' })
      : t('votes.summary.idle.ended_counting', { defaultValue: 'The final results are still being counted.' })
  else if (model.secret)
    line = t('votes.summary.results_line.secret', { defaultValue: 'The results will show when the vote closes.' })
  else line = t('votes.summary.results_line.live', { defaultValue: 'The results show live, during the vote.' })

  return (
    <Flex
      align='center'
      gap='2'
      minH='11'
      py='2'
      px='card'
      borderTopWidth='hairline'
      borderColor='border'
      textStyle='body-sm'
      color='fg.subtle'
    >
      <Icon as={LockIcon} boxSize='3.5' flexShrink='0' />
      <Text flex='1'>{line}</Text>
      <Link asChild textStyle='control' gap='1'>
        <RouterLink to={generatePath(Routes.dashboard.processBallot, { id: model.election.id })}>
          {t('votes.summary.ballot_link', { defaultValue: 'Ballot' })}
          <Icon as={ChevronRightIcon} boxSize='3.5' />
        </RouterLink>
      </Link>
    </Flex>
  )
}

/** Fires `ProcessResultsViewed` once per vote, the first time Resum shows its results. */
const useTrackResultsViewed = (model: SummaryModel, visible: boolean) => {
  const { results, status } = useElection()
  const { size: censusSize } = useCensusSize()
  const tracked = useRef<string | null>(null)
  const { election, state } = model
  useEffect(() => {
    if (!visible || !election.published || state === 'canceled' || tracked.current === election.id) return
    tracked.current = election.id
    const voteCount = processVoteCount(results)
    trackAnalyticsEvent({
      name: AnalyticsEvents.ProcessResultsViewed,
      props: {
        election_id: election.id,
        status: status ?? 'unknown',
        vote_count: voteCount,
        census_size: censusSize,
        turnout_pct: censusSize ? Math.round((voteCount / censusSize) * 100) : 0,
      },
    })
  }, [visible, election, state, results, status, censusSize])
}

/**
 * The vote's questions. Question by question, the card that runs them (ByQuestionCard). All at once: each question's
 * turnout and blank votes, and when the results show; a phone or tablet lists them with one quiet line each.
 */
export const SummaryQuestions = ({ model, desktop }: { model: SummaryModel; desktop: boolean }) => {
  const { t } = useTranslation()
  const titleId = useId()
  const { results } = useElection()
  const { election, byQuestion, state, questionStates } = model

  // The served tally wins over the one the process read carries.
  const questions = useMemo(() => {
    const served = new Map((results?.questions ?? []).map((entry) => [entry.questionId, entry]))
    return election.questions.map((question): VotingProcessQuestion => {
      const tally = served.get(question.id)
      return tally?.results?.length ? { ...question, results: { ...question.results, ...tally } } : question
    })
  }, [election.questions, results])
  // Legacy votes can carry questions with no ballot type: their tallies cannot be decoded, so the package's own
  // results list them (choices without numbers) instead of Resum guessing.
  const undecodable =
    isLegacyProcess(election) && questions.some((question) => tryInferQuestionBallotType(question) === undefined)
  const visible =
    state !== 'canceled' &&
    (undecodable || questions.some((question, index) => showsTally(question, questionStates[index], model)))
  useTrackResultsViewed(model, visible)
  // Closed with no tally on screen yet: say it is being counted instead of showing nothing. A tally already drawn
  // speaks for itself, even while the process has not reached its results status.
  const counting = state === 'closed' && !hasResults(election) && !visible

  const countingNote = counting && (
    <Card.Body py='3'>
      <Text textStyle='body-sm' color='fg.muted'>
        {t('votes.results.counting', {
          defaultValue: 'The vote is closed. The results are being counted and will show here shortly.',
        })}
      </Text>
    </Card.Body>
  )

  if (byQuestion) return <ByQuestionCard questions={questions} notice={countingNote} />

  return (
    <Card.Root variant='frame' as='section' aria-labelledby={titleId}>
      <SummaryCardHeader
        id={titleId}
        title={t('process.questions', { defaultValue: 'Questions' })}
        count={election.questions.length}
        note={
          election.questions.length > 1 ? t('votes.summary.all_open', { defaultValue: 'All open at once' }) : undefined
        }
        noteAtEnd
      />
      {countingNote}
      {undecodable ? (
        <Card.Body>
          <ErrorBoundary
            fallback={
              <Text color='fg.muted'>
                {t('error.loading_section', { defaultValue: 'This section could not be loaded' })}
              </Text>
            }
            resetKeys={[election, results]}
          >
            <ElectionResults />
          </ErrorBoundary>
        </Card.Body>
      ) : (
        questions.map((question, index) => (
          <AllAtOnceRow
            key={question.id}
            question={question}
            index={index}
            model={model}
            state={questionStates[index]}
          />
        ))
      )}
      {desktop && <ResultsLine model={model} />}
    </Card.Root>
  )
}

import { Box, Card, Grid, Heading, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ProcessStatus, useProcessStateLabel } from '~components/ui/ProcessStatus'
import { TurnoutBar } from '~components/ui/TurnoutBar'
import { useVoteText } from '~i18n/use-vote-text'
import { quantity } from '~utils/numbers'
import { questionOutcome } from '~utils/vote-outcome'
import { isSettledQuestion, percentOf, questionElectorate, type QuestionState } from '~utils/vote-state'
import { QuestionResultBars } from '../QuestionResultBars'
import { questionKind } from './question-kind'
import type { SummaryModel } from './use-summary-model'

type RowProps = { question: VotingProcessQuestion; index: number; model: SummaryModel; state: QuestionState }

/** Decoded once per question: null while the tally is hidden, empty or unreadable. */
const useOutcome = (question: VotingProcessQuestion, weighted: boolean) =>
  useMemo(() => questionOutcome(question, question.results, { weighted }), [question, weighted])

const counts = (state: QuestionState) => state === 'open' || state === 'paused' || state === 'closed'

/**
 * Whether a question-by-question row draws its bars: once opened, while its tally is public (a secret one only once
 * the question is over) and the tally is served.
 */
const byQuestionBars = (question: VotingProcessQuestion, state: QuestionState) =>
  counts(state) && (state === 'closed' || !question.secretUntilTheEnd) && !!question.results?.results?.length

/** Whether Resum shows this question's tally, in either mode (the same rule on every width). */
export const showsTally = (question: VotingProcessQuestion, state: QuestionState, model: SummaryModel) =>
  model.byQuestion
    ? byQuestionBars(question, state)
    : !!questionOutcome(question, question.results, { weighted: !!model.election.census?.weighted })

/** The per-choice bars of a row, as Resum draws them on every width. */
const RowBars = ({
  question,
  model,
  final,
}: {
  question: VotingProcessQuestion
  model: SummaryModel
  final: boolean
}) => (
  <QuestionResultBars
    question={question}
    results={question.results}
    weighted={!!model.election.census?.weighted}
    final={final}
    layout='plain'
  />
)

// On a question title's line, or (`inline`) on the running line of a one-line row.
const QuestionNumber = ({ index, inline = false }: { index: number; inline?: boolean }) =>
  inline ? (
    <Text fontFamily='figure' fontSize='sm' letterSpacing='none' color='fg.subtle'>
      {index + 1}
    </Text>
  ) : (
    <Text textStyle='question-number' color='fg.subtle'>
      {index + 1}
    </Text>
  )

/**
 * A question of a question-by-question vote on the desktop: one line with its number, title, votes with
 * their share of the electorate, and state; under it, once it has opened and while its tally is public, a bar per
 * choice.
 */
export const ByQuestionRow = ({ question, index, model, state }: RowProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const votes = question.results?.voteCount ?? 0
  const percent = percentOf(votes, questionElectorate(question, model.election))
  const title = text(question.title)
  const hasBars = byQuestionBars(question, state)

  return (
    <Card.Body pt='row' pb='3'>
      <Grid templateColumns='[{sizes.6} minmax(0, 1fr) auto {sizes.24}]' columnGap='3' alignItems='baseline'>
        <QuestionNumber index={index} inline />
        <Text
          fontWeight='medium-plus'
          truncate
          title={title}
          color={state === 'toOpen' || state === 'canceled' ? 'fg.muted' : 'fg'}
        >
          {title}
        </Text>
        <Text textStyle='figure' color='fg.subtle' textAlign='end' whiteSpace='nowrap'>
          {counts(state) &&
            (percent === undefined
              ? quantity(votes)
              : t('votes.summary.question_turnout', {
                  defaultValue: '{{votes}} · {{percent}}%',
                  votes: quantity(votes),
                  percent,
                }))}
        </Text>
        <ProcessStatus kind='question' state={state} />
        {hasBars && (
          <Box gridColumn='2 / -1' pt='3'>
            <RowBars question={question} model={model} final={state === 'closed' && isSettledQuestion(question)} />
          </Box>
        )}
      </Grid>
    </Card.Body>
  )
}

/**
 * A question of an all-at-once vote on the desktop: its title and how it is answered, then (once voting has begun)
 * how many answered it and how many left it blank, and last, when the results are public, a bar per choice.
 */
export const AllAtOnceRow = ({ question, index, model }: RowProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const outcome = useOutcome(question, !!model.election.census?.weighted)
  const votes = question.results?.voteCount ?? 0
  const electorate = questionElectorate(question, model.election)
  const percent = percentOf(votes, electorate)
  const kind = questionKind(t, question)
  const started = model.state === 'live' || model.state === 'paused' || model.state === 'closed'
  const blank = Math.max(0, model.count - votes)

  return (
    <Card.Body pb='4'>
      <Grid templateColumns='[{sizes.6} minmax(0, 1fr)]'>
        <QuestionNumber index={index} />
        <Stack gap='3' minW='0'>
          <Box>
            <Heading as='h3' textStyle='question-title'>
              {text(question.title)}
            </Heading>
            {kind && (
              <Text textStyle='body-sm' color='fg.subtle' mt='note'>
                {kind}
              </Text>
            )}
          </Box>
          {started && (
            <TurnoutBar
              caption={
                electorate
                  ? t('votes.summary.answered', {
                      defaultValue: 'Turnout: {{answered}} of {{total}}',
                      answered: quantity(votes),
                      total: quantity(electorate),
                    })
                  : t('votes.summary.question_votes', {
                      defaultValue_one: '{{count, number}} vote',
                      defaultValue_other: '{{count, number}} votes',
                      count: votes,
                    })
              }
              share={
                percent === undefined ? undefined : t('votes.manage.percent', { defaultValue: '{{percent}}%', percent })
              }
              value={votes}
              max={electorate}
              layout='compact'
              closed={model.state === 'closed'}
              label={t('votes.summary.answered_label', {
                defaultValue: '{{answered}} of {{total}} people answered question {{number}}.',
                answered: votes,
                total: electorate ?? 0,
                number: index + 1,
              })}
            />
          )}
          {started && model.count > 0 && (
            <Text textStyle='body-sm' color='fg.subtle'>
              {t('votes.summary.blank', {
                defaultValue_one: '{{count, number}} of the {{voters}} voters left it blank.',
                defaultValue_other: '{{count, number}} of the {{voters}} voters left it blank.',
                count: blank,
                voters: quantity(model.count),
              })}
            </Text>
          )}
          {/* The tally last, as the board draws it: Resum is where the results are read. */}
          {outcome && <RowBars question={question} model={model} final={!!question.results?.finalResults} />}
        </Stack>
      </Grid>
    </Card.Body>
  )
}

/**
 * A question on a phone or tablet, in either mode: number, title and one quiet line. Question by question it says
 * the state and its detail ("Closed. Yes, 198 to 7.", "Open. 172 votes.", "To open."); all at once, the result
 * when public and the votes. Under it, the same bars as the desktop rows whenever the tally is public.
 */
export const CompactQuestionRow = ({ question, index, model, state }: RowProps) => {
  const { t } = useTranslation()
  const { text, outcome: describe } = useVoteText()
  const stateLabel = useProcessStateLabel()
  const outcome = useOutcome(question, !!model.election.census?.weighted)
  const votes = question.results?.voteCount ?? 0
  const votesText = t('votes.summary.question_votes', {
    defaultValue_one: '{{count, number}} vote',
    defaultValue_other: '{{count, number}} votes',
    count: votes,
  })

  let meta: string | null
  if (model.byQuestion) {
    const result = state === 'closed' && isSettledQuestion(question) ? describe(outcome) : null
    const detail = result ?? (counts(state) && votes > 0 ? votesText : null)
    meta = detail
      ? t('votes.summary.row.state_detail', {
          defaultValue: '{{state}}. {{detail}}.',
          state: stateLabel(state, 'question'),
          detail,
        })
      : t('votes.summary.row.state', { defaultValue: '{{state}}.', state: stateLabel(state, 'question') })
  } else {
    meta = [describe(outcome), votes > 0 ? votesText : null].filter(Boolean).join(', ') || null
  }
  const bars = model.byQuestion ? byQuestionBars(question, state) : !!outcome
  const final = model.byQuestion ? state === 'closed' && isSettledQuestion(question) : !!question.results?.finalResults

  return (
    <Card.Body py='3'>
      <Grid templateColumns='[{sizes.6} minmax(0, 1fr)]' columnGap='2' rowGap='0.5' alignItems='baseline'>
        <QuestionNumber index={index} />
        <Text textStyle='question-line'>{text(question.title)}</Text>
        {meta && (
          <Text gridColumn='2' textStyle='note' color='fg.subtle'>
            {meta}
          </Text>
        )}
        {bars && (
          <Box gridColumn='2' pt='2.5'>
            <RowBars question={question} model={model} final={final} />
          </Box>
        )}
      </Grid>
    </Card.Body>
  )
}

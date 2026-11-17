import { Box, Card, Grid, Heading, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useTranslation } from 'react-i18next'
import { TurnoutBar } from '~components/ui/TurnoutBar'
import { useVoteText } from '~i18n/use-vote-text'
import { quantity } from '~utils/numbers'
import { tallyIsPublic } from '~utils/question-tally'
import { percentOf, questionElectorate, type QuestionState } from '~utils/vote-state'
import { QuestionResultBars } from '../QuestionResultBars'
import { questionKind } from './question-kind'
import type { SummaryModel } from './use-summary-model'

type RowProps = { question: VotingProcessQuestion; index: number; model: SummaryModel; state: QuestionState }

const counts = (state: QuestionState) => state === 'open' || state === 'paused' || state === 'closed'

/**
 * Whether a question-by-question row draws its bars: once opened, while its tally is public (a secret one only once
 * the question is over) and the tally is served. ByQuestionCard's rows draw them by the same rule.
 */
const byQuestionBars = (question: VotingProcessQuestion, state: QuestionState) =>
  counts(state) && (state === 'closed' || !question.secretUntilTheEnd) && !!question.results?.results?.length

/** Whether Resum shows this question's tally, in either mode (the same rule on every width): the analytics read it. */
export const showsTally = (question: VotingProcessQuestion, state: QuestionState, model: SummaryModel) =>
  model.byQuestion ? byQuestionBars(question, state) : tallyIsPublic(question)

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

// On a question title's line.
const QuestionNumber = ({ index }: { index: number }) => (
  <Text textStyle='question-number' color='fg.subtle'>
    {index + 1}
  </Text>
)

const hasStarted = (model: SummaryModel) =>
  model.state === 'live' || model.state === 'paused' || model.state === 'closed'

/** "Turnout: 184 of 312" with its share over the bar: how many answered this question, on every width. */
const QuestionTurnout = ({ question, index, model }: Omit<RowProps, 'state'>) => {
  const { t } = useTranslation()
  const votes = question.results?.voteCount ?? 0
  const electorate = questionElectorate(question, model.election, model.canManage)
  const percent = percentOf(votes, electorate)

  return (
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
      share={percent === undefined ? undefined : t('votes.manage.percent', { defaultValue: '{{percent}}%', percent })}
      value={votes}
      max={electorate}
      layout='compact'
      closed={model.state === 'closed'}
      label={
        electorate
          ? t('votes.summary.answered_label', {
              defaultValue: '{{answered}} of {{total}} people answered question {{number}}.',
              answered: votes,
              total: electorate,
              number: index + 1,
            })
          : t('votes.summary.answered_count_label', {
              defaultValue_one: '{{count, number}} person answered question {{number}}.',
              defaultValue_other: '{{count, number}} people answered question {{number}}.',
              count: votes,
              number: index + 1,
            })
      }
    />
  )
}

/**
 * A question of an all-at-once vote on the desktop: its title and how it is answered, then (once voting has begun)
 * how many answered it and how many left it blank, and last, when the results are public, a bar per choice.
 */
export const AllAtOnceRow = ({ question, index, model }: RowProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const votes = question.results?.voteCount ?? 0
  const kind = questionKind(t, question)
  const started = hasStarted(model)
  const blank = Math.max(0, model.count - votes)
  // "Left it blank" only holds when every voter could answer it: never for a question with its own electorate, and
  // not for someone the API does not tell whether it has one.
  const showBlank = started && model.count > 0 && model.canManage && !question.eligibleMemberIds?.length

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
          {started && <QuestionTurnout question={question} index={index} model={model} />}
          {showBlank && (
            <Text textStyle='body-sm' color='fg.subtle'>
              {blank > 0
                ? t('votes.summary.blank', {
                    defaultValue_one: '{{count, number}} of the {{voters}} voters left it blank.',
                    defaultValue_other: '{{count, number}} of the {{voters}} voters left it blank.',
                    count: blank,
                    voters: quantity(model.count),
                  })
                : t('votes.summary.blank_none', { defaultValue: 'Nobody left it blank.' })}
            </Text>
          )}
          {/* The tally last, as the board draws it: Resum is where the results are read. */}
          {tallyIsPublic(question) && (
            <RowBars question={question} model={model} final={!!question.results?.finalResults} />
          )}
        </Stack>
      </Grid>
    </Card.Body>
  )
}

/**
 * A question of an all-at-once vote on a phone or tablet (M4Vote): number and title, once voting has begun how many
 * answered it, and the same bars as the desktop rows whenever the tally is public. No sentence says who wins.
 */
export const CompactQuestionRow = ({ question, index, model }: RowProps) => {
  const { text } = useVoteText()

  return (
    <Card.Body py='3'>
      <Grid templateColumns='[{sizes.6} minmax(0, 1fr)]' columnGap='2' rowGap='0.5' alignItems='baseline'>
        <QuestionNumber index={index} />
        <Text textStyle='question-line'>{text(question.title)}</Text>
        {hasStarted(model) && (
          <Box gridColumn='2' pt='2' maxW={{ md: 'lg' }}>
            <QuestionTurnout question={question} index={index} model={model} />
          </Box>
        )}
        {tallyIsPublic(question) && (
          <Box gridColumn='2' pt='2.5' maxW={{ md: 'lg' }}>
            <RowBars question={question} model={model} final={!!question.results?.finalResults} />
          </Box>
        )}
      </Grid>
    </Card.Body>
  )
}

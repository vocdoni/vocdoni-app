import { Box, Card, Flex, Grid, Heading, Icon, Span, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ProcessStatus, useProcessStateLabel } from '~components/ui/ProcessStatus'
import { TurnoutBar } from '~components/ui/TurnoutBar'
import { useVoteText } from '~i18n/use-vote-text'
import { CheckIcon } from '~theme/icons'
import { quantity } from '~utils/numbers'
import { questionOutcome } from '~utils/vote-outcome'
import { percentOf, questionElectorate, type QuestionState } from '~utils/vote-state'
import { questionKind } from './question-kind'
import { QuestionVerdict } from './QuestionVerdict'
import type { SummaryModel } from './use-summary-model'

type RowProps = { question: VotingProcessQuestion; index: number; model: SummaryModel; state: QuestionState }

/** Decoded once per question: null while the tally is hidden, empty or unreadable. */
const useOutcome = (question: VotingProcessQuestion, weighted: boolean) =>
  useMemo(() => questionOutcome(question, question.results, { weighted }), [question, weighted])

const counts = (state: QuestionState) => state === 'open' || state === 'paused' || state === 'closed'

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
 * A question of a question-by-question vote on the desktop: one line with its number, title, result, votes with
 * their share of the electorate, and state.
 */
export const ByQuestionRow = ({ question, index, model, state }: RowProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const outcome = useOutcome(question, !!model.election.census?.weighted)
  const votes = question.results?.voteCount ?? 0
  const percent = percentOf(votes, questionElectorate(question, model.election))
  const title = text(question.title)

  return (
    <Card.Body pt='row' pb='3'>
      <Grid templateColumns='[{sizes.6} minmax(0, 1fr) auto auto {sizes.24}]' columnGap='3' alignItems='baseline'>
        <QuestionNumber index={index} inline />
        <Text
          fontWeight='medium-plus'
          truncate
          title={title}
          color={state === 'toOpen' || state === 'canceled' ? 'fg.muted' : 'fg'}
        >
          {title}
        </Text>
        <Text textStyle='eyebrow' whiteSpace='nowrap'>
          {state === 'closed' && outcome && <QuestionVerdict outcome={outcome} />}
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
      </Grid>
    </Card.Body>
  )
}

/**
 * A question of an all-at-once vote on the desktop: its title and how it is answered, then (once voting has begun)
 * how many answered it over a compact bar, how many left it blank and, when the results are public, its result.
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
          {outcome && (
            <Flex align='center' gap='1.5' textStyle='control' fontWeight='medium-plus'>
              {question.results?.finalResults && (
                <Icon as={CheckIcon} boxSize='3.5' color='status.success.fg' aria-hidden />
              )}
              <Span>
                <QuestionVerdict outcome={outcome} />
              </Span>
              {!question.results?.finalResults && (
                <Span fontWeight='normal' color='fg.subtle'>
                  {t('votes.summary.provisional', { defaultValue: 'Provisional result' })}
                </Span>
              )}
            </Flex>
          )}
          {started && (
            <TurnoutBar
              caption={
                electorate
                  ? t('votes.summary.answered', {
                      defaultValue: '{{answered}} of {{total}} answered it',
                      answered: quantity(votes),
                      total: quantity(electorate),
                    })
                  : t('votes.summary.question_votes', {
                      defaultValue_one: '{{count}} vote',
                      defaultValue_other: '{{count}} votes',
                      count: votes,
                    })
              }
              share={percent === undefined ? undefined : `${percent}%`}
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
                defaultValue_one: '{{count}} of the {{voters}} voters left it blank.',
                defaultValue_other: '{{count}} of the {{voters}} voters left it blank.',
                count: blank,
                voters: quantity(model.count),
              })}
            </Text>
          )}
        </Stack>
      </Grid>
    </Card.Body>
  )
}

/**
 * A question on a phone or tablet, in either mode: number, title and one quiet line. Question by question it says
 * the state and its detail ("Closed. Yes, 198 to 7.", "Open. 172 votes.", "To open."); all at once, the result
 * when public and the votes.
 */
export const CompactQuestionRow = ({ question, index, model, state }: RowProps) => {
  const { t } = useTranslation()
  const { text, outcome: describe } = useVoteText()
  const stateLabel = useProcessStateLabel()
  const outcome = useOutcome(question, !!model.election.census?.weighted)
  const votes = question.results?.voteCount ?? 0
  const votesText = t('votes.summary.question_votes', {
    defaultValue_one: '{{count}} vote',
    defaultValue_other: '{{count}} votes',
    count: votes,
  })

  let meta: string | null
  if (model.byQuestion) {
    const result = state === 'closed' ? describe(outcome) : null
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

  return (
    <Card.Body py='3'>
      <Grid templateColumns='[{sizes.6} minmax(0, 1fr)]' columnGap='2' rowGap='0.5' alignItems='baseline'>
        <QuestionNumber index={index} />
        <Text fontSize='item' fontWeight='medium-plus'>
          {text(question.title)}
        </Text>
        {meta && (
          <Text gridColumn='2' textStyle='note' color='fg.subtle'>
            {meta}
          </Text>
        )}
      </Grid>
    </Card.Body>
  )
}

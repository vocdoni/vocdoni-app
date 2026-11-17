import { Box, Grid, Icon, Progress, Span, Stack, Text } from '@chakra-ui/react'
import type { QuestionResults, VotingProcessQuestion } from '@vocdoni/api-types'
import { decodeQuestionResults, tryInferQuestionBallotType } from '@vocdoni/ballot'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useVoteText } from '~i18n/use-vote-text'
import { CheckIcon } from '~theme/icons'
import { quantity } from '~utils/numbers'
import { questionOutcome } from '~utils/vote-outcome'

export type QuestionResultBarsProps = {
  question: VotingProcessQuestion
  results?: QuestionResults
  /** A closed question's tally: the winner gets the check, the weight and the tag, the other choices dim. Without
   * it the bars are provisional (an open question with live results): no winner, nothing dimmed. */
  final?: boolean
  /** Votes are summed weights. */
  weighted?: boolean
}

type Tally = { key: string; value?: number; votes: number }

// One entry per choice, in ballot order, then the abstentions of a multiple-choice question.
const tallyOf = (question: VotingProcessQuestion, results?: QuestionResults): Tally[] | null => {
  if (!results?.results?.length || !tryInferQuestionBallotType(question)) return null
  try {
    const decoded = decodeQuestionResults(question, results.results)
    const byChoice = new Map<number | 'abstain', number>(decoded.map((entry) => [entry.choice, entry.votes] as const))
    const rows: Tally[] = question.choices.map((choice) => ({
      key: String(choice.value),
      value: choice.value,
      votes: byChoice.get(choice.value) ?? 0,
    }))
    const abstain = byChoice.get('abstain')
    return abstain !== undefined ? [...rows, { key: 'abstain', votes: abstain }] : rows
  } catch {
    return null
  }
}

/**
 * One bar per choice of a question (board V4VoteManage): a column for the winner's check, the choice and its tag,
 * the votes and the share of the question's votes, and a 6px bar under them.
 */
export const QuestionResultBars = ({ question, results, final = false, weighted = false }: QuestionResultBarsProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const tally = useMemo(() => tallyOf(question, results), [question, results])
  const winner = useMemo(() => {
    const outcome = final ? questionOutcome(question, results, { weighted }) : null
    if (outcome?.kind === 'pair' || outcome?.kind === 'winner') return outcome.winner.value
    return outcome?.kind === 'top' ? outcome.choice.value : undefined
  }, [final, question, results, weighted])
  if (!tally) return null

  // A weighted tally counts weight, not voters: its share is of the total weight.
  const total = tally.reduce((sum, entry) => sum + entry.votes, 0)
  const base = weighted ? total : results?.voteCount || total
  const choiceTitle = (entry: Tally) => {
    const choice = question.choices.find((candidate) => candidate.value === entry.value)
    return choice ? text(choice.title) : t('votes.manage.abstention', { defaultValue: 'Abstention' })
  }

  return (
    <Stack gap='2'>
      {tally.map((entry) => {
        const won = entry.value !== undefined && entry.value === winner
        const percent = base > 0 ? Math.round((entry.votes / base) * 100) : 0
        const label = choiceTitle(entry)
        const votes = quantity(entry.votes)
        const share = t('votes.manage.percent', { defaultValue: '{{percent}}%', percent })
        return (
          <Grid key={entry.key} templateColumns='[{sizes.5} minmax(0, 1fr) auto]' rowGap='1' alignItems='baseline'>
            <Box alignSelf='center' display='flex' color='status.success.fg'>
              {won && (
                <Box as='span' role='img' aria-label={t('votes.manage.winner', { defaultValue: 'Winning choice' })}>
                  <Icon as={CheckIcon} boxSize='icon.xs' aria-hidden />
                </Box>
              )}
            </Box>
            <Text minW='0' display='inline-flex' alignItems='baseline' gap='2'>
              <Span fontWeight={won ? 'semibold' : 'normal'}>{label}</Span>
              {won && (
                <Span textStyle='eyebrow' color='status.success.fg'>
                  {t('votes.manage.winner_tag', { defaultValue: 'Winner' })}
                </Span>
              )}
            </Text>
            <Text whiteSpace='nowrap'>
              <Span textStyle='figure' fontWeight='medium'>
                {votes}
              </Span>
              <Span textStyle='figure' color='fg.subtle' display='inline-block' minW='results.share' textAlign='end'>
                {share}
              </Span>
            </Text>
            <Progress.Root
              variant='results'
              value={Math.min(percent, 100)}
              gridColumn='2 / span 2'
              translations={{ value: () => `${label}, ${votes}, ${share}` }}
            >
              <Progress.Track>
                <Progress.Range opacity={final && winner !== undefined && !won ? 'outvoted' : undefined} />
              </Progress.Track>
            </Progress.Root>
          </Grid>
        )
      })}
    </Stack>
  )
}

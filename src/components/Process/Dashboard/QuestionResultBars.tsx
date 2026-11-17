import { Grid, Progress, Span, Stack, Text } from '@chakra-ui/react'
import type { QuestionResults, VotingProcessQuestion } from '@vocdoni/api-types'
import { BallotType, decodeQuestionResults, tryInferQuestionBallotType } from '@vocdoni/ballot'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useVoteText } from '~i18n/use-vote-text'
import { quantity } from '~utils/numbers'
import { questionOutcome } from '~utils/vote-outcome'

export type QuestionResultBarsProps = {
  question: VotingProcessQuestion
  results?: QuestionResults
  /** A closed question's tally: the winner's label is set in bold and the other choices dim. Without it the bars are
   * provisional (an open question with live results): no winner, nothing dimmed. */
  final?: boolean
  /** Votes are summed weights. */
  weighted?: boolean
  /**
   * `indented` (a question-by-question row from `lg`): an empty 20px column before the label and plain counts.
   * `plain`: the bars align with the title and counts carry their unit.
   */
  layout?: 'indented' | 'plain'
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

// Ranked and budget tallies count points; a quadratic one counts several votes per voter.
const POINTS: ReadonlySet<BallotType> = new Set([BallotType.Ranked, BallotType.Budget])
const SHARE_OF_TOTAL: ReadonlySet<BallotType> = new Set([...POINTS, BallotType.Quadratic])

/**
 * One bar per choice of a question: the choice, its votes and their share, and a 6px bar under them. The `indented`
 * layout (board V4VoteOne) leaves a 20px column before the label; `plain` (V4VoteManageAll, the touch boards) is below.
 */
export const QuestionResultBars = ({
  question,
  results,
  final = false,
  weighted = false,
  layout = 'indented',
}: QuestionResultBarsProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const tally = useMemo(() => tallyOf(question, results), [question, results])
  const winner = useMemo(() => {
    const outcome = final && layout === 'indented' ? questionOutcome(question, results, { weighted }) : null
    if (outcome?.kind === 'pair' || outcome?.kind === 'winner') return outcome.winner.value
    return outcome?.kind === 'top' ? outcome.choice.value : undefined
  }, [final, layout, question, results, weighted])
  if (!tally) return null

  const type = tryInferQuestionBallotType(question)
  // A weighted or point-based tally is not one entry per voter: its share is of the total.
  const total = tally.reduce((sum, entry) => sum + entry.votes, 0)
  const base = weighted || (type && SHARE_OF_TOTAL.has(type)) ? total : results?.voteCount || total
  const choiceTitle = (entry: Tally) => {
    const choice = question.choices.find((candidate) => candidate.value === entry.value)
    return choice ? text(choice.title) : t('votes.manage.abstention', { defaultValue: 'Abstention' })
  }
  const percentOf = (entry: Tally) => (base > 0 ? Math.round((entry.votes / base) * 100) : 0)

  if (layout === 'plain') {
    const points = !!type && POINTS.has(type)
    const top = Math.max(...tally.map((entry) => entry.votes))
    return (
      <Stack gap='2'>
        {tally.map((entry) => {
          const leads = final && top > 0 && entry.votes === top
          const percent = percentOf(entry)
          const label = choiceTitle(entry)
          const votes = quantity(entry.votes)
          const count = points
            ? t('votes.results.choice_points', {
                defaultValue_one: '{{votes}} point',
                defaultValue_other: '{{votes}} points',
                count: entry.votes,
                votes,
              })
            : t('votes.results.choice_votes', {
                defaultValue_one: '{{votes}} vote',
                defaultValue_other: '{{votes}} votes',
                count: entry.votes,
                votes,
              })
          const share = t('votes.manage.percent', { defaultValue: '{{percent}}%', percent })
          return (
            <Grid key={entry.key} templateColumns='[minmax(0, 1fr) auto]' rowGap='1' alignItems='baseline'>
              {/* The touch boards keep the label and the count regular; the desktop one weighs the top choice. */}
              <Text
                minW='0'
                textStyle={{ base: 'body', lg: 'control' }}
                lineHeight='row.title'
                fontWeight={leads ? { base: 'normal', lg: 'semibold' } : 'normal'}
              >
                {label}
              </Text>
              <Text whiteSpace='nowrap' textStyle='figure' lineHeight='row.title'>
                <Span fontWeight={{ base: 'normal', lg: 'medium' }}>{count}</Span>
                <Span color='fg.subtle' display='inline-block' minW='results.share' textAlign='end'>
                  {share}
                </Span>
              </Text>
              <Progress.Root
                variant='results'
                value={Math.min(percent, 100)}
                gridColumn='1 / span 2'
                translations={{ value: () => `${label}, ${count}, ${share}` }}
              >
                <Progress.Track>
                  <Progress.Range opacity={final && top > 0 && !leads ? 'outvoted' : undefined} />
                </Progress.Track>
              </Progress.Root>
            </Grid>
          )
        })}
      </Stack>
    )
  }

  return (
    <Stack gap='2'>
      {tally.map((entry) => {
        const won = entry.value !== undefined && entry.value === winner
        const percent = percentOf(entry)
        const label = choiceTitle(entry)
        const votes = quantity(entry.votes)
        const share = t('votes.manage.percent', { defaultValue: '{{percent}}%', percent })
        return (
          <Grid
            key={entry.key}
            templateColumns='[{sizes.5} minmax(0, 1fr) auto]'
            rowGap='1'
            alignItems='baseline'
            lineHeight='row.title'
          >
            <Text gridColumn='2' minW='0' fontWeight={won ? 'semibold' : 'normal'}>
              {label}
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

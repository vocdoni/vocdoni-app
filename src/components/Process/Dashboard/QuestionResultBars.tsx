import { Box, Grid, Icon, Progress, Span, Stack, Text } from '@chakra-ui/react'
import type { QuestionResults, VotingProcessQuestion } from '@vocdoni/api-types'
import { BallotType, decodeQuestionResults, tryInferQuestionBallotType } from '@vocdoni/ballot'
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
  /**
   * `checked` (Gestió): a check column, the winner's tag and plain counts. `plain` (Resum): the bars align with the
   * title, counts carry their unit and a final tally only sets the top choice in bold and dims the others.
   */
  layout?: 'checked' | 'plain'
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
 * One bar per choice of a question: the choice, its votes and their share, and a 6px bar under them. The `checked`
 * layout (board V4VoteManage) adds a column for the winner's check and its tag; `plain` (V4VoteManageAll) is below.
 */
export const QuestionResultBars = ({
  question,
  results,
  final = false,
  weighted = false,
  layout = 'checked',
}: QuestionResultBarsProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const tally = useMemo(() => tallyOf(question, results), [question, results])
  const winner = useMemo(() => {
    const outcome = final && layout === 'checked' ? questionOutcome(question, results, { weighted }) : null
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
              <Text minW='0' textStyle='control' lineHeight='row.title' fontWeight={leads ? 'semibold' : 'normal'}>
                {label}
              </Text>
              <Text whiteSpace='nowrap' textStyle='figure' lineHeight='row.title'>
                <Span fontWeight='medium'>{count}</Span>
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

import { Grid, Progress, Span, Stack, Text } from '@chakra-ui/react'
import type { QuestionResults, VotingProcessQuestion } from '@vocdoni/api-types'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useVoteText } from '~i18n/use-vote-text'
import { quantity } from '~utils/numbers'
import { tallyBase, tallyOf, tallyUnit, type Tally } from '~utils/question-tally'
import { percentOf } from '~utils/vote-state'

export type QuestionResultBarsProps = {
  question: VotingProcessQuestion
  results?: QuestionResults
  /** A closed question's tally: the leading choice's label weighs more and the other bars dim. Without it the bars
   * are provisional (an open question with live results): nothing is set apart. */
  final?: boolean
  /** Votes are summed weights. */
  weighted?: boolean
  /**
   * `indented` (a question-by-question row, board V4VoteOne): plain counts, and from `lg` an empty 20px column before
   * the label. `plain` (V4VoteManageAll): the bars align with the title and counts carry their unit. Below `lg` both
   * align with the title, label and count regular (the touch boards).
   */
  layout?: 'indented' | 'plain'
}

/**
 * The one choice set apart in a final tally: the single top count, never an abstention. A tie sets none apart, so the
 * drawing says no more than the words (nothing names a winner).
 */
const leaderOf = (tally: Tally[]): string | undefined => {
  const choices = tally.filter((entry) => entry.key !== 'abstain')
  const top = Math.max(0, ...choices.map((entry) => entry.votes))
  const leaders = choices.filter((entry) => entry.votes === top)
  return top > 0 && leaders.length === 1 ? leaders[0].key : undefined
}

const LAYOUT = {
  indented: {
    columns: { base: '[minmax(0, 1fr) auto]', lg: '[{sizes.5} minmax(0, 1fr) auto]' },
    span: { base: '1 / span 2', lg: '2 / span 2' },
    label: { gridColumn: { base: '1', lg: '2' }, lineHeight: { base: 'moderate', lg: 'row.title' } },
    weight: { base: 'normal', lg: 'semibold' },
    countWeight: { base: 'normal', lg: 'medium' },
  },
  plain: {
    columns: '[minmax(0, 1fr) auto]',
    span: '1 / span 2',
    label: { textStyle: { base: 'body', lg: 'control' } },
    weight: { base: 'normal', lg: 'semibold' },
    countWeight: { base: 'normal', lg: 'medium' },
  },
} as const

/** One bar per choice of a question: the choice, its count and its share, and a 6px bar under them. */
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
  if (!tally) return null

  const look = LAYOUT[layout]
  // A weighted or point-based tally is not one entry per voter: its share is of the total.
  const base = tallyBase(question, results, tally, weighted)
  const unit = tallyUnit(question, weighted)
  const leader = final ? leaderOf(tally) : undefined
  const choiceTitle = (entry: Tally) => {
    const choice = question.choices.find((candidate) => candidate.value === entry.value)
    return choice ? text(choice.title) : t('votes.manage.abstention', { defaultValue: 'Abstention' })
  }
  const countOf = (entry: Tally) => {
    const votes = quantity(entry.votes)
    if (layout === 'indented') return votes
    switch (unit) {
      case 'points':
        return t('votes.results.choice_points', {
          defaultValue_one: '{{votes}} point',
          defaultValue_other: '{{votes}} points',
          count: entry.votes,
          votes,
        })
      case 'weight':
        return t('votes.results.choice_weight', {
          defaultValue_one: '{{votes}} weighted vote',
          defaultValue_other: '{{votes}} weighted votes',
          count: entry.votes,
          votes,
        })
      default:
        return t('votes.results.choice_votes', {
          defaultValue_one: '{{votes}} vote',
          defaultValue_other: '{{votes}} votes',
          count: entry.votes,
          votes,
        })
    }
  }

  return (
    <Stack gap='2'>
      {tally.map((entry) => {
        const leads = entry.key === leader
        const percent = percentOf(entry.votes, base) ?? 0
        const label = choiceTitle(entry)
        const count = countOf(entry)
        const share = t('votes.manage.percent', { defaultValue: '{{percent}}%', percent })
        return (
          // `data-leading` marks the most voted option of a final tally, the row set apart.
          <Grid
            key={entry.key}
            data-leading={leads ? '' : undefined}
            templateColumns={look.columns}
            rowGap='1'
            alignItems='baseline'
            lineHeight='row.title'
          >
            <Text minW='0' lineHeight='row.title' {...look.label} fontWeight={leads ? look.weight : 'normal'}>
              {label}
            </Text>
            <Text whiteSpace='nowrap' textStyle='figure' lineHeight='row.title'>
              <Span fontWeight={look.countWeight}>{count}</Span>
              <Span color='fg.subtle' display='inline-block' minW='results.share' textAlign='end'>
                {share}
              </Span>
            </Text>
            <Progress.Root
              variant='results'
              value={Math.min(percent, 100)}
              gridColumn={look.span}
              translations={{ value: () => `${label}, ${count}, ${share}` }}
            >
              <Progress.Track>
                <Progress.Range opacity={leader !== undefined && !leads ? 'outvoted' : undefined} />
              </Progress.Track>
            </Progress.Root>
          </Grid>
        )
      })}
    </Stack>
  )
}

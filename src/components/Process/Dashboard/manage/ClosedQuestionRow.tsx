import { Box, HStack, Icon, Span, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useId, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { TurnoutBar } from '~components/ui/TurnoutBar'
import { useVoteText } from '~i18n/use-vote-text'
import { CheckIcon } from '~theme/icons'
import { quantity } from '~utils/numbers'
import { questionOutcome, type QuestionOutcome } from '~utils/vote-outcome'
import { percentOf } from '~utils/vote-state'
import { QuestionResultBars } from '../QuestionResultBars'
import { Figures } from './Figures'
import { QuestionRowFrame, RowChevron, RowHead } from './QuestionRow'
import { ProcessStatus } from '~components/ui/ProcessStatus'

type Verdict = { verdict: string; won: boolean; figures?: string }

/** The verdict of a closed question (the winning choice, or "Tie", until approval semantics exist) and its tally. */
const useVerdict = () => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  return (outcome: QuestionOutcome | null): Verdict | null => {
    switch (outcome?.kind) {
      case 'tie':
        return { verdict: t('votes.outcome.tie', { defaultValue: 'Tie' }), won: false }
      case 'pair':
        return {
          verdict: text(outcome.winner.title),
          won: true,
          figures: t('votes.manage.pair_figures', {
            defaultValue: '{{winnerVotes}} to {{otherVotes}}',
            winnerVotes: quantity(outcome.winnerVotes),
            otherVotes: quantity(outcome.otherVotes),
          }),
        }
      case 'winner':
        return {
          verdict: text(outcome.winner.title),
          won: true,
          figures: outcome.weighted
            ? t('votes.manage.weight_figures', { defaultValue: 'weight {{votes}}', votes: quantity(outcome.votes) })
            : t('votes.manage.vote_figures', {
                defaultValue_one: '{{votes}} vote',
                defaultValue_other: '{{votes}} votes',
                count: outcome.votes,
                votes: quantity(outcome.votes),
              }),
        }
      case 'top':
        return { verdict: text(outcome.choice.title), won: true }
      default:
        return null
    }
  }
}

/** The phone and tablet line under the title: "Closed. **Yes**, 198 to 7." */
const ClosedMeta = ({ verdict }: { verdict: Verdict | null }) => {
  const { t } = useTranslation()
  if (!verdict) return <>{t('votes.manage.meta.closed', { defaultValue: 'Closed.' })}</>
  const strong = <Span fontWeight='medium-plus' color={verdict.won ? 'status.success.fg' : 'fg'} />
  return verdict.figures ? (
    <Trans
      i18nKey='votes.manage.meta.closed_result'
      defaults='Closed. <b>{{verdict}}</b>, {{figures}}.'
      values={{ verdict: verdict.verdict, figures: verdict.figures }}
      components={{ b: strong }}
    />
  ) : (
    <Trans
      i18nKey='votes.manage.meta.closed_verdict'
      defaults='Closed. <b>{{verdict}}</b>.'
      values={{ verdict: verdict.verdict }}
      components={{ b: strong }}
    />
  )
}

export type ClosedQuestionRowProps = {
  question: VotingProcessQuestion
  number: number
  electorate?: number
  weighted: boolean
  expanded: boolean
  onToggle: () => void
}

/**
 * A closed question: one line that opens its detail. From `lg` the title, the verdict with its check, "198 to 7", the
 * share of the census, the state and a turning chevron; below `lg` the title over "Closed. **Yes**, 198 to 7.". The
 * detail is the question, its turnout and the final result bars.
 */
export const ClosedQuestionRow = ({
  question,
  number,
  electorate,
  weighted,
  expanded,
  onToggle,
}: ClosedQuestionRowProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const toVerdict = useVerdict()
  const detailId = useId()
  const results = question.results
  const outcome = useMemo(() => questionOutcome(question, results, { weighted }), [question, results, weighted])
  const verdict = toVerdict(outcome)
  const title = text(question.title)
  const count = results?.voteCount ?? 0
  const share = percentOf(count, electorate)
  const desktop = { base: 'none', lg: 'inline-flex' } as const
  const values = { voted: quantity(count), total: electorate ? quantity(electorate) : '?' }

  return (
    <QuestionRowFrame number={number}>
      <Stack gap='0' minW='0'>
        <RowHead
          alignItems={{ base: 'center', lg: 'baseline' }}
          toggle={{
            expanded,
            onToggle,
            controls: detailId,
            label: t('votes.manage.toggle_closed', {
              defaultValue: 'Question {{number}}, {{title}}. {{verdict}}. Show or hide the detail',
              number,
              title,
              verdict: verdict?.verdict ?? t('votes.question_state.closed', { defaultValue: 'Closed' }),
            }),
          }}
        >
          <Stack gap='0' flex='1' minW='0'>
            <Text
              textStyle='question-title'
              whiteSpace={{ lg: 'nowrap' }}
              overflow={{ lg: 'hidden' }}
              textOverflow={{ lg: 'ellipsis' }}
            >
              {title}
            </Text>
            <Text textStyle='note' color='fg.subtle' display={{ lg: 'none' }}>
              <ClosedMeta verdict={verdict} />
            </Text>
          </Stack>
          {verdict && (
            <HStack
              as='span'
              gap='1'
              textStyle='eyebrow'
              whiteSpace='nowrap'
              color={verdict.won ? 'status.success.fg' : 'fg'}
              display={desktop}
            >
              {verdict.won && <Icon as={CheckIcon} boxSize='icon.xs' aria-hidden />}
              {verdict.verdict}
            </HStack>
          )}
          {verdict?.figures && (
            <Text as='span' fontSize='xs' whiteSpace='nowrap' display={desktop}>
              <Figures text={verdict.figures} strong />
            </Text>
          )}
          {share !== undefined && (
            <Text as='span' textStyle='figure' color='fg.subtle' display={desktop}>
              {t('votes.manage.percent', { defaultValue: '{{percent}}%', percent: share })}
            </Text>
          )}
          <ProcessStatus kind='question' state='closed' display={desktop} />
          <RowChevron expanded={expanded} />
        </RowHead>
        <Box id={detailId} hidden={!expanded}>
          {expanded && (
            <Stack gap='3' pt={question.description ? '0.5' : '3'}>
              {question.description && (
                <Text textStyle='note' color='fg.subtle'>
                  {text(question.description)}
                </Text>
              )}
              <TurnoutBar
                caption={t('votes.manage.question_voted', { defaultValue: '{{voted}} of {{total}} voted', ...values })}
                share={
                  share !== undefined
                    ? t('votes.manage.percent', { defaultValue: '{{percent}}%', percent: share })
                    : undefined
                }
                value={count}
                max={electorate}
                label={t('votes.manage.question_ruler', {
                  defaultValue: '{{voted}} of {{total}} people voted, {{percent}}%.',
                  ...values,
                  percent: share ?? 0,
                })}
                layout={{ base: 'scale', lg: 'compact' }}
                maxW={{ md: 'turnout.max', lg: 'full' }}
              />
              <QuestionResultBars question={question} results={results} weighted={weighted} final />
            </Stack>
          )}
        </Box>
      </Stack>
    </QuestionRowFrame>
  )
}

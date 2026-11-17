import { Box, HStack, Icon, Span, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useId, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { TurnoutBar } from '~components/ui/TurnoutBar'
import { useVoteText } from '~i18n/use-vote-text'
import { CheckIcon } from '~theme/icons'
import { quantity } from '~utils/numbers'
import { questionOutcome, type QuestionOutcome } from '~utils/vote-outcome'
import { isSettledQuestion, percentOf } from '~utils/vote-state'
import { QuestionResultBars } from '../QuestionResultBars'
import { QuestionRowFrame, RowChevron, RowHead } from './QuestionRow'
import { ProcessStatus } from '~components/ui/ProcessStatus'

type Verdict = { verdict: string; won: boolean }

/** The verdict of a closed question: the winning choice, or "Tie" until approval semantics exist. No tally. */
const useVerdict = () => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  return (outcome: QuestionOutcome | null): Verdict | null => {
    switch (outcome?.kind) {
      case 'tie':
        return { verdict: t('votes.outcome.tie', { defaultValue: 'Tie' }), won: false }
      case 'pair':
      case 'winner':
        return { verdict: text(outcome.winner.title), won: true }
      case 'top':
        return { verdict: text(outcome.choice.title), won: true }
      default:
        return null
    }
  }
}

/** The phone and tablet line under the title: "Closed. **Yes**." */
const ClosedMeta = ({ verdict }: { verdict: Verdict | null }) => {
  const { t } = useTranslation()
  if (!verdict) return <>{t('votes.manage.meta.closed', { defaultValue: 'Closed.' })}</>
  return (
    <Trans
      i18nKey='votes.manage.meta.closed_verdict'
      defaults='Closed. <b>{{verdict}}</b>.'
      values={{ verdict: verdict.verdict }}
      components={{ b: <Span fontWeight='medium-plus' color={verdict.won ? 'status.success.fg' : 'fg'} /> }}
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
 * A closed question: one line that opens its detail. From `lg` the title, the verdict with its check, the share of
 * the census, the state and a turning chevron; below `lg` the title over "Closed. **Yes**.". The tally lives in the
 * detail: the question, its turnout and the final result bars.
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
  // Closed by the clock alone, votes may still land: no verdict and no winner until the server says it is over.
  const settled = isSettledQuestion(question)
  const outcome = useMemo(
    () => (settled ? questionOutcome(question, results, { weighted }) : null),
    [settled, question, results, weighted]
  )
  const verdict = toVerdict(outcome)
  const title = text(question.title)
  const count = results?.voteCount ?? 0
  const share = percentOf(count, electorate)
  const desktop = { base: 'none', lg: 'inline-flex' } as const
  const values = { voted: quantity(count), total: electorate ? quantity(electorate) : '' }
  // Without a known electorate the sentences leave the total out instead of printing a placeholder.
  const voted = electorate
    ? t('votes.manage.question_voted', { defaultValue: '{{voted}} of {{total}} voted', ...values })
    : t('votes.manage.question_voted_count', { defaultValue: '{{voted}} voted', ...values })

  return (
    <QuestionRowFrame number={number}>
      <Stack gap='0' minW='0'>
        <RowHead
          alignItems={{ base: 'center', lg: 'baseline' }}
          toggle={{
            expanded,
            onToggle,
            controls: detailId,
            number,
          }}
        >
          {/* Spans: the line is the row's toggle button, which takes phrasing content only. */}
          <Stack as='span' gap='0' flex='1' minW='0'>
            <Text
              as='span'
              display='block'
              textStyle='question-line'
              whiteSpace={{ lg: 'nowrap' }}
              overflow={{ lg: 'hidden' }}
              textOverflow={{ lg: 'ellipsis' }}
            >
              {title}
            </Text>
            <Text as='span' textStyle='note' color='fg.subtle' display={{ base: 'block', lg: 'none' }}>
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
          {share !== undefined && (
            <Text as='span' textStyle='figure' color='fg.subtle' display={desktop}>
              {t('votes.manage.percent', { defaultValue: '{{percent}}%', percent: share })}
            </Text>
          )}
          <ProcessStatus as='span' kind='question' state='closed' display={desktop} />
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
                caption={voted}
                share={
                  share !== undefined
                    ? t('votes.manage.percent', { defaultValue: '{{percent}}%', percent: share })
                    : undefined
                }
                value={count}
                max={electorate}
                label={
                  electorate
                    ? t('votes.manage.question_ruler', {
                        defaultValue: '{{voted}} of {{total}} people voted, {{percent}}%.',
                        ...values,
                        percent: share ?? 0,
                      })
                    : t('votes.manage.question_ruler_count', { defaultValue: '{{voted}} people voted.', ...values })
                }
                layout={{ base: 'scale', lg: 'compact' }}
                maxW={{ md: 'turnout.max', lg: 'full' }}
              />
              <QuestionResultBars question={question} results={results} weighted={weighted} final={settled} />
            </Stack>
          )}
        </Box>
      </Stack>
    </QuestionRowFrame>
  )
}

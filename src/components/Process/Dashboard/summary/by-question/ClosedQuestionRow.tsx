import { Box, Span, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useId } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ProcessStatus } from '~components/ui/ProcessStatus'
import { TurnoutBar } from '~components/ui/TurnoutBar'
import { useVoteText } from '~i18n/use-vote-text'
import { isSettledQuestion, percentOf } from '~utils/vote-state'
import { QuestionResultBars } from '../../QuestionResultBars'
import { QuestionRowFrame, RowChevron, RowHead, RowTitleLine } from './QuestionRow'
import { useManageText } from './use-manage-text'

export type ClosedQuestionRowProps = {
  question: VotingProcessQuestion
  number: number
  electorate?: number
  weighted: boolean
  expanded: boolean
  onToggle: () => void
}

/**
 * A closed question: one line that opens its result. The title, "69% turnout", the state and a turning chevron (from
 * `lg` on one line, below it the turnout and the state under the title), and opened, the question, its turnout and a
 * bar per choice. No verdict: the bars tell it (owner).
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
  const manageText = useManageText()
  const detailId = useId()
  const results = question.results
  // Closed by the clock alone, votes may still land: no winner until the server says it is over.
  const settled = isSettledQuestion(question)
  const count = results?.voteCount ?? 0
  const share = percentOf(count, electorate)
  const percent = share !== undefined ? t('votes.manage.percent', { defaultValue: '{{percent}}%', percent: share }) : ''
  const note = manageText.note(question)

  return (
    <QuestionRowFrame number={number}>
      <Stack gap='0' minW='0'>
        <RowHead
          alignItems={{ base: 'center', lg: 'baseline' }}
          toggle={{ expanded, onToggle, controls: detailId, number }}
        >
          <RowTitleLine title={text(question.title)}>
            {share !== undefined && (
              <Text
                as='span'
                textStyle={{ base: 'meta', lg: 'caption' }}
                letterSpacing='body'
                color='fg.subtle'
                whiteSpace='nowrap'
              >
                {/* The figure in the figure face (the boards' `.m`), the words as they are. */}
                <Trans
                  i18nKey='votes.manage.turnout_figure'
                  defaults='<n>{{percent}}%</n> turnout'
                  values={{ percent: share }}
                  components={{ n: <Span fontFamily='figure' letterSpacing='none' /> }}
                />
              </Text>
            )}
            <ProcessStatus as='span' kind='question' state='closed' />
          </RowTitleLine>
          <RowChevron expanded={expanded} />
        </RowHead>
        <Box id={detailId} hidden={!expanded}>
          {expanded && (
            // The desktop board's detail sits 12px under the line with its note 1px under it; the touch boards' 10px.
            <Stack
              gap={{ base: '2', lg: '3' }}
              pt={note ? 'note' : { base: '2.5', lg: '3' }}
              pe={{ base: '2', lg: '0' }}
              maxW={{ md: 'results.detail', lg: 'full' }}
            >
              {note && (
                <Text textStyle='meta' color='fg.subtle' lineClamp={3}>
                  {note}
                </Text>
              )}
              <TurnoutBar
                caption={manageText.turnout(count, electorate)}
                share={percent || undefined}
                value={count}
                max={electorate}
                label={manageText.turnoutLabel(count, electorate, share)}
                layout='compact'
              />
              <QuestionResultBars question={question} results={results} weighted={weighted} final={settled} />
            </Stack>
          )}
        </Box>
      </Stack>
    </QuestionRowFrame>
  )
}

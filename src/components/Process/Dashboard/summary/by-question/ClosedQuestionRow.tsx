import { Box, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { ProcessStatus } from '~components/ui/ProcessStatus'
import { TurnoutBar } from '~components/ui/TurnoutBar'
import { useVoteText } from '~i18n/use-vote-text'
import { isSettledQuestion, percentOf } from '~utils/vote-state'
import { QuestionResultBars } from '../../QuestionResultBars'
import { Figures } from './Figures'
import { QuestionRowFrame, RowChevron, RowHead } from './QuestionRow'
import { useManageText } from './use-manage-text'

export type ClosedQuestionRowProps = {
  question: VotingProcessQuestion
  number: number
  electorate?: number
  weighted: boolean
  expanded: boolean
  onToggle: () => void
  desktop: boolean
}

/**
 * A closed question: one line that opens its result. From `lg` the title, "69% turnout", the state and a turning
 * chevron, and under it the question, its turnout and a bar per choice; below `lg` the title over "Closed. 69%
 * turnout." and, opened, the turnout and the bars. No verdict: the bars tell it (owner).
 */
export const ClosedQuestionRow = ({
  question,
  number,
  electorate,
  weighted,
  expanded,
  onToggle,
  desktop,
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
  const note = desktop ? manageText.note(question) : ''

  return (
    <QuestionRowFrame number={number}>
      <Stack gap='0' minW='0'>
        <RowHead
          alignItems={{ base: 'center', lg: 'baseline' }}
          toggle={{ expanded, onToggle, controls: detailId, number }}
        >
          {/* Spans: the line is the row's toggle button, which takes phrasing content only. */}
          {/* The touch board's two lines share the 44px chevron's height: 1px between them. */}
          <Stack as='span' gap={{ base: 'note', lg: '0' }} flex='1' minW='0'>
            <Text
              as='span'
              display='block'
              textStyle='question-line'
              whiteSpace={{ lg: 'nowrap' }}
              overflow={{ lg: 'hidden' }}
              textOverflow={{ lg: 'ellipsis' }}
            >
              {text(question.title)}
            </Text>
            <Text as='span' textStyle='note' color='fg.subtle' display={{ base: 'block', lg: 'none' }}>
              {share !== undefined
                ? t('votes.manage.meta.closed_turnout', {
                    defaultValue: 'Closed. {{percent}}% turnout.',
                    percent: share,
                  })
                : t('votes.manage.meta.closed', { defaultValue: 'Closed.' })}
            </Text>
          </Stack>
          {share !== undefined && (
            <Text
              as='span'
              textStyle='caption'
              letterSpacing='body'
              color='fg.subtle'
              whiteSpace='nowrap'
              display={{ base: 'none', lg: 'inline' }}
            >
              <Figures
                text={t('votes.manage.turnout_share', { defaultValue: '{{percent}}% turnout', percent: share })}
              />
            </Text>
          )}
          <ProcessStatus as='span' kind='question' state='closed' display={{ base: 'none', lg: 'inline-flex' }} />
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
                <Text textStyle='note' color='fg.subtle'>
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
              <QuestionResultBars
                question={question}
                results={results}
                weighted={weighted}
                final={settled}
                layout={desktop ? 'indented' : 'plain'}
              />
            </Stack>
          )}
        </Box>
      </Stack>
    </QuestionRowFrame>
  )
}

import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useId, type ReactNode } from 'react'
import { ProcessStatus } from '~components/ui/ProcessStatus'
import { useVoteText } from '~i18n/use-vote-text'
import { QuestionRowFrame, RowChevron, RowHead, RowTitleLine } from './QuestionRow'
import { useManageText } from './use-manage-text'

export type WaitingQuestionRowProps = {
  question: VotingProcessQuestion
  number: number
  state: 'toOpen' | 'notOpened' | 'canceled'
  expanded: boolean
  onToggle: () => void
  /** The "Open" button, when the question can be opened (or shown off before the start). */
  action?: ReactNode
}

/**
 * A question to open, one the vote ended without opening, or a voided one: its title and state (from `lg` on one line,
 * the title in grey; below it the state under the title), the line opening the question's text and how it is
 * answered. Open sits at the end.
 */
export const WaitingQuestionRow = ({
  question,
  number,
  state,
  expanded,
  onToggle,
  action,
}: WaitingQuestionRowProps) => {
  const { text } = useVoteText()
  const manageText = useManageText()
  const detailId = useId()
  const note = manageText.note(question)
  const hasDetail = !!note

  return (
    <QuestionRowFrame number={number}>
      <Stack gap='0' minW='0'>
        {/* From `lg` the line is a 28px toggle pulled into the row's padding, as tall as the Open beside it. */}
        <Flex align='center' gap='3' minW='0' my={{ lg: '-1' }}>
          <RowHead
            flex='1'
            minH={{ lg: '7' }}
            toggle={hasDetail ? { expanded, onToggle, controls: detailId, number } : undefined}
          >
            <RowTitleLine
              title={text(question.title)}
              color={{ base: 'fg', lg: 'fg.muted' }}
              align='center'
              heading={!hasDetail}
            >
              <ProcessStatus as='span' kind='question' state={state} />
            </RowTitleLine>
            {hasDetail && <RowChevron expanded={expanded} />}
          </RowHead>
          {action}
        </Flex>
        {hasDetail && (
          <Box id={detailId} hidden={!expanded}>
            {expanded && (
              <Text textStyle='meta' color='fg.subtle' pt='note' lineClamp={3}>
                {note}
              </Text>
            )}
          </Box>
        )}
      </Stack>
    </QuestionRowFrame>
  )
}

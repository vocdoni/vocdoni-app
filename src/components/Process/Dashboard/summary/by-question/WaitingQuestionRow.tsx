import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ProcessStatus } from '~components/ui/ProcessStatus'
import { useVoteText } from '~i18n/use-vote-text'
import { QuestionRowFrame, RowChevron, RowHead } from './QuestionRow'
import { useManageText } from './use-manage-text'

export type WaitingQuestionRowProps = {
  question: VotingProcessQuestion
  number: number
  state: 'toOpen' | 'notOpened' | 'canceled'
  expanded: boolean
  onToggle: () => void
  /** The "Open" button, when the question can be opened (or shown off before the start). */
  action?: ReactNode
  desktop: boolean
}

/**
 * A question to open, one the vote ended without opening, or a voided one. From `lg` its title in grey, the state
 * and a chevron, the whole line opening the question's text; below `lg` the title over "To open." Open sits at the end.
 */
export const WaitingQuestionRow = ({
  question,
  number,
  state,
  expanded,
  onToggle,
  action,
  desktop,
}: WaitingQuestionRowProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const manageText = useManageText()
  const detailId = useId()
  const title = text(question.title)
  const meta = {
    toOpen: t('votes.manage.meta.to_open', { defaultValue: 'To open.' }),
    notOpened: t('votes.manage.meta.not_opened', { defaultValue: 'Not opened. The vote ended without opening it.' }),
    canceled: t('votes.manage.meta.canceled', { defaultValue: 'Voided.' }),
  }[state]
  // Only the desktop board opens these rows, onto the question and how it is answered.
  const note = desktop ? manageText.note(question) : ''
  const hasDetail = !!note

  return (
    <QuestionRowFrame number={number}>
      <Stack gap='0' minW='0'>
        {/* From `lg` the line is a 28px toggle pulled into the row's padding, as tall as the Open beside it. */}
        <Flex align='center' gap='3' minW='0' my={{ lg: '-1' }}>
          <RowHead
            flex='1'
            minH={{ lg: '7' }}
            toggle={
              hasDetail
                ? {
                    expanded,
                    onToggle,
                    controls: detailId,
                    number,
                  }
                : undefined
            }
          >
            {/* Spans: the line can be the row's toggle button, which takes phrasing content only. */}
            <Stack as='span' gap='0' flex='1' minW='0'>
              <Text
                as='span'
                display='block'
                textStyle='question-line'
                color={{ base: 'fg', lg: 'fg.muted' }}
                whiteSpace={{ lg: 'nowrap' }}
                overflow={{ lg: 'hidden' }}
                textOverflow={{ lg: 'ellipsis' }}
              >
                {title}
              </Text>
              <Text as='span' textStyle='note' color='fg.subtle' display={{ base: 'block', lg: 'none' }}>
                {meta}
              </Text>
            </Stack>
            <ProcessStatus as='span' kind='question' state={state} display={{ base: 'none', lg: 'inline-flex' }} />
            {hasDetail && <RowChevron expanded={expanded} desktopOnly />}
          </RowHead>
          {action}
        </Flex>
        {hasDetail && (
          <Box id={detailId} hidden={!expanded}>
            {expanded && (
              <Text textStyle='note' color='fg.subtle' pt='note' lineClamp={3}>
                {note}
              </Text>
            )}
          </Box>
        )}
      </Stack>
    </QuestionRowFrame>
  )
}

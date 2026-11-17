import { Box, Flex, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessQuestion } from '@vocdoni/api-types'
import { useId, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useVoteText } from '~i18n/use-vote-text'
import { QuestionRowFrame, RowChevron, RowHead } from './QuestionRow'
import { ProcessStatus, useProcessStateLabel } from '~components/ui/ProcessStatus'

export type WaitingQuestionRowProps = {
  question: VotingProcessQuestion
  number: number
  state: 'toOpen' | 'notOpened' | 'canceled'
  expanded: boolean
  onToggle: () => void
  /** The "Open" button, when the question can be opened (or shown disabled before the start). */
  action?: ReactNode
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
}: WaitingQuestionRowProps) => {
  const { t } = useTranslation()
  const { text } = useVoteText()
  const label = useProcessStateLabel()
  const detailId = useId()
  const title = text(question.title)
  const description = question.description ? text(question.description) : ''
  const note = {
    toOpen: '',
    notOpened: t('votes.manage.not_opened_note', { defaultValue: 'The vote ended without opening it.' }),
    canceled: t('votes.manage.canceled_note', { defaultValue: 'The votes were discarded.' }),
  }[state]
  const meta = {
    toOpen: t('votes.manage.meta.to_open', { defaultValue: 'To open.' }),
    notOpened: t('votes.manage.meta.not_opened', { defaultValue: 'Not opened. The vote ended without opening it.' }),
    canceled: t('votes.manage.meta.canceled', { defaultValue: 'Voided. The votes were discarded.' }),
  }[state]
  const hasDetail = !!(description || note)

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
                    label: t('votes.manage.toggle_waiting', {
                      defaultValue: 'Question {{number}}, {{title}}. {{state}}. Show or hide the detail',
                      number,
                      title,
                      state: label(state, 'question'),
                    }),
                  }
                : undefined
            }
          >
            <Stack gap='0' flex='1' minW='0'>
              <Text
                textStyle='question-title'
                color='fg.muted'
                whiteSpace={{ lg: 'nowrap' }}
                overflow={{ lg: 'hidden' }}
                textOverflow={{ lg: 'ellipsis' }}
              >
                {title}
              </Text>
              <Text textStyle='note' color='fg.subtle' display={{ lg: 'none' }}>
                {meta}
              </Text>
            </Stack>
            <ProcessStatus kind='question' state={state} display={{ base: 'none', lg: 'inline-flex' }} />
            {hasDetail && <RowChevron expanded={expanded} desktopOnly />}
          </RowHead>
          {action}
        </Flex>
        {hasDetail && (
          <Box id={detailId} hidden={!expanded}>
            {expanded && (
              <Stack gap='3' pt='0.5'>
                {description && (
                  <Text textStyle='note' color='fg.subtle'>
                    {description}
                  </Text>
                )}
                {note && (
                  <Text textStyle='note' color='fg.subtle'>
                    {note}
                  </Text>
                )}
              </Stack>
            )}
          </Box>
        )}
      </Stack>
    </QuestionRowFrame>
  )
}

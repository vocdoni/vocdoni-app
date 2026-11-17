import { Box, Status, type StatusRootProps } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import type { RowState } from './row-state'

// The board's question looks: voided and not opened are hollow and grey, not red (ProcessStatus paints a canceled
// vote red), and a question held by a paused vote reads "Paused".
const TONES = {
  toOpen: 'hollow',
  open: 'success',
  paused: 'warning',
  held: 'warning',
  closed: 'gray',
  canceled: 'hollow',
  notOpened: 'hollow',
} as const

/** The translated word of a row state; the same keys as ProcessStatus for the states they share. */
export const useRowStateLabel = () => {
  const { t } = useTranslation()
  return (state: RowState): string => {
    switch (state) {
      case 'toOpen':
        return t('votes.question_state.to_open', { defaultValue: 'To open' })
      case 'open':
        return t('votes.question_state.open', { defaultValue: 'Open' })
      case 'paused':
      case 'held':
        return t('votes.question_state.paused', { defaultValue: 'Paused' })
      case 'canceled':
        return t('votes.question_state.canceled', { defaultValue: 'Voided' })
      case 'notOpened':
        return t('votes.question_state.not_opened', { defaultValue: 'Not opened' })
      default:
        return t('votes.question_state.closed', { defaultValue: 'Closed' })
    }
  }
}

export type QuestionStatusProps = Omit<StatusRootProps, 'tone' | 'size' | 'children'> & { state: RowState }

/** A question's state as a dot and a word (12px from `lg`, 13px below). */
export const QuestionStatus = ({ state, ...props }: QuestionStatusProps) => {
  const label = useRowStateLabel()
  return (
    <Status.Root size='sm' tone={TONES[state]} {...props}>
      <Status.Indicator />
      <Box as='span' truncate>
        {label(state)}
      </Box>
    </Status.Root>
  )
}

import { Box, Status, type StatusRootProps } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

/** A vote's state (`kind='vote'`) or a question's (`kind='question'`); the literals match `~utils/vote-state`. */
export type ProcessStatusState = 'draft' | 'ready' | 'live' | 'paused' | 'closed' | 'canceled' | 'toOpen' | 'open'

const TONES = {
  draft: 'hollow',
  ready: 'ink',
  live: 'success',
  paused: 'warning',
  closed: 'gray',
  canceled: 'danger',
  toOpen: 'hollow',
  open: 'success',
} as const

/** The translated word for a state. Static keys, so `pnpm translations` extracts each one. */
export const useProcessStateLabel = () => {
  const { t } = useTranslation()
  return (state: ProcessStatusState, kind: 'vote' | 'question' = 'vote'): string => {
    if (kind === 'question') {
      switch (state) {
        case 'toOpen':
          return t('votes.question_state.to_open', { defaultValue: 'To open' })
        case 'open':
        case 'live':
          return t('votes.question_state.open', { defaultValue: 'Open' })
        case 'paused':
          return t('votes.question_state.paused', { defaultValue: 'Paused' })
        case 'canceled':
          return t('votes.question_state.canceled', { defaultValue: 'Voided' })
        default:
          return t('votes.question_state.closed', { defaultValue: 'Closed' })
      }
    }
    switch (state) {
      case 'draft':
        return t('votes.state.draft', { defaultValue: 'Draft' })
      case 'ready':
      case 'toOpen':
        return t('votes.state.ready', { defaultValue: 'Ready' })
      case 'live':
      case 'open':
        return t('votes.state.live', { defaultValue: 'Live' })
      case 'paused':
        return t('votes.state.paused', { defaultValue: 'Paused' })
      case 'canceled':
        return t('votes.state.canceled', { defaultValue: 'Canceled' })
      default:
        return t('votes.state.closed', { defaultValue: 'Closed' })
    }
  }
}

export type ProcessStatusProps = Omit<StatusRootProps, 'tone' | 'size' | 'children'> & {
  state: ProcessStatusState
  kind?: 'vote' | 'question'
}

/** A dot and a word. Only live and open are green (the guide's "only one green"). */
export const ProcessStatus = ({ state, kind = 'vote', ...props }: ProcessStatusProps) => {
  const label = useProcessStateLabel()
  return (
    <Status.Root size='sm' tone={TONES[state]} {...props}>
      <Status.Indicator />
      <Box as='span' truncate>
        {label(state, kind)}
      </Box>
    </Status.Root>
  )
}

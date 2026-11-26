import { Box, Status, type StatusRootProps } from '@chakra-ui/react'
import { useCallback, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

/** A vote's state (`kind='vote'`) or a question's (`kind='question'`); the literals match `~utils/vote-state`. */
export type ProcessStatusState =
  | 'draft'
  | 'ready'
  | 'live'
  | 'paused'
  | 'closed'
  | 'canceled'
  | 'toOpen'
  | 'open'
  | 'notOpened'

type Kind = 'vote' | 'question'

const TONES = {
  draft: 'hollow',
  ready: 'ink',
  live: 'success',
  paused: 'warning',
  closed: 'gray',
  canceled: 'danger',
  toOpen: 'hollow',
  open: 'success',
  notOpened: 'hollow',
} as const

// A voided question is grey and hollow, unlike a canceled vote, which is red (the boards' question looks).
const toneOf = (state: ProcessStatusState, kind: Kind) =>
  kind === 'question' && state === 'canceled' ? 'hollow' : TONES[state]

/** The translated word for a state, for a sentence or a sheet's subtitle. Static keys, so `pnpm translations` finds them. */
export const useProcessStateLabel = () => {
  const { t } = useTranslation()
  return useCallback(
    (state: ProcessStatusState, kind: Kind = 'vote'): string => {
      if (kind === 'question') {
        switch (state) {
          case 'notOpened':
            return t('votes.question_state.not_opened', { defaultValue: 'Not opened' })
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
    },
    [t]
  )
}

export type ProcessStatusProps = Omit<StatusRootProps, 'tone' | 'size' | 'children'> & {
  state: ProcessStatusState
  kind?: Kind
  /** A quiet note after the word, such as the day a vote closed: on the same line on a phone, under it from `md`. */
  detail?: ReactNode
}

/** A dot and a word. Only live and open are green (the guide's "only one green"). */
export const ProcessStatus = ({ state, kind = 'vote', detail, ...props }: ProcessStatusProps) => {
  const label = useProcessStateLabel()
  return (
    <Status.Root
      size='sm'
      tone={toneOf(state, kind)}
      flexWrap={detail ? 'wrap' : undefined}
      rowGap={detail ? '0' : undefined}
      {...props}
    >
      <Status.Indicator />
      <Box as='span' truncate>
        {label(state, kind)}
      </Box>
      {detail && (
        // Under the word from md, lined up with it past the dot.
        <Box
          as='span'
          fontWeight='normal'
          color='fg.subtle'
          flexBasis={{ base: 'auto', md: 'full' }}
          ps={{ base: '0', md: '3.5' }}
        >
          {detail}
        </Box>
      )}
    </Status.Root>
  )
}

import { Button } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import type { QuestionStatusChange } from '~queries/question-status'

/** What the question buttons share: one status change at a time, and the clicked button shows progress. */
export type QuestionControls = {
  busy: boolean
  isLoading: (questionId: string, status: QuestionStatusChange) => boolean
  run: (questionId: string, status: 'ready' | 'paused') => void
  askClose: (questionId: string) => void
}

type OpenButtonProps = {
  questionId: string
  controls: QuestionControls
  /** The next step: the primary button. */
  primary: boolean
  /** Before the start: shown disabled on a phone and a tablet, left out from `lg` (boards). */
  beforeStart?: boolean
}

/** The board's 28px "Open" (`.btn.s28`), 40px below `lg`. */
export const OpenButton = ({ questionId, controls, primary, beforeStart = false }: OpenButtonProps) => {
  const { t } = useTranslation()
  const variant = primary && !beforeStart ? 'solid' : 'outline'
  return (
    <Button
      variant={variant}
      data-variant={variant}
      size='row'
      flexShrink={0}
      display={beforeStart ? { lg: 'none' } : undefined}
      loading={controls.isLoading(questionId, 'ready')}
      disabled={controls.busy || beforeStart}
      onClick={() => controls.run(questionId, 'ready')}
    >
      {t('votes.manage.open', { defaultValue: 'Open' })}
    </Button>
  )
}

type ActiveButtonsProps = {
  questionId: string
  controls: QuestionControls
  paused: boolean
  /** A paused question whose Resume is the next step. */
  resumePrimary: boolean
}

/** Open: Pause (secondary) and Close (primary). Paused: Resume (primary when it is the next step) and Close. */
export const ActiveButtons = ({ questionId, controls, paused, resumePrimary }: ActiveButtonsProps) => {
  const { t } = useTranslation()
  const grow = { base: '1', md: 'none' } as const
  const status = paused ? 'ready' : 'paused'
  const first = paused && resumePrimary ? 'solid' : 'outline'
  const close = paused ? 'outline' : 'solid'
  // `data-variant` says which one is the primary (tests and the e2e suite).
  return (
    <>
      <Button
        variant={first}
        data-variant={first}
        flex={grow}
        loading={controls.isLoading(questionId, status)}
        disabled={controls.busy}
        onClick={() => controls.run(questionId, status)}
      >
        {paused
          ? t('votes.manage.resume', { defaultValue: 'Resume' })
          : t('votes.manage.pause', { defaultValue: 'Pause' })}
      </Button>
      <Button
        variant={close}
        data-variant={close}
        flex={grow}
        loading={controls.isLoading(questionId, 'ended')}
        disabled={controls.busy}
        onClick={() => controls.askClose(questionId)}
      >
        {t('votes.manage.close', { defaultValue: 'Close' })}
      </Button>
    </>
  )
}

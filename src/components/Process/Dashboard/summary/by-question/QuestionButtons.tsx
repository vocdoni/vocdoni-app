import { Button } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import type { QuestionStatusChange } from '~queries/question-status'

/** What the question buttons share: one status change at a time, and the clicked button shows progress. */
export type QuestionControls = {
  busy: boolean
  isLoading: (questionId: string, status: QuestionStatusChange) => boolean
  run: (questionId: string, status: 'ready' | 'paused') => void
  askClose: (questionId: string) => void
  /** A button's accessible name: its visible label, then the question it acts on (several rows show "Open"). */
  name: (questionId: string, action: string) => string
}

type OpenButtonProps = {
  questionId: string
  controls: QuestionControls
  /** The next step: the primary button. */
  primary: boolean
  /** Before the start or while the vote is paused: off on a phone and a tablet, left out from `lg` (boards). */
  touchOnly?: boolean
  /**
   * Another question is open or paused (R29), or the vote has not started: the boards' `off` button, which does
   * nothing. `aria-disabled` keeps it focusable, and `reasonId` names the note that says why.
   */
  off?: boolean
  reasonId?: string
  /** `md` in the phone's bottom bar, where it is a full touch button. */
  size?: 'row' | 'md'
}

/** The board's 28px "Open" (`.btn.s28`), 40px below `lg`. */
export const OpenButton = ({
  questionId,
  controls,
  primary,
  touchOnly = false,
  off = false,
  reasonId,
  size = 'row',
}: OpenButtonProps) => {
  const { t } = useTranslation()
  const unavailable = off || touchOnly
  const variant = unavailable ? 'off' : primary ? 'solid' : 'outline'
  const label = t('votes.manage.open', { defaultValue: 'Open' })
  return (
    <Button
      aria-label={controls.name(questionId, label)}
      variant={variant}
      data-variant={variant}
      size={size}
      flex={size === 'md' ? '1' : undefined}
      flexShrink={0}
      display={touchOnly ? { lg: 'none' } : undefined}
      loading={controls.isLoading(questionId, 'ready')}
      disabled={!unavailable && controls.busy}
      aria-disabled={unavailable || undefined}
      aria-describedby={unavailable ? reasonId : undefined}
      onClick={unavailable ? undefined : () => controls.run(questionId, 'ready')}
    >
      {label}
    </Button>
  )
}

type ActiveButtonsProps = {
  questionId: string
  controls: QuestionControls
  paused: boolean
  /** A paused question whose Resume is the next step. */
  resumePrimary: boolean
  /** Another question is open (R29): Resume is the `off` button, described by `reasonId`. */
  resumeOff?: boolean
  reasonId?: string
}

/** Open: Pause (secondary) and Close (primary). Paused: Resume (primary when it is the next step) and Close. */
export const ActiveButtons = ({
  questionId,
  controls,
  paused,
  resumePrimary,
  resumeOff = false,
  reasonId,
}: ActiveButtonsProps) => {
  const { t } = useTranslation()
  const grow = { base: '1', md: 'none' } as const
  const status = paused ? 'ready' : 'paused'
  const firstOff = paused && resumeOff
  const first = firstOff ? 'off' : paused && resumePrimary ? 'solid' : 'outline'
  const close = paused ? 'outline' : 'solid'
  const firstLabel = paused
    ? t('votes.manage.resume', { defaultValue: 'Resume' })
    : t('votes.manage.pause', { defaultValue: 'Pause' })
  const closeLabel = t('votes.manage.close', { defaultValue: 'Close' })
  // `data-variant` says which one is the primary (tests and the e2e suite).
  return (
    <>
      <Button
        aria-label={controls.name(questionId, firstLabel)}
        variant={first}
        data-variant={first}
        flex={grow}
        loading={controls.isLoading(questionId, status)}
        disabled={!firstOff && controls.busy}
        aria-disabled={firstOff || undefined}
        aria-describedby={firstOff ? reasonId : undefined}
        onClick={firstOff ? undefined : () => controls.run(questionId, status)}
      >
        {firstLabel}
      </Button>
      <Button
        aria-label={controls.name(questionId, closeLabel)}
        variant={close}
        data-variant={close}
        flex={grow}
        loading={controls.isLoading(questionId, 'ended')}
        disabled={controls.busy}
        onClick={() => controls.askClose(questionId)}
      >
        {closeLabel}
      </Button>
    </>
  )
}

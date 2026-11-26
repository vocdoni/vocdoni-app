import { useElection } from '@vocdoni/react-components'
import type { SetElectionStatusRequest } from '@vocdoni/api-types'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '~components/Auth/useAuth'
import { useIsStatusJobRunning, useStatusJob, type StatusJobOutcome } from '~queries/status-job'
import { useRemembered, useVotePause, type VotePause } from '~queries/vote-pause'
import { useCanManageVotes } from '~queries/votes'
import { sameAddress } from '~utils/address'
import { useNow } from '~utils/use-now'
import { deriveVoteState, nonTerminalQuestionIds, type VoteState } from '~utils/vote-state'

export type ActionKey = 'continue' | 'pause' | 'end' | 'cancel'

export type ActionsContextValue = {
  resume: () => Promise<void>
  pause: () => Promise<void>
  end: () => Promise<StatusJobOutcome>
  cancel: () => Promise<StatusJobOutcome>
  loading: Record<ActionKey, boolean>
  /** The questions a header action changes: every non-terminal one. Empty means no action is left to take. */
  targets: string[]
  /** Whether the user may change this vote: a manager or admin of its organisation. */
  canManage: boolean
  /** Any status change of this vote is running (header, whole-vote pause or a single question). */
  disabled: boolean
  /** Whole-vote pause of a question-by-question vote ("Pause the vote" / "Resume the vote"). */
  votePause: VotePause
  /** The vote's state for every part of the page (header, tabs, Gestió, Papereta), whole-vote pause included. */
  state: VoteState | undefined
  /** The page's one clock, so the header, the tabs and their content change together at a start or an end. */
  now: Date
  /** The header action running, which the "waiting for the transaction" toast names. */
  info: ActionKey | null
}

const ActionsContext = createContext<ActionsContextValue | null>(null)

// Each header action maps to a status transition; use-actions-toast names the running one.
const ACTION_STATUS: Record<ActionKey, SetElectionStatusRequest['status']> = {
  continue: 'ready',
  pause: 'paused',
  end: 'ended',
  cancel: 'canceled',
}

/**
 * Lifecycle actions of the vote page (pause, resume, end, cancel, and the whole-vote pause of a question-by-question
 * vote), run through the shared status-job runner. Also the one place the page derives its state and its clock, so
 * every screen under it reads them from here instead of calling the hooks again.
 */
export const ActionsProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation()
  const { election } = useElection()
  const [info, setInfo] = useState<ActionKey | null>(null)
  const { currentAddress } = useAuth()
  const canManageVotes = useCanManageVotes()
  const canManage = canManageVotes && !!election && sameAddress(election.orgAddress, currentAddress)
  const now = useNow()
  const remembered = useRemembered(election?.id)
  const rawVotePause = useVotePause(election, now)
  const { run, pending } = useStatusJob(election?.id)
  const running = useIsStatusJobRunning(election?.id)
  const targets = useMemo(() => nonTerminalQuestionIds(election), [election])
  const state = election ? deriveVoteState(election, now, remembered) : undefined

  const value = useMemo<ActionsContextValue>(() => {
    const errorTitles: Record<ActionKey, string> = {
      continue: t('votes.pause.error.resume', { defaultValue: 'The vote could not be resumed' }),
      pause: t('votes.pause.error.pause', { defaultValue: 'The vote could not be paused' }),
      end: t('votes.end.error', { defaultValue: 'The vote could not be ended' }),
      cancel: t('votes.cancel.error', { defaultValue: 'The vote could not be canceled' }),
    }
    const act = async (key: ActionKey): Promise<StatusJobOutcome> => {
      // Never an empty list (it targets every question) and never a terminal question (the backend rejects the
      // whole batch when one is ENDED, RESULTS or CANCELED and the request asks otherwise).
      if (!election?.id || !targets.length || running) return { ok: false }
      setInfo(key)
      try {
        return await run({ questionIds: targets, status: ACTION_STATUS[key], tag: key, errorTitle: errorTitles[key] })
      } finally {
        setInfo(null)
      }
    }
    // The whole-vote pause of a question-by-question vote names itself in the same toast.
    const told = (key: ActionKey, change: () => Promise<void>) => async () => {
      setInfo(key)
      try {
        await change()
      } finally {
        setInfo(null)
      }
    }
    const votePause: VotePause = {
      ...rawVotePause,
      pause: told('pause', rawVotePause.pause),
      resume: told('continue', rawVotePause.resume),
    }
    const isRunning = (key: ActionKey) => pending?.tag === key

    return {
      resume: async () => {
        await act('continue')
      },
      pause: async () => {
        await act('pause')
      },
      end: () => act('end'),
      cancel: () => act('cancel'),
      loading: {
        continue: isRunning('continue'),
        pause: isRunning('pause'),
        end: isRunning('end'),
        cancel: isRunning('cancel'),
      },
      targets,
      canManage,
      disabled: running,
      votePause,
      state,
      now,
      info,
    }
  }, [t, election, targets, running, run, pending, canManage, rawVotePause, state, now, info])

  return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
}

export const useActions = (): ActionsContextValue => {
  const ctx = useContext(ActionsContext)
  if (!ctx) throw new Error('useActions must be used within an ActionsProvider')
  return ctx
}

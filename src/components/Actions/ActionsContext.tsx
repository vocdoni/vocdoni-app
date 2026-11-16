import { useIsMutating, useQueryClient } from '@tanstack/react-query'
import { useElection } from '@vocdoni/react-components'
import type { SetElectionStatusRequest } from '@vocdoni/api-types'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '~components/Auth/useAuth'
import { QueryKeys } from '~queries/keys'
import { useCanManageVotes } from '~queries/votes'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { sameAddress } from '~utils/address'
import { nonTerminalQuestionIds } from '~utils/vote-state'

type ActionKey = 'continue' | 'pause' | 'end' | 'cancel'
type ActionMessage = { title?: string; description?: string } | null

export type ActionsContextValue = {
  resume: () => Promise<void>
  pause: () => Promise<void>
  end: () => Promise<void>
  cancel: () => Promise<void>
  loading: Record<ActionKey, boolean>
  /** The questions a header action changes: every non-terminal one. Empty means no action is left to take. */
  targets: string[]
  /** Whether the user may change this vote: a manager or admin of its organisation (audit F17). */
  canManage: boolean
  disabled: boolean
  info: ActionMessage
  error: ActionMessage
}

const NO_LOADING: Record<ActionKey, boolean> = { continue: false, pause: false, end: false, cancel: false }

const ActionsContext = createContext<ActionsContextValue | null>(null)

// Each menu action maps to the SAAS status transition and the i18n description shown in the
// "waiting for the transaction" toast (translated by use-actions-toast, which interpolates the
// election so `{{ election.title.default }}` resolves).
const ACTION_CONFIG: Record<ActionKey, { status: SetElectionStatusRequest['status']; description: string }> = {
  continue: { status: 'ready', description: 'actions.continue_description' },
  pause: { status: 'paused', description: 'actions.pause_description' },
  end: { status: 'ended', description: 'actions.end_description' },
  cancel: { status: 'canceled', description: 'actions.cancel_description' },
}

/**
 * Election lifecycle actions (pause/resume/end/cancel) backed by the SAAS API. Replaces the legacy
 * react-components `ActionsProvider`, which drove the changes through the Vochain client. Exposes
 * the same shape (`resume`/`pause`/`end`/`cancel`, per-action `loading`, `disabled`, `info`/`error`)
 * so the existing action buttons/menu and the toast bridge consume it unchanged.
 *
 * On success it refreshes the election in place by writing the freshly fetched process onto the
 * election query the ElectionProvider observes (and invalidating its results query), so the UI
 * reflects the new per-question statuses without waiting for a background refetch.
 */
export const ActionsProvider = ({ children }: { children: ReactNode }) => {
  const { client } = useApiClient()
  const { election } = useElection()
  const queryClient = useQueryClient()
  const [loading, setLoading] = useState<Record<ActionKey, boolean>>(NO_LOADING)
  const [info, setInfo] = useState<ActionMessage>(null)
  const [error, setError] = useState<ActionMessage>(null)
  const { currentAddress } = useAuth()
  const canManageVotes = useCanManageVotes()
  const canManage = canManageVotes && !!election && sameAddress(election.orgAddress, currentAddress)
  // A per-question change (Gestió) holds the organisation's transaction lock too: wait for it.
  const questionChanges = useIsMutating({ mutationKey: QueryKeys.process.questionStatus(election?.id) })
  const targets = useMemo(() => nonTerminalQuestionIds(election), [election])

  const value = useMemo<ActionsContextValue>(() => {
    const run = async (key: ActionKey) => {
      if (!election?.id || !targets.length) return
      const { id } = election
      const { status, description } = ACTION_CONFIG[key]

      setLoading((prev) => ({ ...prev, [key]: true }))
      setError(null)
      setInfo({ title: 'actions.waiting_title', description })

      try {
        // Status changes go through the questions endpoint: each question is its own on-chain election. Never
        // send an empty list (it targets every question) and never a terminal question: the backend rejects the
        // whole batch when one targeted question is ENDED, RESULTS or CANCELED and the request asks otherwise.
        const { jobId } = await client.elections.bulkSetQuestionStatus(id, {
          status,
          questions: targets.map((questionId) => ({ id: questionId })),
        })
        await client.jobs.waitFor(jobId)
        const refreshed = await client.elections.get(id)
        queryClient.setQueryData(QueryKeys.election.process(id), refreshed)
        queryClient.invalidateQueries({ queryKey: QueryKeys.election.results(id) })
        void queryClient.invalidateQueries({ queryKey: QueryKeys.organization.votesAll })
        setInfo(null)
      } catch (e) {
        setInfo(null)
        setError({ title: 'actions.error_title', description: e instanceof Error ? e.message : String(e) })
      } finally {
        setLoading((prev) => ({ ...prev, [key]: false }))
      }
    }

    return {
      resume: () => run('continue'),
      pause: () => run('pause'),
      end: () => run('end'),
      cancel: () => run('cancel'),
      loading,
      targets,
      canManage,
      disabled: loading.continue || loading.pause || loading.end || loading.cancel || questionChanges > 0,
      info,
      error,
    }
  }, [client, election, queryClient, loading, info, error, targets, canManage, questionChanges])

  return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
}

export const useActions = (): ActionsContextValue => {
  const ctx = useContext(ActionsContext)
  if (!ctx) throw new Error('useActions must be used within an ActionsProvider')
  return ctx
}

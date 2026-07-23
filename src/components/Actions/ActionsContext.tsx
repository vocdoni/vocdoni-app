import { useQueryClient } from '@tanstack/react-query'
import { useElection } from '@vocdoni/react-components'
import type { SetElectionStatusRequest } from '@vocdoni/api-types'
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { QueryKeys } from '~queries/keys'
import { useApiClient } from '~src/providers/ApiClientProvider'

type ActionKey = 'continue' | 'pause' | 'end' | 'cancel'
type ActionMessage = { title?: string; description?: string } | null

export type ActionsContextValue = {
  resume: () => Promise<void>
  pause: () => Promise<void>
  end: () => Promise<void>
  cancel: () => Promise<void>
  loading: Record<ActionKey, boolean>
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

  const value = useMemo<ActionsContextValue>(() => {
    const run = async (key: ActionKey) => {
      if (!election?.id) return
      const { id } = election
      const { status, description } = ACTION_CONFIG[key]

      setLoading((prev) => ({ ...prev, [key]: true }))
      setError(null)
      setInfo({ title: 'actions.waiting_title', description })

      try {
        // Status changes go through the questions endpoint: each question is its own
        // on-chain election. An empty question list targets every published question.
        const { jobId } = await client.elections.bulkSetQuestionStatus(id, { status })
        await client.jobs.waitFor(jobId)
        const refreshed = await client.elections.get(id)
        queryClient.setQueryData(QueryKeys.election.process(id), refreshed)
        queryClient.invalidateQueries({ queryKey: QueryKeys.election.results(id) })
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
      disabled: loading.continue || loading.pause || loading.end || loading.cancel,
      info,
      error,
    }
  }, [client, election, queryClient, loading, info, error])

  return <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
}

export const useActions = (): ActionsContextValue => {
  const ctx = useContext(ActionsContext)
  if (!ctx) throw new Error('useActions must be used within an ActionsProvider')
  return ctx
}

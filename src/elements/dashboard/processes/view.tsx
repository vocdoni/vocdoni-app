import { ElectionProvider, useOrganization } from '@vocdoni/react-components'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useEffect } from 'react'
import { generatePath, useLoaderData, useNavigate } from 'react-router'
import { ProcessView } from '~components/Process/Dashboard/ProcessView'
import { Routes } from '~src/router/routes'
import { isQuestionByQuestion } from '~src/types/voting-process'
import { sameAddress } from '~utils/address'
import { activeQuestionIds } from '~utils/vote-state'

/** The process poll: 10 s while a question-by-question vote has an active question, so the organiser's turnout and
 * question states keep up with the room; 30 s otherwise. */
export const calcRefetchInterval = (data: VotingProcessResponse | undefined, now: Date = new Date()): number => {
  if (!data) return 30_000
  const qbq = isQuestionByQuestion(data)
  if (qbq && activeQuestionIds(data, now).length > 0) return 10_000
  return 30_000
}

/** `calcRefetchInterval` as TanStack Query's `refetchInterval`, which receives the query, not its data. */
export const makeRefetchInterval = (query: { state: { data: VotingProcessResponse | undefined } }): number =>
  calcRefetchInterval(query.state.data)

const DashboardProcessViewElement = () => {
  const { organization } = useOrganization()
  const election = useLoaderData() as VotingProcessResponse
  const navigate = useNavigate()

  // Redirect to processes list when current organization does not own this process
  useEffect(() => {
    if (!organization || !election) return
    if (!sameAddress(organization.address, election.orgAddress)) {
      navigate(generatePath(Routes.dashboard.processes.all, { page: '1' }), { replace: true })
    }
  }, [organization, election, navigate])

  // The route loader pre-seeds the ['election', id] query, so the provider renders
  // straight from cache instead of re-fetching the process.
  //
  // Poll the process more often (10 s) while a question-by-question vote has an active
  // question, so the organiser sees turnout and state changes quickly during live voting.
  // Both reads get refetchOnWindowFocus: 'always' so the tab is current after a switch.
  return (
    <ElectionProvider
      id={election.id}
      queryOptions={{ refetchInterval: makeRefetchInterval, refetchOnWindowFocus: 'always' }}
      resultsQueryOptions={{ refetchInterval: 30_000, refetchOnWindowFocus: 'always' }}
    >
      <ProcessView />
    </ElectionProvider>
  )
}

export default DashboardProcessViewElement

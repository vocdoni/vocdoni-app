import type { VotingProcessResponse } from '@vocdoni/api-types'
import { ComponentsProvider, ConfirmProvider, ElectionProvider, QuestionsFormProvider } from '@vocdoni/react-components'
import { CrispNicknameObserver } from '~components/Process/CrispNickname'
import { CspAuthProvider } from '~components/Process/voter/csp/CspStepsProvider'
import { PrefetchedStaleTime } from '~constants'
import { useFollowSystemColorMode } from '~theme/color-mode'
import type { ProcessBrand } from '~utils/process-brand'
import { useVoterLive } from './use-voter-live'
import { VOTER_COMPONENTS } from './voter-components'
import { VoterFlowProvider } from './VoterFlowProvider'
import { VoterView } from './VoterView'

type VoterPageProps = {
  id: string
  /** The server's process read: rendered at once, then followed live (spec D5). */
  election?: VotingProcessResponse
  /** When the server fetched `election` (ms epoch), so HTML served from the SSR cache is refetched once stale. */
  fetchedAt?: number
  brand: ProcessBrand
  publicLanguageLinks?: Record<string, string>
}

/**
 * `/processes/:id` and the HOME_PROCESS_ID root for a SaaS vote (spec D4). The voter's own slot set and confirm
 * boundary wrap the SDK's question form, so the dashboard keeps the app-wide ones.
 */
export const VoterPage = ({ id, election, fetchedAt, brand, publicLanguageLinks }: VoterPageProps) => {
  // The voter has no appearance control and always follows the system (ruling R12): the page no longer renders
  // through PublicLayout, which does this for the other public pages.
  useFollowSystemColorMode()
  const live = useVoterLive(id, election)
  const census = election?.census
  return (
    <ElectionProvider
      id={id}
      election={election}
      queryOptions={{ ...live.queryOptions, staleTime: PrefetchedStaleTime, initialDataUpdatedAt: fetchedAt }}
      resultsQueryOptions={live.resultsQueryOptions}
    >
      {/* Names the voter in the support chat once the identify screen's details are accepted. */}
      <CrispNicknameObserver />
      <ComponentsProvider components={VOTER_COMPONENTS}>
        <ConfirmProvider>
          <QuestionsFormProvider>
            <CspAuthProvider
              censusData={
                census ? { authFields: census.authFields ?? [], twoFaFields: census.twoFaFields ?? [] } : null
              }
              processId={id}
            >
              <VoterFlowProvider brand={brand} endPassed={live.endPassed}>
                <VoterView publicLanguageLinks={publicLanguageLinks} />
              </VoterFlowProvider>
            </CspAuthProvider>
          </QuestionsFormProvider>
        </ConfirmProvider>
      </ComponentsProvider>
    </ElectionProvider>
  )
}

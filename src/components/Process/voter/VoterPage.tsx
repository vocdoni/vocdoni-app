import type { VotingProcessResponse } from '@vocdoni/api-types'
import { ComponentsProvider, ConfirmProvider, ElectionProvider, QuestionsFormProvider } from '@vocdoni/react-components'
import { CspAuthProvider } from '~components/Process/CSP/CSPStepsProvider'
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
  brand: ProcessBrand
  publicLanguageLinks?: Record<string, string>
}

/**
 * `/processes/:id` and the HOME_PROCESS_ID root for a SaaS vote (spec D4). The voter's own slot set and confirm
 * boundary wrap the SDK's question form, so the dashboard keeps the app-wide ones.
 */
export const VoterPage = ({ id, election, brand, publicLanguageLinks }: VoterPageProps) => {
  // The voter has no appearance control and always follows the system (ruling R12): the page no longer renders
  // through PublicLayout, which does this for the other public pages.
  useFollowSystemColorMode()
  const live = useVoterLive(id, election)
  const census = election?.census
  return (
    <ElectionProvider
      id={id}
      election={election}
      queryOptions={live.queryOptions}
      resultsQueryOptions={live.resultsQueryOptions}
    >
      <ComponentsProvider components={VOTER_COMPONENTS}>
        <ConfirmProvider>
          <QuestionsFormProvider>
            <CspAuthProvider
              censusData={
                census ? { authFields: census.authFields ?? [], twoFaFields: census.twoFaFields ?? [] } : null
              }
              processId={id}
            >
              <VoterFlowProvider brand={brand} endPassed={live.endPassed} onResultsLive={live.setResultsLive}>
                <VoterView publicLanguageLinks={publicLanguageLinks} />
              </VoterFlowProvider>
            </CspAuthProvider>
          </QuestionsFormProvider>
        </ConfirmProvider>
      </ComponentsProvider>
    </ElectionProvider>
  )
}

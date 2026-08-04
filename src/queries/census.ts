import { useMutation } from '@tanstack/react-query'
import { useElection } from '@vocdoni/react-components'
import { useApiClient } from '~src/providers/ApiClientProvider'

// The process read carries the census member count directly (`census.size`, response-only;
// for a published process it equals the on-chain maxCensusSize). The backend serializes it
// with omitempty, so an absent field means an empty census.
export const useCensusSize = () => {
  const { election } = useElection()
  return { size: election?.census?.size ?? 0 }
}

/**
 * Appends existing organization members to a published process's census via
 * `PUT /processes/{id}/census` (append-only: members already present are skipped by the
 * backend). The response's `jobId`, when present, tracks the async on-chain maxCensusSize
 * bump — the members are already in the census when it resolves.
 */
export const useAddCensusParticipants = () => {
  const { client } = useApiClient()

  return useMutation({
    mutationFn: ({ processId, memberIds }: { processId: string; memberIds: string[] }) =>
      client.elections.addCensusMembers(processId, memberIds),
  })
}

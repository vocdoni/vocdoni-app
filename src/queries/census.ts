import { useMutation, useQuery } from '@tanstack/react-query'
import { useElection } from '@vocdoni/react-components'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { QueryKeys } from '~queries/keys'

export type CensusBundleData = {
  id: string
  census: {
    id: string
    orgAddress: string
    type: string
    size: number
    groupId: string
    published: {
      uri: string
      root: string
      createdAt: string
    }
    authFields: string[]
    twoFaFields: string[]
    createdAt: string
    updatedAt: string
  }
  orgAddress: string
  processes: string[] | null
}

export const useCensusBundle = (censusURI?: string) => {
  return useQuery({
    queryKey: QueryKeys.census.bundle(censusURI),
    queryFn: async (): Promise<CensusBundleData> => {
      if (!censusURI) {
        throw new Error('Census URI is required')
      }

      const response = await fetch(censusURI)
      if (!response.ok) {
        throw new Error(`Failed to fetch census bundle: ${response.statusText}`)
      }

      const data = await response.json()
      return data as CensusBundleData
    },
    enabled: !!censusURI,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

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

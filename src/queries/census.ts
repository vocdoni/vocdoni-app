import { useMutation, useQuery } from '@tanstack/react-query'
import type { VocdoniApiClient } from '@vocdoni/api-client'
import { useElection } from '@vocdoni/react-components'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
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

// For CSP (bundle-based) elections `census.size` represents the maximum number of voters allowed to vote.
// The real size lives in the bundle JSON pointed at by `census.uri`.
// For any other census type the size is already populated on `election.census.size`, so we fall back to it.
export const useCensusSize = () => {
  const { election } = useElection()

  const isCsp = !!election && election.census?.type === 'csp'
  const bundleURI = isCsp ? election.census?.uri : undefined

  const { data: bundle, isLoading } = useCensusBundle(bundleURI)

  const fallback = election ? (election.census?.size ?? 0) : 0
  const size = bundle?.census?.size ?? fallback

  return { size, isLoading: !!bundleURI && isLoading }
}

export type ProcessBundleResponse = {
  census?: {
    id: string
  }
}

export type AddCensusParticipantsResponse = {
  added: number
  jobId?: string
  errors?: string[]
}

// The election's census URL points to its process bundle, e.g. `.../process/bundle/{bundleId}`.
const BUNDLE_ID_REGEX = /\/process\/bundle\/([^/?#]+)/

/**
 * Resolves the SaaS census id for a process. SaaS member-based censuses are not referenced directly on
 * the election: the election's census URL points to its process bundle, whose `census.id` is the
 * SaaS census id we can append members to. So we fetch the election from the SAAS API to read its census
 * URL, then fetch the bundle to read the census id.
 *
 * Returns `undefined` for processes that are not backed by a SaaS member census (e.g. spreadsheet/web3).
 */
export const useProcessCensusId = (client: VocdoniApiClient, processId?: string, enabled: boolean = true) => {
  const { bearedFetch } = useAuth()

  return useQuery<string | undefined, Error>({
    queryKey: QueryKeys.process.census(processId),
    enabled: enabled && !!processId,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const election = await client.elections.get(processId!)
      const bundleId = election.census?.uri?.match(BUNDLE_ID_REGEX)?.[1]
      if (!bundleId) return undefined

      const bundle = await bearedFetch<ProcessBundleResponse>(
        ApiEndpoints.ProcessBundleId.replace('{bundleId}', bundleId)
      )
      return bundle.census?.id
    },
  })
}

/**
 * Appends existing organization members to a census (append-only: members already present are
 * skipped by the backend).
 */
export const useAddCensusParticipants = () => {
  const { bearedFetch } = useAuth()

  return useMutation({
    mutationFn: ({ censusId, memberIds }: { censusId: string; memberIds: string[] }) =>
      bearedFetch<AddCensusParticipantsResponse>(ApiEndpoints.Census.replace('{censusId}', censusId), {
        method: 'POST',
        body: { memberIds },
      }),
  })
}

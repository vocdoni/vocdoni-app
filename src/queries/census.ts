import { useQuery } from '@tanstack/react-query'
import { useElection } from '@vocdoni/react-components'
import { CensusType, PublishedElection } from '@vocdoni/sdk'
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

// For CSP (bundle-based) elections `maxCensusSize` is the maximum number of voters allowed to vote, not
// the actual census size. The real size lives in the bundle JSON pointed at by `census.censusURI`.
// For any other census type the size is already populated on `election.census.size`, so we just fall
// back to it (and ultimately to `maxCensusSize` when neither is available).
export const useCensusSize = () => {
  const { election } = useElection()

  const isPublished = election instanceof PublishedElection
  const isCsp = isPublished && election.census?.type === CensusType.CSP
  const bundleURI = isCsp ? election.census.censusURI : undefined

  const { data: bundle, isLoading } = useCensusBundle(bundleURI)

  const fallback = isPublished ? (election.census?.size ?? election.maxCensusSize ?? 0) : 0
  const size = bundle?.census?.size ?? fallback

  return { size, isLoading: !!bundleURI && isLoading }
}

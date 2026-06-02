import { useQuery } from '@tanstack/react-query'
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
  processes: null
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

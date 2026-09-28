import { useMutation, useQuery } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { CreateVotingProcessRequest } from '@vocdoni/api-types'
import { useApiClient } from '~src/providers/ApiClientProvider'
import type { Process } from './common'
import { votingProcessToForm } from './draft-mapping'

type UpdateProcessRequest = {
  processId: string
  body: CreateVotingProcessRequest
}

export const useCreateProcess = () => {
  const { client } = useApiClient()

  return useMutation<string, Error, CreateVotingProcessRequest>({
    mutationFn: (request) => client.elections.create(request),
  })
}

export const useUpdateProcess = () => {
  const { client } = useApiClient()

  return useMutation<void, Error, UpdateProcessRequest>({
    mutationFn: ({ processId, body }) => client.elections.update(processId, body),
  })
}

export const useDraft = (draftId?: string | null) => {
  const { client } = useApiClient()

  return useQuery<Process | null, Error>({
    queryKey: ['draft', draftId],
    enabled: !!draftId,
    queryFn: async () => {
      try {
        return votingProcessToForm(await client.elections.get(draftId!))
      } catch (error) {
        // A stale draft id (deleted elsewhere, or left over from the legacy
        // draft store) must not break the wizard: fall back to a blank form.
        if (error instanceof VocdoniApiError && error.status === 404) return null
        throw error
      }
    },
    refetchOnWindowFocus: false,
  })
}

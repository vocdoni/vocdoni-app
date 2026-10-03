import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

/** Where the `updatedAt` of the draft an editor loaded is kept, beside the draft itself. */
export const draftVersionKey = (draftId: string) => ['draft', draftId, 'updatedAt']

export const useDraft = (draftId?: string | null) => {
  const { client } = useApiClient()
  const queryClient = useQueryClient()

  return useQuery<Process | null, Error>({
    queryKey: ['draft', draftId],
    enabled: !!draftId,
    queryFn: async () => {
      try {
        const process = await client.elections.get(draftId!)
        // The form drops it: kept so the editor's conditional writes compare against what it loaded
        queryClient.setQueryData(draftVersionKey(draftId!), (process as { updatedAt?: string }).updatedAt ?? null)
        return votingProcessToForm(process)
      } catch (error) {
        // A stale draft id (deleted elsewhere, or left over from the legacy
        // draft store) must not break the wizard: fall back to a blank form.
        if (error instanceof VocdoniApiError && error.status === 404) return null
        throw error
      }
    },
    // Read fresh every time an editing session opens it, never refetched into a form being edited
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}

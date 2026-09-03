import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { ProcessParticipantEntry, ProcessParticipantLookupField } from '@vocdoni/api-types'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { QueryKeys } from './keys'

export type { ProcessParticipantEntry, ProcessParticipantLookupField }

// The credential fields the admin participants lookup accepts. Narrower than the census
// authFields: name/surname/birthDate are census auth credentials but not queryable.
export const PARTICIPANT_LOOKUP_FIELDS: ProcessParticipantLookupField[] = [
  'email',
  'phone',
  'memberNumber',
  'nationalId',
]

export const isParticipantLookupField = (field: string): field is ProcessParticipantLookupField =>
  (PARTICIPANT_LOOKUP_FIELDS as string[]).includes(field)

type UseProcessParticipantsParams = {
  processId?: string
  field: ProcessParticipantLookupField
  value: string
}

// Polls the backend every 5 seconds while the search box has text. The query key encodes every
// input, so identical searches dedupe, slow responses can only land in their own key's cache (never
// overwriting a newer search), and the polling timer is cleaned up automatically on unmount.
export const useProcessParticipants = ({ processId, field, value }: UseProcessParticipantsParams) => {
  const { client } = useApiClient()
  const trimmed = value.trim()

  return useQuery<ProcessParticipantEntry[], Error>({
    queryKey: QueryKeys.process.participants(processId, field, trimmed),
    queryFn: async () => {
      const res = await client.elections.participants(processId!, { field, value: trimmed })
      return res.participants
    },
    enabled: Boolean(processId) && trimmed.length > 0,
    retry: false,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => (query.state.status === 'error' ? false : 5000),
    staleTime: 0,
  })
}

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { normalizeEmail } from '~utils/strings'
import { QueryKeys } from './keys'

// The credential field a member is looked up by. This is whichever field the census uses for voter
// authentication (e.g. memberNumber, email, name, surname), so it is intentionally a free string.
export type ParticipantFieldName = string

export type CensusParticipant = {
  memberId: string
  name: string
  surname: string
  email: string
  memberNumber: string
  hasVoted: boolean
}

type ParticipantsCheckResponse = {
  participants: CensusParticipant[]
}

type UseParticipantsCheckParams = {
  bundleId?: string
  processID?: string
  fieldName: ParticipantFieldName
  value: string
}

// Polls the backend every 5 seconds while the search box has text. The query key encodes every
// input, so identical searches dedupe, slow responses can only land in their own key's cache (never
// overwriting a newer search), and the polling timer is cleaned up automatically on unmount.
export const useParticipantsCheck = ({ bundleId, processID, fieldName, value }: UseParticipantsCheckParams) => {
  const { bearedFetch } = useAuth()
  // Emails are matched case-insensitively (see normalizeEmail); other fields are only trimmed.
  const trimmed = fieldName === 'email' ? normalizeEmail(value) : value.trim()
  const url = ApiEndpoints.ProcessBundleParticipantsCheck.replace('{bundleId}', bundleId ?? '')

  return useQuery<ParticipantsCheckResponse, Error>({
    queryKey: QueryKeys.process.participantsCheck(bundleId, processID, fieldName, trimmed),
    queryFn: () =>
      bearedFetch<ParticipantsCheckResponse>(url, {
        method: 'POST',
        body: { fieldName, value: trimmed, processID },
      }),
    enabled: Boolean(bundleId) && Boolean(processID) && trimmed.length > 0,
    retry: false,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
    refetchInterval: (query) => (query.state.status === 'error' ? false : 5000),
    staleTime: 0,
  })
}

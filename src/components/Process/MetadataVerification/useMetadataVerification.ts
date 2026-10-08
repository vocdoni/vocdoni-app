import { useQuery } from '@tanstack/react-query'
import { useElection } from '@vocdoni/react-components'
import { useMemo } from 'react'
import { useAppEnv } from '~src/app-env'
import { getVochainGatewayUrl } from '~src/legacy/vochain-archive'
import {
  createFetchBytes,
  createGetChainElection,
  createSha256Hex,
  displayedMediaUrls,
  verifyProcessMetadata,
  type ProcessVerification,
} from './verify'

export const metadataVerificationQueryKey = (processId: string) => ['process', 'metadata-verification', processId]

/**
 * Verifies, in the browser, the ballot content of the current election against the hashes
 * committed on the Vochain. Reads the chain through the Vochain API directly. Runs only
 * client-side and only for a process with published questions; `enabled` is false otherwise.
 */
export const useMetadataVerification = () => {
  const { election } = useElection()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()

  const electionIds = useMemo(
    () => (election?.questions ?? []).map((question) => question.upstreamId).filter((id): id is string => !!id),
    [election]
  )
  const mediaUrls = useMemo(() => (election ? displayedMediaUrls(election) : []), [election])

  const enabled =
    !!election?.id && electionIds.length > 0 && typeof window !== 'undefined' && !!globalThis.crypto?.subtle

  const query = useQuery<ProcessVerification>({
    queryKey: [...metadataVerificationQueryKey(election?.id ?? ''), electionIds, mediaUrls],
    queryFn: () =>
      verifyProcessMetadata(
        { electionIds, mediaUrls },
        {
          getElection: createGetChainElection(getVochainGatewayUrl(VOCDONI_ENVIRONMENT)),
          fetchBytes: createFetchBytes(),
          sha256: createSha256Hex(),
        }
      ),
    enabled,
    // Content only changes through a signed on-chain tx, which is rare; a stale-ballot
    // rejection invalidates this query right away, so a slow refresh is enough otherwise.
    staleTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  })

  return { enabled, ...query }
}

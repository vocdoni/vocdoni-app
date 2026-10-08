import { useQuery } from '@tanstack/react-query'
import { useElection } from '@vocdoni/react-components'
import { useMemo } from 'react'
import { useAppEnv } from '~src/app-env'
import { getVochainGatewayUrl } from '~src/legacy/vochain-archive'
import {
  createFetchBytes,
  createGetChainElection,
  createSha256Hex,
  verifyProcessMetadata,
  type DisplayedProcess,
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

  // Snapshot of what the page renders: the check compares it with the verified documents,
  // so a change in the displayed content must re-run it.
  const shown = useMemo<DisplayedProcess | null>(
    () =>
      election
        ? {
            title: election.title,
            description: election.description,
            header: election.header,
            streamUri: election.streamUri,
            questions: (election.questions ?? []).map((question) => ({
              upstreamId: question.upstreamId,
              title: question.title,
              description: question.description,
              choices: (question.choices ?? []).map((choice) => ({
                title: choice.title,
                value: choice.value,
                meta: { image: choice.meta?.image },
              })),
            })),
          }
        : null,
    [election]
  )

  const enabled =
    !!election?.id &&
    !!shown?.questions?.some((question) => !!question.upstreamId) &&
    typeof window !== 'undefined' &&
    !!globalThis.crypto?.subtle

  const query = useQuery<ProcessVerification>({
    queryKey: [...metadataVerificationQueryKey(election?.id ?? ''), shown],
    queryFn: () =>
      verifyProcessMetadata(shown!, {
        getElection: createGetChainElection(getVochainGatewayUrl(VOCDONI_ENVIRONMENT)),
        fetchBytes: createFetchBytes(),
        sha256: createSha256Hex(),
      }),
    enabled,
    // Content only changes through a signed on-chain tx, which is rare; a stale-ballot
    // rejection invalidates this query right away, so a slow refresh is enough otherwise.
    staleTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  })

  return { enabled, ...query }
}

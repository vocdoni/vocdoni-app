import { useQuery } from '@tanstack/react-query'
import { useElection } from '@vocdoni/react-components'
import { useMemo } from 'react'
import { useAppEnv } from '~src/app-env'
import { getVochainGatewayUrl } from '~src/legacy/vochain-archive'
import {
  createFetchBytes,
  createGetChainElection,
  createGetChildren,
  createSha256Hex,
  verifyProcessMetadata,
  type DisplayedProcess,
  type ProcessVerification,
} from './verify'

export const metadataVerificationQueryKey = (processId: string) => ['process', 'metadata-verification', processId]

/** Fields the SaaS API serves for a published process but its published types don't declare yet. */
type Committed = { upstreamId?: string; metadataURL?: string; metadataHash?: string }

export type MetadataVerificationSource =
  /**
   * The hashes the SaaS API serves, with no chain read: what the voter uses, since every vote
   * carries both hashes and the chain rejects it unless they are the current ones.
   */
  | 'saas'
  /** An independent check (the organizer's): hashes and parent/children links read from the Vochain API. */
  | 'chain'

/**
 * Verifies, in the browser, the ballot content of the current election against the hashes
 * its elections commit. Runs only client-side and only for a process with published
 * questions; `enabled` is false otherwise.
 */
export const useMetadataVerification = (source: MetadataVerificationSource = 'saas') => {
  const { election } = useElection()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()

  // Snapshot of what the page renders: the check compares it with the verified documents,
  // so a change in the displayed content must re-run it.
  const shown = useMemo<DisplayedProcess | null>(
    () =>
      election
        ? {
            // The parent election, served by saas-backend for processes published with one.
            upstreamId: (election as Committed).upstreamId,
            metadataURL: (election as Committed).metadataURL,
            metadataHash: (election as Committed).metadataHash,
            title: election.title,
            description: election.description,
            header: election.header,
            streamUri: election.streamUri,
            questions: (election.questions ?? []).map((question) => ({
              upstreamId: question.upstreamId,
              metadataURL: (question as Committed).metadataURL,
              metadataHash: (question as Committed).metadataHash,
              title: question.title,
              description: question.description,
              choices: (question.choices ?? []).map((choice) => ({
                title: choice.title,
                value: choice.value,
                meta: { image: choice.meta?.image, description: choice.meta?.description },
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
    queryKey: [...metadataVerificationQueryKey(election?.id ?? ''), source, shown],
    queryFn: () => {
      const gateway = getVochainGatewayUrl(VOCDONI_ENVIRONMENT)
      return verifyProcessMetadata(shown!, {
        ...(source === 'chain'
          ? { chain: { getElection: createGetChainElection(gateway), getChildren: createGetChildren(gateway) } }
          : {}),
        fetchBytes: createFetchBytes(),
        sha256: createSha256Hex(),
      })
    },
    enabled,
    // Content only changes through a signed on-chain tx, which is rare; a stale-ballot
    // rejection invalidates this query right away, so a slow refresh is enough otherwise.
    staleTime: 5 * 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  })

  return { enabled, ...query }
}

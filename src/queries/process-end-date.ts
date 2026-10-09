import { useQuery } from '@tanstack/react-query'
import { computeProcessStatus } from '@vocdoni/api-client'
import type { QuestionStatus, VotingProcessResponse } from '@vocdoni/api-types'

import { useAppEnv } from '~src/app-env'
import { getVochainGatewayUrl } from '~src/legacy/vochain-archive'
import { QueryKeys } from './keys'

/**
 * The gateway serving the chain a process was anchored to.
 *
 * Derived from the process' own `chainId` rather than from `VOCDONI_ENVIRONMENT`, because the two
 * do not always agree: the staging SaaS backend anchors its processes to the production chain
 * (`vocdoni/LTS/…`), so an environment-keyed lookup would query the dev gateway and miss them.
 * `override` (the app's VOCHAIN_API_URL) replaces the gateway whatever the chain.
 */
export const getGatewayUrlForChain = (chainId?: string, override?: string) =>
  getVochainGatewayUrl(chainId?.includes('/LTS/') ? 'prod' : 'dev', override)

/**
 * A process left to run its course still ends a few seconds either side of its schedule — the chain
 * stops it at the block crossing `endDate`. Only a larger gap means somebody actually stopped it
 * ahead of time, so anything inside this window is treated as having ended as configured.
 */
const EARLY_END_TOLERANCE_MS = 60_000

const stoppedVotingStatuses = new Set<QuestionStatus>(['ENDED', 'CANCELED', 'RESULTS'])

/** True once the process no longer accepts votes, however it got there. */
export const hasStoppedVoting = (election?: VotingProcessResponse | null) =>
  !!election && stoppedVotingStatuses.has(computeProcessStatus(election.questions))

/** The `endDate` the chain recorded for one question's election, or null when unreadable. */
const fetchQuestionEndDate = async (gatewayUrl: string, upstreamId: string): Promise<Date | null> => {
  try {
    const response = await fetch(`${gatewayUrl}/elections/${upstreamId}`)

    if (!response.ok) return null

    const endDate = new Date(((await response.json()) as { endDate?: string }).endDate ?? '')

    return Number.isNaN(endDate.getTime()) ? null : endDate
  } catch {
    return null
  }
}

/**
 * When voting actually stopped, read from the chain.
 *
 * The SaaS process keeps `endDate` as the *configured* end and never rewrites it, so a process
 * stopped ahead of schedule still reports its original deadline. Each question is its own on-chain
 * election and the chain records the real end, so the process ends when its last question does.
 *
 * Returns null when no question can be read, leaving callers on the configured `endDate`.
 */
export const fetchOnChainEndDate = async (
  election: VotingProcessResponse,
  vochainApiUrl?: string
): Promise<Date | null> => {
  const gatewayUrl = getGatewayUrlForChain(election.chainId, vochainApiUrl)
  const upstreamIds = election.questions.map((question) => question.upstreamId).filter((id): id is string => !!id)

  if (!upstreamIds.length) return null

  const endDates = (await Promise.all(upstreamIds.map((id) => fetchQuestionEndDate(gatewayUrl, id)))).filter(
    (date): date is Date => date !== null
  )

  if (!endDates.length) return null

  return endDates.reduce((latest, date) => (date > latest ? date : latest))
}

/**
 * The moment voting really stopped, but only when the process was stopped meaningfully before its
 * configured end — otherwise null, since there is nothing to report beyond the configured date.
 */
export const getEarlyEndDate = (election: VotingProcessResponse, onChainEndDate?: Date | null): Date | null => {
  if (!onChainEndDate) return null

  const configured = new Date(election.endDate)

  if (Number.isNaN(configured.getTime())) return null

  return configured.getTime() - onChainEndDate.getTime() > EARLY_END_TOLERANCE_MS ? onChainEndDate : null
}

/**
 * The early end date of a process, or null when it ran to its configured end (or the chain could
 * not be read). Only queried once the process has stopped accepting votes — there is no early end
 * to report before that, and the read costs one gateway request per question.
 */
export const useProcessEarlyEndDate = (election?: VotingProcessResponse | null) => {
  const { VOCHAIN_API_URL } = useAppEnv()
  return useQuery({
    queryKey: QueryKeys.process.endDate(election?.id),
    queryFn: async () => getEarlyEndDate(election!, await fetchOnChainEndDate(election!, VOCHAIN_API_URL)),
    enabled: hasStoppedVoting(election),
    staleTime: Infinity,
    retry: false,
  })
}

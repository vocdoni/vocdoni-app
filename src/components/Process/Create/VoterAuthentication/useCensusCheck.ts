import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { CensusSpec } from '@vocdoni/api-types'
import { useOrganization } from '@vocdoni/react-components'
import { useEffect, useRef, useState } from 'react'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { QueryKeys } from '~src/queries/keys'
import { PASSWORD_CREDENTIAL } from './utils'

/**
 * The backend's verdict on a census spec (saas-backend `OrgMemberAggregationResults`),
 * normalized: a Go backend may send `null` for an empty list.
 * - `memberIds`: the members that PASS the check. Not a list of problems.
 * - `duplicates`: members whose chosen details match another member's (both of each pair).
 * - `missingData`: members lacking a chosen detail, or lacking every code contact.
 * - `notFound`: requested ids that match no member (explicit member lists only).
 */
export type CensusCheckIssues = {
  memberIds: string[]
  duplicates: string[]
  missingData: string[]
  notFound: string[]
}

/**
 * A census the backend rejected because of the members themselves is a result
 * the admin has to act on, not a failure: it is returned, not thrown. Anything
 * else (network, 5xx, 403) throws and leaves the census unchecked.
 */
export type CensusCheckResult = { valid: true } | { valid: false; issues: CensusCheckIssues }

/** `rejected`: the backend refused the census itself (e.g. its group is gone), so it cannot be saved. */
export type CensusCheckStatus = 'idle' | 'checking' | 'valid' | 'invalid' | 'rejected' | 'unavailable'

/** A finished check, kept on screen (dimmed) while the next one runs so the status doesn't flicker. */
export type CensusCheckOutcome = {
  status: Exclude<CensusCheckStatus, 'idle' | 'checking'>
  issues: CensusCheckIssues | null
  missingByField?: MissingFieldCount[] | null
}

const DEBOUNCE_MS = 450
const STALE_MS = 60_000

const toList = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : [])

const readIssues = (error: unknown): CensusCheckIssues | null => {
  if (!(error instanceof VocdoniApiError) || error.status !== 400) return null
  const data = (error.body as { data?: Record<string, unknown> } | undefined)?.data
  if (!data) return null

  const issues = {
    memberIds: toList(data.memberIds),
    duplicates: toList(data.duplicates),
    missingData: toList(data.missingData),
    notFound: toList(data.notFound),
  }
  return issues.duplicates.length || issues.missingData.length ? issues : null
}

/**
 * Order-insensitive identity of a census spec: the check's cache key. Anonymity
 * and weighting are left out: the backend's member check does not depend on them.
 */
export const censusSpecSignature = (spec: CensusSpec) =>
  JSON.stringify([spec.groupId ?? null, [...(spec.authFields ?? [])].sort(), [...(spec.twoFaFields ?? [])].sort()])

export const hasAuthFields = (spec: CensusSpec) => !!spec.authFields?.length || !!spec.twoFaFields?.length

type ApiClient = ReturnType<typeof useApiClient>['client']

const censusCheckQuery = (client: ApiClient, orgAddress: string | undefined, spec: CensusSpec) => ({
  queryKey: QueryKeys.organization.censusCheck(orgAddress, censusSpecSignature(spec)),
  queryFn: async (): Promise<CensusCheckResult> => {
    try {
      await client.elections.validateCensus({ orgAddress: orgAddress ?? '', census: spec })
      return { valid: true }
    } catch (error) {
      const issues = readIssues(error)
      if (issues) return { valid: false, issues }
      throw error
    }
  },
  staleTime: STALE_MS,
  retry: false,
})

/** One field (or the code contacts, as one) and how many members lack it. */
export type MissingFieldCount = { field: string; count: number }

// The backend reports a member as missing data without saying which chosen
// field is empty. When several fields are chosen, each is checked on its own
// (only after a failed check, and cached) so the admin is told which one.
// The password is left out: the backend refuses it alone, see `missingByField`.
const fieldParts = (spec: CensusSpec) => [
  ...(spec.authFields ?? [])
    .filter((field) => field !== PASSWORD_CREDENTIAL)
    .map((field) => ({
      field: field as string,
      spec: { ...spec, authFields: [field], twoFaFields: undefined },
    })),
  ...(spec.twoFaFields?.length
    ? [{ field: 'contact', spec: { ...spec, authFields: undefined, twoFaFields: spec.twoFaFields } }]
    : []),
]

/**
 * Checks that every member targeted by a census spec can sign in with it. Debounced
 * while the admin is still choosing; `check()` asks the backend afresh, for the moment they save.
 */
export const useCensusCheck = (spec: CensusSpec, { enabled = true }: { enabled?: boolean } = {}) => {
  const { client } = useApiClient()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()
  const orgAddress = organization?.address
  const signature = censusSpecSignature(spec)
  const active = enabled && !!orgAddress && hasAuthFields(spec)

  const [settled, setSettled] = useState({ signature, spec })
  useEffect(() => {
    const timer = setTimeout(() => setSettled({ signature, spec }), DEBOUNCE_MS)
    return () => clearTimeout(timer)
    // Keyed on the signature, not the spec object: callers rebuild the spec on
    // every render, and only a change to what it asks for should restart the wait.
  }, [signature])

  const query = useQuery({
    ...censusCheckQuery(client, orgAddress, settled.spec),
    enabled: active && hasAuthFields(settled.spec),
    refetchOnWindowFocus: false,
  })

  const pending = settled.signature !== signature
  let status: CensusCheckStatus = 'idle'
  if (active) {
    if (pending || query.isFetching) status = 'checking'
    else if (query.isError)
      status = query.error instanceof VocdoniApiError && query.error.status === 400 ? 'rejected' : 'unavailable'
    else if (query.data) status = query.data.valid ? 'valid' : 'invalid'
  }

  const result = query.data
  const issues = result && result.valid === false ? result.issues : null

  const parts = fieldParts(settled.spec)
  const fieldCount = (settled.spec.authFields?.length ?? 0) + (settled.spec.twoFaFields?.length ? 1 : 0)
  const breakdownNeeded = status === 'invalid' && !!issues?.missingData.length && fieldCount > 1
  const breakdown = useQueries({
    queries: parts.map((part) => ({
      ...censusCheckQuery(client, orgAddress, part.spec),
      enabled: breakdownNeeded,
      refetchOnWindowFocus: false,
    })),
  })
  // Null until every part has answered: better the combined sentence than a partial one.
  let missingByField: MissingFieldCount[] | null = null
  if (breakdownNeeded && breakdown.every((part) => part.isSuccess)) {
    const missingIn = (data: CensusCheckResult | undefined) =>
      data && data.valid === false ? data.issues.missingData : []
    const named = parts.map((part, index) => ({ field: part.field, missing: missingIn(breakdown[index].data) }))
    // The password is never checked alone, so its count is what the combined check flags beyond the other
    // parts. That undercounts a member who lacks the password and another chosen field: they are already counted there.
    const namedMissing = new Set(named.flatMap((part) => part.missing))
    const passwordCount = (issues?.missingData ?? []).filter((id) => !namedMissing.has(id)).length
    const hasPassword = settled.spec.authFields?.includes(PASSWORD_CREDENTIAL)
    missingByField = [
      ...named.map((part) => ({ field: part.field, count: part.missing.length })),
      ...(hasPassword ? [{ field: PASSWORD_CREDENTIAL, count: passwordCount }] : []),
    ].filter((part) => part.count > 0)
  }

  const lastOutcome = useRef<CensusCheckOutcome | null>(null)
  if (!active) lastOutcome.current = null
  else if (status === 'valid' || status === 'invalid' || status === 'rejected' || status === 'unavailable') {
    lastOutcome.current = { status, issues, missingByField }
  }

  // Always asks the backend: the member list may have been fixed since the cached answer.
  const check = () => queryClient.fetchQuery({ ...censusCheckQuery(client, orgAddress, spec), staleTime: 0 })

  return {
    status,
    issues,
    missingByField,
    /** While checking: the previous outcome, to keep showing until the new one lands. */
    previous: status === 'checking' ? lastOutcome.current : null,
    retry: query.refetch,
    check,
  }
}

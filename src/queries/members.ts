import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { VocdoniApiError } from '@vocdoni/api-client'
import { useOrganization } from '@vocdoni/react-components'
import { PaginationResponse } from '~src/queries/pagination'
import { useParams, useSearchParams } from 'react-router'
import { ApiEndpoints, ApiError } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import type { MemberSortField } from '~components/Memberbase/fields'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { QueryKeys } from './keys'

export type Member = {
  id?: string
  memberNumber: string
  name: string
  surname: string
  email: string
  password: string
  phone: string
  nationalId: string
  birthDate: string
  weight?: string
}

export type MembersResponse = {
  members: Member[]
} & PaginationResponse

type AddMembersResponse = {
  jobId?: string
  count: number
}

type PaginatedMembersProps = {
  search?: string
  /** Defaults to the route's `:page` */
  page?: number
  /** Defaults to the `?limit` query param */
  limit?: number
  sortBy?: MemberSortField
  sortOrder?: 'asc' | 'desc'
  /** Keeps showing the last page while the next one loads, instead of an empty list */
  keepPrevious?: boolean
}

export type ImportJobStatus = 'pending' | 'completed' | 'failed'

export type ImportJob = {
  jobId: string
  type: string
  status: ImportJobStatus
  errors?: string[]
  result?: {
    added?: number
    progress?: number
    total?: number
  }
}

type MembersData = {
  ids?: string[]
  all?: boolean
}

type EditMemberPayload = Partial<Member> & { id: string }

export const useUrlPagination = () => {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const page = Number(params.page ?? 1)
  const limit = Number(searchParams.get('limit') ?? 10)
  return {
    page,
    limit,
  }
}

export const usePaginatedMembers = ({
  search = '',
  page: pageProp,
  limit: limitProp,
  sortBy,
  sortOrder,
  keepPrevious = false,
}: PaginatedMembersProps) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const urlPagination = useUrlPagination()
  const page = pageProp ?? urlPagination.page
  const limit = limitProp ?? urlPagination.limit

  const baseUrl = ApiEndpoints.OrganizationMembers.replace('{address}', organization?.address)
  const sort = sortBy ? `&sortBy=${sortBy}&sortOrder=${sortOrder ?? 'asc'}` : ''
  const fetchUrl = `${baseUrl}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}${sort}`

  return useQuery<MembersResponse, Error>({
    queryKey: [
      ...QueryKeys.organization.members(organization?.address),
      page,
      limit,
      search,
      ...(sortBy ? [sortBy, sortOrder ?? 'asc'] : []),
    ],
    enabled: !!organization?.address,
    queryFn: () => bearedFetch<MembersResponse>(fetchUrl),
    placeholderData: keepPrevious ? keepPreviousData : undefined,
  })
}

/**
 * The memberbase size. Asks for a single row and reads the pagination total, rather than
 * downloading the whole memberbase just to count it. `known` stays false until the total arrives.
 */
export const useMembersCount = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()

  const fetchUrl = `${ApiEndpoints.OrganizationMembers.replace('{address}', organization?.address)}?page=1&limit=1`

  const query = useQuery<MembersResponse, Error, number>({
    queryKey: [...QueryKeys.organization.members(organization?.address), 'count'],
    enabled: !!organization?.address,
    queryFn: () => bearedFetch<MembersResponse>(fetchUrl),
    select: (data) => data.pagination.totalItems,
  })

  return { count: query.data ?? 0, isLoading: query.isLoading, known: query.data !== undefined }
}

/** The most rows `GET /members` returns per page. */
export const MEMBERS_PAGE_MAX = 100

/**
 * The most members the app loads into memory at once: "Select all matching" with a search, the
 * member index used to match a pasted list, and "Show them". Past it, the UI says so first.
 */
export const MEMBERS_COLLECT_CAP = 5000

export type CollectedMember = Member & { id: string }

export type CollectProgress = {
  collected: number
  /** How many match, from the first page (0 until it arrives) */
  total: number
}

export type CollectOptions = {
  search?: string
  /** Stop after this many. No cap when left out */
  max?: number
  signal?: AbortSignal
  onProgress?: (progress: CollectProgress) => void
}

export type CollectResult = {
  members: CollectedMember[]
  /** How many matched when collecting started */
  total: number
  /** Stopped at `max` with more left */
  capped: boolean
}

export type MembersPageFetcher = (params: { page: number; limit: number; search: string }) => Promise<MembersResponse>

const abortError = () => new DOMException('Collecting members was stopped', 'AbortError')

/** Whether an error comes from stopping a collection (or any aborted request). */
export const isAbortError = (error: unknown) => error instanceof DOMException && error.name === 'AbortError'

/**
 * Pages through `GET /members` (100 at a time, one request after another) and returns every
 * member matching `search`, up to `max`. There's no endpoint that returns ids alone, nor one that
 * reads members by id, so this is how the app gets a set of members it hasn't shown. Throws an
 * `AbortError` once `signal` aborts, between pages.
 */
export const collectMembers = async (
  fetchPage: MembersPageFetcher,
  { search = '', max = Infinity, signal, onProgress }: CollectOptions = {}
): Promise<CollectResult> => {
  const seen = new Map<string, CollectedMember>()
  let total = 0
  let page = 1
  let lastPage = 1

  do {
    if (signal?.aborted) throw abortError()
    const response = await fetchPage({ page, limit: MEMBERS_PAGE_MAX, search })
    if (signal?.aborted) throw abortError()
    if (page === 1) total = response.pagination?.totalItems ?? 0
    lastPage = response.pagination?.lastPage ?? page
    const rows = response.members ?? []
    for (const member of rows) {
      if (seen.size >= max) break
      if (member.id && !seen.has(member.id)) seen.set(member.id, member as CollectedMember)
    }
    onProgress?.({ collected: seen.size, total: Math.min(total, max) })
    if (!rows.length) break
    page += 1
  } while (page <= lastPage && seen.size < max)

  return { members: [...seen.values()], total, capped: total > seen.size && seen.size >= max }
}

/** Fetches one page of members, outside React Query (the collector pages on its own). */
export const useMembersPageFetcher = (): MembersPageFetcher => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const address = organization?.address

  return useCallback(
    ({ page, limit, search }) => {
      const baseUrl = ApiEndpoints.OrganizationMembers.replace('{address}', address)
      return bearedFetch<MembersResponse>(`${baseUrl}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`)
    },
    [bearedFetch, address]
  )
}

/**
 * Collects members matching a search, with progress and a way to stop. Reused wherever the app
 * needs members it hasn't shown: "Select all matching", acting on everyone, pasted lists. Only one
 * collection runs at a time: starting another stops the last, and so does unmounting.
 */
export const useMemberIdCollector = () => {
  const fetchPage = useMembersPageFetcher()
  const [progress, setProgress] = useState<CollectProgress | null>(null)
  const controller = useRef<AbortController | null>(null)

  useEffect(() => () => controller.current?.abort(), [])

  const collect = useCallback(
    async (options: Omit<CollectOptions, 'signal'> = {}) => {
      controller.current?.abort()
      const current = new AbortController()
      controller.current = current
      setProgress({ collected: 0, total: 0 })
      try {
        return await collectMembers(fetchPage, {
          ...options,
          signal: current.signal,
          onProgress: (next) => {
            if (!current.signal.aborted) setProgress(next)
            options.onProgress?.(next)
          },
        })
      } finally {
        if (controller.current === current) {
          controller.current = null
          setProgress(null)
        }
      }
    },
    [fetchPage]
  )

  const abort = useCallback(() => controller.current?.abort(), [])

  /** How many members match `search` right now (one single-row request) */
  const count = useCallback(
    async (search = '') => (await fetchPage({ page: 1, limit: 1, search })).pagination?.totalItems ?? 0,
    [fetchPage]
  )

  return useMemo(
    () => ({ collect, abort, count, progress, running: progress !== null }),
    [collect, abort, count, progress]
  )
}

const memberIndexKey = (address?: string) => [...QueryKeys.organization.members(address), 'index']

/** How long a loaded member index is reused (any member write refreshes it sooner) */
export const MEMBER_INDEX_STALE_TIME = 5 * 60 * 1000

/**
 * Loads every member of an organization of up to 5,000 into memory, once, for matching on the
 * client (a pasted list, the people missing contact details). Cached under the members key, so any
 * member write refreshes it. Bigger organizations get the first 5,000 and `capped`.
 */
export const useLoadMemberIndex = () => {
  const queryClient = useQueryClient()
  const fetchPage = useMembersPageFetcher()
  const { organization } = useOrganization()
  const address = organization?.address

  return useCallback(
    (options: Pick<CollectOptions, 'onProgress' | 'signal'> = {}) =>
      queryClient.fetchQuery({
        queryKey: memberIndexKey(address),
        queryFn: () => collectMembers(fetchPage, { ...options, max: MEMBERS_COLLECT_CAP }),
        staleTime: MEMBER_INDEX_STALE_TIME,
      }),
    [queryClient, fetchPage, address]
  )
}

/** The member index as a query, with loading progress: see `useLoadMemberIndex`. */
export const useMemberIndex = ({ enabled }: { enabled: boolean }) => {
  const fetchPage = useMembersPageFetcher()
  const { organization } = useOrganization()
  const address = organization?.address
  const [progress, setProgress] = useState<CollectProgress | null>(null)

  const query = useQuery({
    queryKey: memberIndexKey(address),
    enabled: enabled && !!address,
    staleTime: MEMBER_INDEX_STALE_TIME,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: ({ signal }) => collectMembers(fetchPage, { max: MEMBERS_COLLECT_CAP, signal, onProgress: setProgress }),
  })

  return { ...query, progress: query.isFetching ? progress : null }
}

/** Refreshes every member read (lists, count, sign-in readiness) after a write. */
const useInvalidateMembers = () => {
  const queryClient = useQueryClient()
  const { organization } = useOrganization()
  return () =>
    queryClient.invalidateQueries({ queryKey: QueryKeys.organization.members(organization?.address), exact: false })
}

export const useAddMembers = (isAsync: boolean = false) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const invalidate = useInvalidateMembers()

  const baseUrl = ApiEndpoints.OrganizationMembers.replace('{address}', organization.address)
  const fetchUrl = `${baseUrl}?async=${isAsync}`

  return useMutation<AddMembersResponse, Error, Record<string, any>>({
    mutationKey: QueryKeys.organization.members(organization?.address),
    mutationFn: async (members) =>
      await bearedFetch<AddMembersResponse>(fetchUrl, { body: { members }, method: 'POST' }),
    onSuccess: () => invalidate(),
  })
}

export const useEditMember = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const invalidate = useInvalidateMembers()

  const baseUrl = ApiEndpoints.OrganizationMembers.replace('{address}', organization.address)

  return useMutation<void, Error, EditMemberPayload>({
    mutationKey: QueryKeys.organization.members(organization?.address),
    mutationFn: async ({ id, ...member }) =>
      await bearedFetch<void>(baseUrl, { body: { id, ...member }, method: 'PUT' }),
    onSuccess: () => invalidate(),
  })
}

export const useDeleteMembers = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const invalidate = useInvalidateMembers()

  return useMutation<void, Error, MembersData>({
    mutationKey: QueryKeys.organization.members(organization?.address),
    mutationFn: async (body: MembersData) =>
      await bearedFetch<void>(ApiEndpoints.OrganizationMembers.replace('{address}', organization.address), {
        body,
        method: 'DELETE',
      }),
    onSuccess: () => invalidate(),
  })
}

/** Polls an import job until it completes or fails. Idle without a job id. */
export const useImportJobProgress = (jobId: string | null) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()

  // Authenticated so the response includes per-row import `errors`, which are
  // stripped for anonymous requests.
  const url = ApiEndpoints.Job.replace('{jobId}', jobId ?? '')

  return useQuery({
    enabled: Boolean(jobId),
    queryKey: QueryKeys.organization.membersImportProgress(organization.address, jobId),
    queryFn: () => bearedFetch<ImportJob>(url),
    retry: false,
    refetchInterval: (query) => {
      const { data, status } = query.state
      if (status === 'error') return false
      if (!data || data.status === 'pending') return 2000
      return false
    },
    refetchOnWindowFocus: false,
  })
}

/**
 * The members a delete was refused for: the backend deletes nobody (409) when any of them has
 * already been signed for in a vote that's still open, and lists them in `data.signedMemberIds`.
 * `null` when the error is anything else.
 */
export const getSignedMemberIds = (error: unknown): string[] | null => {
  if (!(error instanceof ApiError) || error.response?.status !== 409) return null
  const data = (error.apiError as { data?: { signedMemberIds?: unknown } } | undefined)?.data
  const ids = data?.signedMemberIds
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : []
}

type ValidationClient = ReturnType<typeof useApiClient>['client']

/**
 * The members who lack `field` (email or phone), from the census validation endpoint: a 200 means
 * everyone has it, a 400 lists who doesn't in `data.missingData`. Any other failure throws.
 */
const membersMissing = async (client: ValidationClient, orgAddress: string, field: 'email' | 'phone') => {
  try {
    await client.elections.validateCensus({ orgAddress, census: { authFields: [], twoFaFields: [field] } })
    return []
  } catch (error) {
    if (error instanceof VocdoniApiError && error.status === 400) {
      const missing = (error.body as { data?: { missingData?: unknown } } | undefined)?.data?.missingData
      if (Array.isArray(missing)) return missing.filter((id): id is string => typeof id === 'string')
    }
    throw error
  }
}

/** Who can't get a voting code: no email and no mobile. */
export const computeReadiness = (missingEmail: string[], missingPhone: string[]) => {
  const noPhone = new Set(missingPhone)
  const unreachable = missingEmail.filter((id) => noPhone.has(id))
  return { missingEmail: missingEmail.length, missingPhone: missingPhone.length, unreachable: unreachable.length }
}

export const READINESS_STALE_TIME = 5 * 60 * 1000

/**
 * How many members can get a voting code by email or SMS. Two validation calls (email, then
 * phone), cached for 5 minutes and refreshed by any member write (they share the members key).
 * Never polled. `available` stays false when it can't be worked out, so the UI says nothing.
 */
export const useSignInReadiness = () => {
  const { organization } = useOrganization()
  const { client } = useApiClient()
  const { count, known } = useMembersCount()
  const address = organization?.address

  const query = useQuery({
    queryKey: [...QueryKeys.organization.members(address), 'readiness'],
    enabled: !!address && known && count > 0,
    staleTime: READINESS_STALE_TIME,
    retry: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const [missingEmail, missingPhone] = await Promise.all([
        membersMissing(client, address!, 'email'),
        membersMissing(client, address!, 'phone'),
      ])
      return computeReadiness(missingEmail, missingPhone)
    },
  })

  const unreachable = Math.min(query.data?.unreachable ?? 0, count)
  return {
    available: query.isSuccess && known && count > 0,
    total: count,
    ready: count - unreachable,
    unreachable,
    isLoading: query.isLoading,
  }
}

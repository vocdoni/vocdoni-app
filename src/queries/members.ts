import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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

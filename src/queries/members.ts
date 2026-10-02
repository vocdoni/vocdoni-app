import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import { PaginationResponse } from '~src/queries/pagination'
import { useParams, useSearchParams } from 'react-router'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import type { MemberSortField } from '~components/Memberbase/fields'
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

import { useMutation, useQuery } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import { PaginationResponse } from '~src/queries/pagination'
import { generatePath, useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { MemberbaseTabsContext } from '~components/Memberbase'
import { Routes } from '~routes'
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
  page: number
  pages: number
}

type PaginatedMembers = {
  members: Member[]
} & PaginationResponse

type AddMembersResponse = {
  jobId?: string
  count: number
}

type PaginatedMembersProps = {
  search?: string
  showAll?: boolean
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

// Member fields the backend can order the list by (`sortBy` query param).
export const MEMBER_SORT_FIELDS = ['name', 'surname', 'email', 'memberNumber'] as const

export type MemberSortField = (typeof MEMBER_SORT_FIELDS)[number]

export type SortOrder = 'asc' | 'desc'

export type MemberSort = {
  sortBy: MemberSortField
  sortOrder: SortOrder
} | null

export const isMemberSortField = (value: unknown): value is MemberSortField =>
  MEMBER_SORT_FIELDS.includes(value as MemberSortField)

// Header click cycle: asc -> desc -> unsorted. A different column always starts at asc.
export const nextMemberSort = (current: MemberSort, field: MemberSortField): MemberSort => {
  if (current?.sortBy !== field) return { sortBy: field, sortOrder: 'asc' }
  if (current.sortOrder === 'asc') return { sortBy: field, sortOrder: 'desc' }
  return null
}

// The member sort lives in the URL next to `limit`; unknown values are ignored so a
// hand-edited URL falls back to the server's default order instead of a 400.
export const useUrlMemberSort = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sortBy = searchParams.get('sortBy')
  const sortOrder: SortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc'
  const sort: MemberSort = isMemberSortField(sortBy) ? { sortBy, sortOrder } : null

  const toggleSort = (field: MemberSortField) => {
    const next = nextMemberSort(sort, field)
    const params = new URLSearchParams(searchParams)
    if (next) {
      params.set('sortBy', next.sortBy)
      params.set('sortOrder', next.sortOrder)
    } else {
      params.delete('sortBy')
      params.delete('sortOrder')
    }
    const query = params.toString()
    // A new order invalidates the current page, so go back to the first one.
    navigate(`${generatePath(Routes.dashboard.memberbase.members, { page: '1' })}${query ? `?${query}` : ''}`)
  }

  return { sort, toggleSort }
}

export const usePaginatedMembers = ({ search = '', showAll = false }: PaginatedMembersProps) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const { page, limit } = useUrlPagination()
  const { sort: urlSort } = useUrlMemberSort()

  const effectivePage = showAll ? 1 : page
  const effectiveLimit = showAll ? 0 : limit
  // showAll callers only need totals or the full set, so skip the sort to share one cached query.
  const sort = showAll ? null : urlSort

  const baseUrl = ApiEndpoints.OrganizationMembers.replace('{address}', organization?.address)
  const sortQuery = sort ? `&sortBy=${sort.sortBy}&sortOrder=${sort.sortOrder}` : ''
  const fetchUrl = `${baseUrl}?page=${effectivePage}&limit=${effectiveLimit}&search=${search}${sortQuery}`

  return useQuery<MembersResponse, Error, PaginatedMembers>({
    queryKey: [
      ...QueryKeys.organization.members(organization?.address),
      effectivePage,
      effectiveLimit,
      search,
      sort?.sortBy ?? null,
      sort?.sortOrder ?? null,
    ],
    enabled: !!organization?.address,
    queryFn: () => bearedFetch<MembersResponse>(fetchUrl),
  })
}

export const useAddMembers = (isAsync: boolean = false) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()

  const baseUrl = ApiEndpoints.OrganizationMembers.replace('{address}', organization.address)
  const fetchUrl = `${baseUrl}?async=${isAsync}`

  return useMutation<AddMembersResponse, Error, Record<string, any>>({
    mutationKey: QueryKeys.organization.members(organization?.address),
    mutationFn: async (members) =>
      await bearedFetch<AddMembersResponse>(fetchUrl, { body: { members }, method: 'POST' }),
  })
}

export const useEditMember = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()

  const baseUrl = ApiEndpoints.OrganizationMembers.replace('{address}', organization.address)

  return useMutation<void, Error, EditMemberPayload>({
    mutationKey: QueryKeys.organization.members(organization?.address),
    mutationFn: async ({ id, ...member }) =>
      await bearedFetch<void>(baseUrl, { body: { id, ...member }, method: 'PUT' }),
  })
}

export const useDeleteMembers = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()

  return useMutation<void, Error, MembersData>({
    mutationKey: QueryKeys.organization.members(organization?.address),
    mutationFn: async (body: MembersData) =>
      await bearedFetch<void>(ApiEndpoints.OrganizationMembers.replace('{address}', organization.address), {
        body,
        method: 'DELETE',
      }),
  })
}

export const useImportJobProgress = () => {
  const { jobId } = useOutletContext<MemberbaseTabsContext>()
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()

  // Authenticated so the response includes per-row import `errors`, which are
  // stripped for anonymous requests.
  const url = ApiEndpoints.Job.replace('{jobId}', jobId)

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

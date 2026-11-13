import { useMutation, useQuery, type PlaceholderDataFunction } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import { PaginationResponse } from '~src/queries/pagination'
import { useOutletContext, useParams, useSearchParams } from 'react-router'
import { useCallback } from 'react'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import type { MemberbaseTabsContext } from '~components/Memberbase'
import { requireOrganizationAddress } from '~utils/organization'
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
  // Read-only: the API never returns the password, only whether the member has one.
  hasPassword?: boolean
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
  // Only the total is needed: asks for a single row and the caller reads `pagination.totalItems`.
  countOnly?: boolean
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

export type MemberSort = { sortBy: MemberSortField; sortOrder: SortOrder }

// What the backend orders by when the URL carries no sort. The UI shows it as the active sort too.
export const DEFAULT_MEMBER_SORT: MemberSort = { sortBy: 'name', sortOrder: 'asc' }

export const isMemberSortField = (value: unknown): value is MemberSortField =>
  MEMBER_SORT_FIELDS.includes(value as MemberSortField)

// Header click cycle, starting from the active sort: a different column starts at asc, the same
// column goes asc -> desc, and desc -> null, which drops the sort params from the URL. The default
// order is also null, so it never gets a redundant explicit URL sort.
export const nextMemberSort = (current: MemberSort | null, field: MemberSortField): MemberSort | null => {
  if (current?.sortBy !== field) {
    const next: MemberSort = { sortBy: field, sortOrder: 'asc' }
    const isDefault = next.sortBy === DEFAULT_MEMBER_SORT.sortBy && next.sortOrder === DEFAULT_MEMBER_SORT.sortOrder
    return isDefault ? null : next
  }
  if (current.sortOrder === 'asc') return { sortBy: field, sortOrder: 'desc' }
  return null
}

// The explicit member sort from the URL, next to `limit`. Unknown values are ignored so a
// hand-edited URL falls back to the server's default order instead of a 400.
export const parseMemberSort = (searchParams: URLSearchParams): MemberSort | null => {
  const sortBy = searchParams.get('sortBy')
  const sortOrder: SortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc'
  return isMemberSortField(sortBy) ? { sortBy, sortOrder } : null
}

// Only a query of the same organization may lend its rows as placeholder data. The check is
// positional on the members key prefix: `search` is also part of the key, so looking for the
// address anywhere in it would match another organization whose search term equals this address.
const isSameOrganizationQuery = (queryKey: readonly unknown[], address?: string) => {
  if (!address) return false
  const prefix = QueryKeys.organization.members(address)
  return prefix.every((part, index) => queryKey[index] === part)
}

export const usePaginatedMembers = ({ search = '', countOnly = false }: PaginatedMembersProps) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const { page, limit } = useUrlPagination()
  const [searchParams] = useSearchParams()
  const address = organization?.address

  const effectivePage = countOnly ? 1 : page
  // `pagination.totalItems` is the size of the whole list whatever the page size, so one row is enough.
  const effectiveLimit = countOnly ? 1 : limit
  // Count readers ignore the sort, so they all share one cached query.
  const sort = countOnly ? null : parseMemberSort(searchParams)

  // Built with URLSearchParams so a search containing `?` or `&` can't break the query string.
  const query = new URLSearchParams({ page: String(effectivePage), limit: String(effectiveLimit), search })
  if (sort) {
    query.set('sortBy', sort.sortBy)
    query.set('sortOrder', sort.sortOrder)
  }
  const fetchUrl = `${ApiEndpoints.OrganizationMembers.replace('{address}', address)}?${query}`

  // Stable across renders, so TanStack Query doesn't treat it as a new option on every render.
  const keepSameOrganizationRows = useCallback<PlaceholderDataFunction<MembersResponse, Error>>(
    (previousData, previousQuery) =>
      previousQuery && isSameOrganizationQuery(previousQuery.queryKey, address) ? previousData : undefined,
    [address]
  )

  return useQuery<MembersResponse, Error>({
    queryKey: [
      ...QueryKeys.organization.members(address),
      effectivePage,
      effectiveLimit,
      search,
      sort?.sortBy ?? null,
      sort?.sortOrder ?? null,
    ],
    enabled: !!address,
    queryFn: () => bearedFetch<MembersResponse>(fetchUrl),
    // Keep showing the current rows while another page, sort or search loads, so the table doesn't
    // collapse and jump. Only within the same organization, never another org's members.
    placeholderData: keepSameOrganizationRows,
  })
}

// Unfiltered member total, fetched as a 1-item page instead of the whole list.
export const useMembersCount = () => {
  const query = usePaginatedMembers({ countOnly: true })
  return { ...query, total: query.data?.pagination?.totalItems }
}

export const useAddMembers = (isAsync: boolean = false) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()

  return useMutation<AddMembersResponse, Error, Record<string, any>>({
    mutationKey: QueryKeys.organization.members(organization?.address),
    mutationFn: async (members) => {
      const baseUrl = ApiEndpoints.OrganizationMembers.replace('{address}', requireOrganizationAddress(organization))
      return await bearedFetch<AddMembersResponse>(`${baseUrl}?async=${isAsync}`, { body: { members }, method: 'POST' })
    },
  })
}

export const useEditMember = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()

  return useMutation<void, Error, EditMemberPayload>({
    mutationKey: QueryKeys.organization.members(organization?.address),
    mutationFn: async ({ id, ...member }) => {
      const baseUrl = ApiEndpoints.OrganizationMembers.replace('{address}', requireOrganizationAddress(organization))
      return await bearedFetch<void>(baseUrl, { body: { id, ...member }, method: 'PUT' })
    },
  })
}

export const useDeleteMembers = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()

  return useMutation<void, Error, MembersData>({
    mutationKey: QueryKeys.organization.members(organization?.address),
    mutationFn: async (body: MembersData) =>
      await bearedFetch<void>(
        ApiEndpoints.OrganizationMembers.replace('{address}', requireOrganizationAddress(organization)),
        { body, method: 'DELETE' }
      ),
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
    enabled: Boolean(jobId && organization?.address),
    queryKey: QueryKeys.organization.membersImportProgress(organization?.address, jobId),
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

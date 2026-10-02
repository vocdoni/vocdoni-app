import { useMutation, useQuery } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import { PaginationResponse } from '~src/queries/pagination'
import { useParams, useSearchParams } from 'react-router'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
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

export const usePaginatedMembers = ({ search = '' }: PaginatedMembersProps) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const { page, limit } = useUrlPagination()

  const baseUrl = ApiEndpoints.OrganizationMembers.replace('{address}', organization?.address)
  const fetchUrl = `${baseUrl}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`

  return useQuery<MembersResponse, Error>({
    queryKey: [...QueryKeys.organization.members(organization?.address), page, limit, search],
    enabled: !!organization?.address,
    queryFn: () => bearedFetch<MembersResponse>(fetchUrl),
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

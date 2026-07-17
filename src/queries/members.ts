import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { enforceHexPrefix, useOrganization } from '@vocdoni/react-components'
import { PaginationResponse } from '@vocdoni/sdk'
import { useOutletContext, useParams, useSearchParams } from 'react-router-dom'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { MemberbaseTabsContext } from '~components/Memberbase'
import { QueryKeys } from './keys'
import { SetupStepIds, useOrganizationSetup } from './organization'

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

type JobResponse = {
  progress: number
  added: number
  total: number
  errors?: string[]
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

export const usePaginatedMembers = ({ search = '', showAll = false }: PaginatedMembersProps) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const { page, limit } = useUrlPagination()

  const effectivePage = showAll ? 1 : page
  const effectiveLimit = showAll ? 0 : limit

  const baseUrl = ApiEndpoints.OrganizationMembers.replace('{address}', enforceHexPrefix(organization?.address))
  const fetchUrl = `${baseUrl}?page=${effectivePage}&limit=${effectiveLimit}&search=${search}`

  return useQuery<MembersResponse, Error, PaginatedMembers>({
    queryKey: [...QueryKeys.organization.members(organization?.address), effectivePage, effectiveLimit, search],
    enabled: !!organization?.address,
    queryFn: () => bearedFetch<MembersResponse>(fetchUrl),
  })
}

export const useAddMembers = (isAsync: boolean = false) => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const { setStepDone } = useOrganizationSetup()
  const queryClient = useQueryClient()

  const baseUrl = ApiEndpoints.OrganizationMembers.replace('{address}', enforceHexPrefix(organization.address))
  const fetchUrl = `${baseUrl}?async=${isAsync}`

  return useMutation<AddMembersResponse, Error, Record<string, any>>({
    mutationKey: QueryKeys.organization.members(organization?.address),
    mutationFn: async (members) =>
      await bearedFetch<AddMembersResponse>(fetchUrl, { body: { members }, method: 'POST' }),
    onSuccess: () => {
      setStepDone(SetupStepIds.memberbaseUpload)
      queryClient.invalidateQueries({ queryKey: QueryKeys.organization.members(organization?.address) })
    },
  })
}

export const useEditMember = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()

  const baseUrl = ApiEndpoints.OrganizationMembers.replace('{address}', enforceHexPrefix(organization.address))

  return useMutation<void, Error, EditMemberPayload>({
    mutationKey: QueryKeys.organization.members(organization?.address),
    mutationFn: async ({ id, ...member }) =>
      await bearedFetch<void>(baseUrl, { body: { id, ...member }, method: 'PUT' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.organization.members(organization?.address) })
    },
  })
}

export const useDeleteMembers = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()

  return useMutation<void, Error, MembersData>({
    mutationKey: QueryKeys.organization.members(organization?.address),
    mutationFn: async (body: MembersData) =>
      await bearedFetch<void>(
        ApiEndpoints.OrganizationMembers.replace('{address}', enforceHexPrefix(organization.address)),
        {
          body,
          method: 'DELETE',
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.organization.members(organization?.address) })
    },
  })
}

export const useImportJobProgress = () => {
  const { jobId } = useOutletContext<MemberbaseTabsContext>()
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()

  const url = ApiEndpoints.OrganizationMembersImport.replace(
    '{address}',
    enforceHexPrefix(organization.address)
  ).replace('{jobId}', jobId)

  return useQuery({
    enabled: Boolean(jobId),
    queryKey: QueryKeys.organization.membersImportProgress(organization.address, jobId),
    queryFn: () => bearedFetch<JobResponse>(url),
    retry: false,
    refetchInterval: (query) => {
      const { data, status } = query.state
      if (status === 'error') return false
      if (!data || data.progress < 100) return 2000
      return false
    },
    refetchOnWindowFocus: false,
  })
}

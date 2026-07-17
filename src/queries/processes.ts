import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import type { Process } from '~components/Process/Create/common'
import { useToast } from '~components/Toast'
import { QueryKeys } from '~queries/keys'
import { useUrlPagination } from '~queries/members'

type CreateProcessRequest = {
  metadata: Process
  orgAddress: string
}

type UpdateProcessRequest = {
  processId: string
  body: CreateProcessRequest
}

export type Draft = {
  id: string
  metadata: Process
}

type DraftsResponse = {
  processes: Draft[]
  pagination: {
    totalItems: number
    currentPage: number
    lastPage: number
    previousPage: number | null
    nextPage: number | null
  }
}

export const useProcessBundle = () => {
  const { bearedFetch } = useAuth()
  return useMutation({
    mutationFn: async ({ censusId, processes }: { censusId: string; processes?: string[] }) => {
      return await bearedFetch<{ uri: string; root: string }>(ApiEndpoints.ProcessBundle, {
        method: 'POST',
        body: {
          censusId,
          processes,
        },
      })
    },
  })
}

export const useCreateProcess = () => {
  const { bearedFetch } = useAuth()

  return useMutation<string, Error, CreateProcessRequest>({
    mutationFn: async (body) => {
      return await bearedFetch(ApiEndpoints.OrganizationProcesses, {
        method: 'POST',
        body,
      })
    },
  })
}

export const useUpdateProcess = () => {
  const { bearedFetch } = useAuth()
  return useMutation<void, Error, UpdateProcessRequest>({
    mutationFn: async ({ processId, body }) => {
      return await bearedFetch(ApiEndpoints.OrganizationProcess.replace('{processId}', processId), {
        method: 'PUT',
        body,
      })
    },
  })
}

export const useDraft = (draftId?: string | null) => {
  const { bearedFetch } = useAuth()

  return useQuery<{ metadata: Process }, Error>({
    queryKey: ['draft', draftId],
    enabled: !!draftId,
    queryFn: async () => {
      return bearedFetch(ApiEndpoints.OrganizationProcess.replace('{processId}', draftId!))
    },
    refetchOnWindowFocus: false,
  })
}

export const useDrafts = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const { page, limit } = useUrlPagination()

  const baseUrl = ApiEndpoints.OrganizationDrafts.replace('{address}', organization?.address)
  const fetchUrl = `${baseUrl}?page=${page}&limit=${limit}`

  return useQuery({
    queryKey: [...QueryKeys.organization.drafts(organization?.address), page, limit],
    enabled: !!organization?.address,
    queryFn: () => bearedFetch<DraftsResponse>(fetchUrl),
  })
}

export const useDeleteDraft = () => {
  const { t } = useTranslation()
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<void, unknown, { draftId: string; silent?: boolean }>({
    mutationKey: QueryKeys.organization.drafts(organization?.address),
    mutationFn: ({ draftId }: { draftId: string; silent?: boolean }) => {
      const deleteUrl = ApiEndpoints.OrganizationProcess.replace('{processId}', draftId)
      return bearedFetch<void>(deleteUrl, {
        method: 'DELETE',
      })
    },
    onSuccess: (_data, variables) => {
      if (!variables?.silent) {
        toast({
          title: t('drafts.deleted_draft', {
            defaultValue: 'Draft deleted successfully',
          }),
          type: 'success',
          duration: 3000,
          closable: true,
        })
      }
      queryClient.invalidateQueries({
        queryKey: QueryKeys.organization.drafts(organization?.address),
        exact: false,
      })
    },
  })
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { enforceHexPrefix, useOrganization } from '@vocdoni/react-components'
import {
  AccountData,
  ensure0x,
  FetchElectionsParameters,
  FetchElectionsParametersWithPagination,
  VocdoniSDKClient,
} from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'
import { IconType } from 'react-icons'
import { LuCalendar, LuFileSpreadsheet, LuUsers, LuVote } from 'react-icons/lu'
import { generatePath } from 'react-router-dom'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { Routes } from '~routes'
import { QueryKeys } from './keys'

export enum SetupStepIds {
  organizationDetails = 'organizationDetails',
  memberbaseUpload = 'memberbaseUpload',
  firstVoteCreation = 'firstVoteCreation',
  expertCallBooking = 'expertCallBooking',
}

export enum CheckboxTypes {
  route = 'route',
  modal = 'modal',
}

export enum OrganizationMetaKeys {
  completedSteps = 'completedSteps',
  dashboardTutorial = 'isDashboardTutorialClosed',
  sidebarTutorial = 'isSidebarTutorialClosed',
}

type SetupStepId = `${SetupStepIds}`

export type OrganizationMeta = {
  [OrganizationMetaKeys.completedSteps]?: SetupStepId[]
  [OrganizationMetaKeys.dashboardTutorial]?: boolean
  [OrganizationMetaKeys.sidebarTutorial]?: boolean
}

export type OrganizationMetaResponse = {
  meta: OrganizationMeta
}

type OrganizationSteps = SetupStepId[]

type PaginatedElectionsParams = Partial<Pick<FetchElectionsParametersWithPagination, 'limit'>> & {
  page?: number
  status?: FetchElectionsParameters['status']
}

type SetupChecklistItem = {
  id: SetupStepId
  label: string
  to?: string
  icon: IconType
  completed?: boolean
  type?: CheckboxTypes
}

export type Role = {
  role: string
  name: string
  organizationWritePermission: boolean
  processWritePermission: boolean
}

type OrganizationType = {
  name: string
  type: string
}

type InviteData = {
  email: string
  role: string
}

export const paginatedElectionsQuery = (
  account: AccountData,
  client: VocdoniSDKClient,
  params: PaginatedElectionsParams
) => ({
  enabled: !!account?.address,
  queryKey: QueryKeys.organization.elections(account?.address, params),
  queryFn: async () =>
    client.fetchElections({
      organizationId: account?.address,
      page: params.page ? Number(params.page) - 1 : 0,
      status: params.status?.toUpperCase() as FetchElectionsParameters['status'],
      limit: params.limit,
    }),
})

export const useOrganizationMeta = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()
  const address = organization?.address
  const hasOrganization = Boolean(address)

  const query = useQuery<OrganizationMeta>({
    queryKey: QueryKeys.organization.meta(organization?.address),
    enabled: hasOrganization,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const response = await bearedFetch<OrganizationMetaResponse>(
        ApiEndpoints.OrganizationMeta.replace('{address}', enforceHexPrefix(organization.address))
      )
      return response.meta
    },
  })

  const updateMeta = useMutation<void, Error, Partial<OrganizationMeta>>({
    mutationFn: async (partialMeta: Partial<OrganizationMeta>) => {
      const newMeta = {
        ...query.data,
        ...partialMeta,
      }
      await bearedFetch<OrganizationMetaResponse>(
        ApiEndpoints.OrganizationMeta.replace('{address}', enforceHexPrefix(organization.address)),
        {
          method: 'PUT',
          body: { meta: newMeta },
        }
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.organization.meta(organization?.address),
      })
    },
  })

  const deleteMeta = useMutation<void, Error, string[]>({
    mutationFn: async (keys: string[]) => {
      await bearedFetch(ApiEndpoints.OrganizationMeta.replace('{address}', enforceHexPrefix(organization.address)), {
        method: 'DELETE',
        body: {
          keys,
        },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.organization.meta(enforceHexPrefix(organization.address)),
      })
    },
  })

  return {
    meta: query.data,
    metaIsLoading: query.isLoading,
    metaIsError: query.isError,
    hasOrganization,
    // Update meta
    updateMeta: updateMeta.mutate,
    updateMetaAsync: updateMeta.mutateAsync,
    updateMetaIsLoading: updateMeta.isPending,
    // Delete meta
    deleteMeta: deleteMeta.mutate,
    deleteMetaAsync: deleteMeta.mutateAsync,
    deleteMetaIsLoading: deleteMeta.isPending,
  }
}

export const useTutorials = () => {
  const { meta, metaIsLoading, metaIsError, hasOrganization, updateMeta, deleteMeta } = useOrganizationMeta()

  const canUseMeta = hasOrganization && !metaIsLoading && !metaIsError && Boolean(meta)
  const shouldDefaultToClosed = !hasOrganization || metaIsLoading || metaIsError || !meta

  const isSidebarTutorialClosed = meta?.[OrganizationMetaKeys.sidebarTutorial] ?? shouldDefaultToClosed
  const isDashboardTutorialClosed = meta?.[OrganizationMetaKeys.dashboardTutorial] ?? shouldDefaultToClosed

  const closeSidebarTutorial = () => {
    if (!canUseMeta) return
    updateMeta({ [OrganizationMetaKeys.sidebarTutorial]: true })
  }

  const closeDashboardTutorial = () => {
    if (!canUseMeta) return
    updateMeta({ [OrganizationMetaKeys.dashboardTutorial]: true })
  }

  const resetTutorials = () => {
    if (!canUseMeta) return
    deleteMeta([OrganizationMetaKeys.sidebarTutorial, OrganizationMetaKeys.dashboardTutorial])
  }

  return {
    isLoading: metaIsLoading,
    isError: metaIsError,
    isSidebarTutorialClosed,
    isDashboardTutorialClosed,
    closeSidebarTutorial,
    closeDashboardTutorial,
    resetTutorials,
    canUseMeta,
  }
}

export const useOrganizationSetup = () => {
  const { t } = useTranslation()
  const { meta, hasOrganization, updateMeta, updateMetaAsync } = useOrganizationMeta()
  const completedSteps: OrganizationSteps = meta?.[OrganizationMetaKeys.completedSteps] || []

  const hasStepDone = (stepId: SetupStepId): boolean => completedSteps.includes(stepId)

  const setStepDone = (stepId: SetupStepId) => {
    if (hasStepDone(stepId)) return
    updateMeta({ completedSteps: [...new Set([...completedSteps, stepId])] })
  }

  const setStepDoneAsync = async (stepId: SetupStepId) => {
    if (hasStepDone(stepId)) return
    await updateMetaAsync({ completedSteps: [...new Set([...completedSteps, stepId])] })
  }

  const unsetStepDone = (stepId: SetupStepId) => {
    const updated = completedSteps.filter((id) => id !== stepId)
    updateMeta({ completedSteps: updated })
  }

  const unsetStepDoneAsync = async (stepId: SetupStepId) => {
    const updated = completedSteps.filter((id) => id !== stepId)
    await updateMetaAsync({ completedSteps: updated })
  }

  const rawChecklist: SetupChecklistItem[] = [
    {
      id: SetupStepIds.organizationDetails,
      label: t('organization_setup.setup_steps.organization_details', {
        defaultValue: 'Set up your organization details',
      }),
      to: Routes.dashboard.settings.organization,
      type: CheckboxTypes.route,
      icon: LuUsers,
    },
    {
      id: SetupStepIds.memberbaseUpload,
      label: t('organization_setup.setup_steps.memberbase_upload', { defaultValue: 'Upload your memberbase' }),
      to: generatePath(Routes.dashboard.memberbase.members, { page: 1 }),
      type: CheckboxTypes.route,
      icon: LuFileSpreadsheet,
    },
    {
      id: SetupStepIds.firstVoteCreation,
      label: t('organization_setup.setup_steps.first_vote_creation', { defaultValue: 'Create your first vote' }),
      to: generatePath(Routes.processes.create),
      type: CheckboxTypes.route,
      icon: LuVote,
    },
    {
      id: SetupStepIds.expertCallBooking,
      label: t('organization_setup.setup_steps.expert_call_booking', {
        defaultValue: 'Book a free call with our experts',
      }),
      type: CheckboxTypes.modal,
      icon: LuCalendar,
    },
  ]

  const checklist = rawChecklist.map((item) => ({ ...item, completed: hasStepDone(item.id) }))
  const progress = checklist.length ? (checklist.filter((item) => item.completed).length / checklist.length) * 100 : 0
  const allStepsDone = checklist.every((item) => item.completed)
  const isStepsAccordionOpen = !allStepsDone && hasOrganization

  return {
    checklist,
    progress,
    completedSteps,
    isStepsAccordionOpen,
    hasStepDone,
    setStepDone,
    setStepDoneAsync,
    unsetStepDone,
    unsetStepDoneAsync,
  }
}

export const useRoles = () => {
  const { bearedFetch } = useAuth()

  return useQuery({
    queryKey: QueryKeys.organization.roles,
    queryFn: async () => {
      const response = await bearedFetch<{ roles: Role[] }>(ApiEndpoints.OrganizationsRoles)
      return response.roles
    },
    staleTime: 60 * 60 * 1000,
    select: (data) => data.sort((a, b) => a.name.localeCompare(b.name)),
  })
}

export const useOrganizationTypes = () => {
  const { bearedFetch } = useAuth()

  return useQuery({
    queryKey: QueryKeys.organization.types,
    queryFn: async () => {
      const response = await bearedFetch<{ types: OrganizationType[] }>(ApiEndpoints.OrganizationsTypes)
      return response.types
    },
    staleTime: 60 * 60 * 1000,
    select: (data) => data.sort((a, b) => a.name.localeCompare(b.name)),
  })
}

export const useInviteMemberMutation = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (body: InviteData) =>
      await bearedFetch(ApiEndpoints.OrganizationUsers.replace('{address}', ensure0x(organization.address)), {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      // Invalidate queries to refresh member and pending member lists
      queryClient.invalidateQueries({ queryKey: QueryKeys.organization.users() })
    },
  })
}

export const useRemoveUserMutation = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) =>
      await bearedFetch(
        ApiEndpoints.OrganizationUser.replace('{address}', ensure0x(organization.address)).replace(
          '{userId}',
          String(id)
        ),
        { method: 'DELETE' }
      ),
    onSuccess: () => {
      // Invalidate queries to refresh member and pending member lists
      queryClient.invalidateQueries({ queryKey: QueryKeys.organization.users() })
    },
  })
}

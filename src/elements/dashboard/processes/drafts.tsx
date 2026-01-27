import {
  Box,
  HStack,
  Icon,
  IconButton,
  Link,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
  ProgressRange,
  ProgressRoot,
  ProgressTrack,
  TableBody,
  TableCell,
  TableColumnHeader,
  TableHeader,
  TableRoot,
  TableRow,
  TableScrollArea,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { RoutedPaginationProvider, useClient, useOrganization } from '@vocdoni/react-providers'
import { ensure0x } from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'
import { LuCopy, LuEllipsisVertical, LuPencil, LuTrash } from 'react-icons/lu'
import { createSearchParams, generatePath, Link as RouterLink, useNavigate } from 'react-router-dom'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { useCreateProcess } from '~components/Process/Create'
import { Process } from '~components/Process/Create/common'
import { ListStateAlert } from '~components/shared/Feedback/ListStateAlert'
import RoutedPaginatedTableFooter from '~components/shared/Pagination/PaginatedTableFooter'
import { useToast } from '~shared/Toast'
import { QueryKeys } from '~queries/keys'
import { useUrlPagination } from '~queries/members'
import { Routes } from '~routes'

type Draft = {
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

const useDrafts = () => {
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

const DraftsTable = ({ drafts }: { drafts: Draft[] }) => {
  const { t } = useTranslation()

  return (
    <Box border='1px solid' borderColor='table.border' borderRadius='sm' w='full'>
      <TableScrollArea>
        <TableRoot>
          <TableHeader>
            <TableRow>
              <TableColumnHeader>{t('process_list.title', { defaultValue: 'Title' })}</TableColumnHeader>
              <TableColumnHeader>{t('process_list.start_date', { defaultValue: 'Start date' })}</TableColumnHeader>
              <TableColumnHeader>{t('process_list.end_date', { defaultValue: 'End date' })}</TableColumnHeader>
              <TableColumnHeader>{t('process_list.type', { defaultValue: 'Type' })}</TableColumnHeader>
              <TableColumnHeader>&nbsp;</TableColumnHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drafts.map((draft) => (
              <DraftsRow key={draft.id} draft={draft} />
            ))}
          </TableBody>
        </TableRoot>
      </TableScrollArea>
      <Box p={4}>
        <RoutedPaginatedTableFooter />
      </Box>
    </Box>
  )
}

const DraftsRow = ({ draft }: { draft: Draft }) => {
  const { t } = useTranslation()
  return (
    <TableRow key={draft.id} position='relative'>
      <TableCell>
        <Link asChild _hover={{ textDecoration: 'underline' }} fontWeight='medium'>
          <RouterLink
            to={{
              pathname: generatePath(Routes.processes.create),
              search: createSearchParams({ draftId: draft.id }).toString(),
            }}
          >
            {draft.metadata?.title || t('drafts.not_defined', { defaultValue: 'Not defined yet' })}
          </RouterLink>
        </Link>
      </TableCell>
      <TableCell>{draft.metadata?.startDate || t('drafts.not_defined', { defaultValue: 'Not defined yet' })}</TableCell>
      <TableCell>{draft.metadata?.endDate || t('drafts.not_defined', { defaultValue: 'Not defined yet' })}</TableCell>
      <TableCell>
        {draft.metadata?.questionType || t('drafts.not_defined', { defaultValue: 'Not defined yet' })}
      </TableCell>
      <TableCell textAlign='end'>
        <DraftsContextMenu draft={draft} />
      </TableCell>
    </TableRow>
  )
}

export const DraftsContextMenu = ({ draft }: { draft: Draft }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const toast = useToast()
  const deleteDraftMutation = useDeleteDraft()
  const createProcess = useCreateProcess()
  const { account } = useClient()
  const navigate = useNavigate()

  const cloneDraft = async () => {
    try {
      const clonedDraftId = await createProcess.mutateAsync({
        metadata: draft.metadata,
        orgAddress: ensure0x(account?.address),
      })
      toast({
        title: t('drafts.cloned_draft', {
          defaultValue: 'Draft cloned successfully',
        }),
        type: 'success',
        duration: 3000,
        closable: true,
      })
      queryClient.invalidateQueries({
        queryKey: QueryKeys.organization.drafts(account?.address),
        exact: false,
      })
      navigate(
        {
          pathname: generatePath(Routes.processes.create, { page: 1 }),
          search: createSearchParams({ draftId: clonedDraftId }).toString(),
        },
        { replace: true }
      )
    } catch (error) {
      toast({
        title: t('drafts.cloned_draft_error', {
          defaultValue: 'Error cloning draft',
        }),
        type: 'error',
        duration: 3000,
        closable: true,
      })
    }
  }

  const deleteDraft = () => {
    deleteDraftMutation.mutate({ draftId: draft.id })
    localStorage.removeItem('draft-id')
  }

  return (
    <MenuRoot>
      <MenuTrigger asChild>
        <IconButton
          aria-label={t('drafts.actions', { defaultValue: 'Draft actions' })}
          loading={deleteDraftMutation.isPending}
          variant='ghost'
          size='sm'
        >
          <Icon as={LuEllipsisVertical} />
        </IconButton>
      </MenuTrigger>
      <MenuPositioner>
        <MenuContent>
          <MenuItem value='edit' asChild>
            <RouterLink
              to={{
                pathname: generatePath(Routes.processes.create),
                search: createSearchParams({ draftId: draft.id }).toString(),
              }}
            >
              <HStack gap={2} align='center'>
                <Icon as={LuPencil} boxSize={4} />
                <span>{t('drafts.edit', { defaultValue: 'Edit Draft' })}</span>
              </HStack>
            </RouterLink>
          </MenuItem>
          <MenuItem value='clone' onClick={cloneDraft}>
            <HStack gap={2} align='center'>
              <Icon as={LuCopy} boxSize={4} />
              <span>{t('drafts.clone', { defaultValue: 'Clone Draft' })}</span>
            </HStack>
          </MenuItem>
          <MenuSeparator />
          <MenuItem value='delete' color='red.400' onClick={deleteDraft}>
            <HStack gap={2} align='center'>
              <Icon as={LuTrash} boxSize={4} />
              <span>{t('drafts.delete', { defaultValue: 'Delete Draft' })}</span>
            </HStack>
          </MenuItem>
        </MenuContent>
      </MenuPositioner>
    </MenuRoot>
  )
}

const Drafts = () => {
  const { t } = useTranslation()
  const { data, isLoading, error } = useDrafts()
  const hasError = !!error && !isLoading
  const isEmpty = (data?.processes?.length ?? 0) === 0 && !isLoading && !hasError
  const showAlert = hasError || isEmpty
  const alertTitle = hasError
    ? t('drafts.load_error', { defaultValue: 'Unable to load drafts' })
    : t('drafts.empty', { defaultValue: 'No drafts found' })
  const alertDescription = hasError
    ? error instanceof Error
      ? error.message
      : t('drafts.load_error_description', { defaultValue: 'Please try again.' })
    : t('drafts.empty_description', { defaultValue: 'Create a draft to get started.' })

  const pagination = data?.pagination || {
    totalItems: 0,
    currentPage: 0,
    lastPage: 0,
    previousPage: null,
    nextPage: null,
  }

  if (isLoading) {
    return (
      <ProgressRoot size='xs' value={null} colorPalette='gray'>
        <ProgressTrack>
          <ProgressRange />
        </ProgressTrack>
      </ProgressRoot>
    )
  }

  return (
    <RoutedPaginationProvider initialPage={1} path={Routes.dashboard.processes.drafts} pagination={pagination}>
      {showAlert && (
        <ListStateAlert show status={hasError ? 'error' : 'info'} title={alertTitle} description={alertDescription} />
      )}
      <DraftsTable drafts={data?.processes ?? []} />
    </RoutedPaginationProvider>
  )
}

export default Drafts

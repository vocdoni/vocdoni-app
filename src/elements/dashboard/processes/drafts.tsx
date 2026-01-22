import {
  Box,
  Icon,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Portal,
  Progress,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
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
          status: 'success',
          duration: 3000,
          isClosable: true,
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
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>{t('process_list.title', { defaultValue: 'Title' })}</Th>
              <Th>{t('process_list.start_date', { defaultValue: 'Start date' })}</Th>
              <Th>{t('process_list.end_date', { defaultValue: 'End date' })}</Th>
              <Th>{t('process_list.type', { defaultValue: 'Type' })}</Th>
              <Th>&nbsp;</Th>
            </Tr>
          </Thead>
          <Tbody>
            {drafts.map((draft) => (
              <DraftsRow key={draft.id} draft={draft} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <Box p={4}>
        <RoutedPaginatedTableFooter />
      </Box>
    </Box>
  )
}

const DraftsRow = ({ draft }: { draft: Draft }) => {
  const { t } = useTranslation()
  return (
    <Tr key={draft.id} position='relative'>
      <Td>
        <Link
          as={RouterLink}
          to={{
            pathname: generatePath(Routes.processes.create),
            search: createSearchParams({ draftId: draft.id }).toString(),
          }}
          _hover={{ textDecoration: 'underline' }}
          fontWeight='medium'
        >
          {draft.metadata?.title || t('drafts.not_defined', { defaultValue: 'Not defined yet' })}
        </Link>
      </Td>
      <Td>{draft.metadata?.startDate || t('drafts.not_defined', { defaultValue: 'Not defined yet' })}</Td>
      <Td>{draft.metadata?.endDate || t('drafts.not_defined', { defaultValue: 'Not defined yet' })}</Td>
      <Td>{draft.metadata?.questionType || t('drafts.not_defined', { defaultValue: 'Not defined yet' })}</Td>
      <Td isNumeric>
        <DraftsContextMenu draft={draft} />
      </Td>
    </Tr>
  )
}

const DraftsContextMenu = ({ draft }: { draft: Draft }) => {
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
        status: 'success',
        duration: 3000,
        isClosable: true,
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
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const deleteDraft = () => {
    deleteDraftMutation.mutate({ draftId: draft.id })
    localStorage.removeItem('draft-id')
  }

  return (
    <Menu>
      <MenuButton
        as={IconButton}
        isLoading={deleteDraftMutation.isPending}
        shouldWrapChildren
        icon={<Icon as={LuEllipsisVertical} />}
        variant='ghost'
        size='sm'
      />
      <Portal>
        <MenuList>
          <MenuItem
            as={RouterLink}
            to={{
              pathname: generatePath(Routes.processes.create),
              search: createSearchParams({ draftId: draft.id }).toString(),
            }}
            icon={<Icon as={LuPencil} boxSize={4} />}
          >
            {t('drafts.edit', { defaultValue: 'Edit Draft' })}
          </MenuItem>
          <MenuItem onClick={cloneDraft} icon={<Icon as={LuCopy} boxSize={4} />}>
            {t('drafts.clone', { defaultValue: 'Clone Draft' })}
          </MenuItem>
          <MenuDivider />
          <MenuItem color='red.400' onClick={deleteDraft} icon={<Icon as={LuTrash} boxSize={4} />}>
            {t('drafts.delete', { defaultValue: 'Delete Draft' })}
          </MenuItem>
        </MenuList>
      </Portal>
    </Menu>
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

  if (isLoading) return <Progress size='xs' isIndeterminate colorScheme='gray' />

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

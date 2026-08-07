import {
  Card,
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
  Portal,
  Progress,
  Stack,
  Table,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useOrganization } from '@vocdoni/react-components'
import { RoutedPaginationProvider } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { LuCopy, LuEllipsisVertical, LuPencil, LuTrash } from 'react-icons/lu'
import { createSearchParams, generatePath, Link as RouterLink, useNavigate } from 'react-router-dom'
import { useAuth } from '~components/Auth/useAuth'
import { ListStateAlert } from '~components/Feedback/ListStateAlert'
import RoutedPaginatedTableFooter from '~components/Pagination/PaginatedTableFooter'
import { useCreateProcess } from '~components/Process/Create'
import { Process, SelectorTypes } from '~components/Process/Create/common'
import { votingProcessToCreateRequest, votingProcessToForm } from '~components/Process/Create/draft-mapping'
import { clearStoredDraftId } from '~components/Process/Create/draft-storage'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { useToast } from '~components/Toast'
import { QueryKeys } from '~queries/keys'
import { useUrlPagination } from '~queries/members'
import { Routes } from '~routes'

type Draft = VotingProcessResponse

const useDrafts = () => {
  const { client } = useApiClient()
  const { organization } = useOrganization()
  const { page, limit } = useUrlPagination()

  return useQuery({
    queryKey: [...QueryKeys.organization.drafts(organization?.address), page, limit],
    enabled: !!organization?.address,
    // `published: false` is the drafts-only view; it requires a Manager/Admin
    // session (401 otherwise) and must not be combined with a status filter,
    // which never matches a draft's not-yet-on-chain questions.
    queryFn: () =>
      client.elections.list({
        orgAddress: organization!.address,
        published: false,
        page,
        limit,
      }),
  })
}

export const useDeleteDraft = () => {
  const { t } = useTranslation()
  const { client } = useApiClient()
  const { organization } = useOrganization()
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<void, unknown, { draftId: string; silent?: boolean }>({
    mutationKey: QueryKeys.organization.drafts(organization?.address),
    mutationFn: ({ draftId }: { draftId: string; silent?: boolean }) => client.elections.delete(draftId),
    onSuccess: (_data, variables) => {
      // Only forget the resumable draft pointer once the server actually deleted
      // it, and only when it points at this draft
      clearStoredDraftId(organization?.address, variables.draftId)
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

export const DraftsTable = ({ drafts }: { drafts: Draft[] }) => {
  const { t } = useTranslation()
  const isMobile = useBreakpointValue({ base: true, md: false })

  if (isMobile) {
    return (
      <Stack gap={3} w='full'>
        {drafts.map((draft) => (
          <DraftCard key={draft.id} draft={draft} />
        ))}
        <RoutedPaginatedTableFooter />
      </Stack>
    )
  }

  return (
    <Table.ScrollArea border='1px solid' borderColor='table.border' borderRadius='sm'>
      <Table.Root variant='outline'>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>{t('process_list.title', { defaultValue: 'Title' })}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('process_list.start_date', { defaultValue: 'Start date' })}</Table.ColumnHeader>
            <Table.ColumnHeader>{t('process_list.end_date', { defaultValue: 'End date' })}</Table.ColumnHeader>
            <Table.ColumnHeader colSpan={2}>{t('process_list.type', { defaultValue: 'Type' })}</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {drafts.map((draft) => (
            <DraftsRow key={draft.id} draft={draft} />
          ))}
        </Table.Body>
        <Table.Caption>
          <RoutedPaginatedTableFooter />
        </Table.Caption>
      </Table.Root>
    </Table.ScrollArea>
  )
}

/** A process can mix question types, so the list reports the shared one, or "Mixed". */
const useQuestionTypeLabel = () => {
  const { t } = useTranslation()

  return (questions: Process['questions']) => {
    const types = new Set(questions.map((question) => question.type))

    if (types.size > 1) return t('drafts.question_type.mixed', { defaultValue: 'Mixed' })
    if (types.has(SelectorTypes.Multiple))
      return t('process.question_type.multiple', { defaultValue: 'Multiple choice' })

    return t('process.question_type.single', { defaultValue: 'Single choice' })
  }
}

const DraftsRow = ({ draft }: { draft: Draft }) => {
  const { t } = useTranslation()
  const questionTypeLabel = useQuestionTypeLabel()
  const metadata = votingProcessToForm(draft)

  return (
    <Table.Row key={draft.id} position='relative'>
      <Table.Cell>
        <Link asChild _hover={{ textDecoration: 'underline' }} fontWeight='medium'>
          <RouterLink
            to={{
              pathname: generatePath(Routes.processes.create),
              search: createSearchParams({ draftId: draft.id }).toString(),
            }}
          >
            {metadata.title || t('drafts.not_defined', { defaultValue: 'Not defined yet' })}
          </RouterLink>
        </Link>
      </Table.Cell>
      <Table.Cell>{metadata.startDate || t('drafts.not_defined', { defaultValue: 'Not defined yet' })}</Table.Cell>
      <Table.Cell>{metadata.endDate || t('drafts.not_defined', { defaultValue: 'Not defined yet' })}</Table.Cell>
      <Table.Cell>{questionTypeLabel(metadata.questions)}</Table.Cell>
      <Table.Cell textAlign='end'>
        <DraftsContextMenu draft={draft} />
      </Table.Cell>
    </Table.Row>
  )
}

const DraftCard = ({ draft }: { draft: Draft }) => {
  const { t } = useTranslation()
  const questionTypeLabel = useQuestionTypeLabel()
  const notDefined = t('drafts.not_defined', { defaultValue: 'Not defined yet' })
  const metadata = votingProcessToForm(draft)

  return (
    <Card.Root variant='data-list-item'>
      <Card.Header>
        <Link asChild _hover={{ textDecoration: 'underline' }} fontWeight='medium'>
          <RouterLink
            to={{
              pathname: generatePath(Routes.processes.create),
              search: createSearchParams({ draftId: draft.id }).toString(),
            }}
          >
            <Text lineClamp={2}>{metadata.title || notDefined}</Text>
          </RouterLink>
        </Link>
        <DraftsContextMenu draft={draft} />
      </Card.Header>
      <Card.Body>
        <Text>
          {t('process_list.start_date', { defaultValue: 'Start date' })}: {metadata.startDate || notDefined}
        </Text>
        <Text>
          {t('process_list.end_date', { defaultValue: 'End date' })}: {metadata.endDate || notDefined}
        </Text>
        <Text>
          {t('process_list.type', { defaultValue: 'Type' })}: {questionTypeLabel(metadata.questions)}
        </Text>
      </Card.Body>
    </Card.Root>
  )
}

export const DraftsContextMenu = ({ draft }: { draft: Draft }) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const toast = useToast()
  const deleteDraftMutation = useDeleteDraft()
  const createProcess = useCreateProcess()
  const { currentAddress } = useAuth()
  const navigate = useNavigate()

  const cloneDraft = async () => {
    try {
      const clonedDraftId = await createProcess.mutateAsync(votingProcessToCreateRequest(draft, currentAddress))
      toast({
        title: t('drafts.cloned_draft', {
          defaultValue: 'Draft cloned successfully',
        }),
        type: 'success',
        duration: 3000,
        closable: true,
      })
      queryClient.invalidateQueries({
        queryKey: QueryKeys.organization.drafts(currentAddress),
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
      <Portal>
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
            <MenuItem value='delete' color='fg.error' onClick={deleteDraft}>
              <HStack gap={2} align='center'>
                <Icon as={LuTrash} boxSize={4} />
                <span>{t('drafts.delete', { defaultValue: 'Delete Draft' })}</span>
              </HStack>
            </MenuItem>
          </MenuContent>
        </MenuPositioner>
      </Portal>
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
      <Progress.Root size='xs' value={null} colorPalette='gray'>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    )
  }

  return (
    <RoutedPaginationProvider path={Routes.dashboard.processes.drafts} pagination={pagination}>
      {showAlert && (
        <ListStateAlert show status={hasError ? 'error' : 'info'} title={alertTitle} description={alertDescription} />
      )}
      <DraftsTable drafts={data?.processes ?? []} />
    </RoutedPaginationProvider>
  )
}

export default Drafts

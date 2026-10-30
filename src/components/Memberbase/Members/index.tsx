import {
  Box,
  Button,
  type ButtonProps,
  Card,
  Checkbox,
  type DialogRootProps,
  Flex,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Menu,
  Stack,
  Switch,
  Table,
  Tag,
  Text,
  useDisclosure,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getElectionTitle, useOrganization, useRoutedPagination } from '@vocdoni/react-components'
import { computeProcessStatus } from '@vocdoni/api-client'
import type { QuestionStatus } from '@vocdoni/api-types'
import { EmptyState } from '~components/ui/EmptyState'
import { ListLoader } from '~components/ui/Loader'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { useAuth } from '~components/Auth/useAuth'
import { useId, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import {
  AddIcon,
  AddToListIcon,
  AddUserIcon,
  DeleteIcon,
  MoreIcon,
  SearchIcon,
  SettingsIcon,
  UsersIcon,
} from '~theme/icons'
import { generatePath, useNavigate, useOutletContext } from 'react-router'
import InputBasic from '~components/Form/InputBasic'
import { Select } from '~components/Form/Select'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { PanelDrawer } from '~components/ui/Drawer'
import RoutedPaginatedTableFooter from '~components/Pagination/PaginatedTableFooter'
import { useToast } from '~components/Toast'
import { Routes } from '~routes'
import { useAddCensusParticipants } from '~src/queries/census'
import { useCreateGroup, useGroups, useUpdateGroup } from '~src/queries/groups'
import { QueryKeys } from '~src/queries/keys'
import { Member, useDeleteMembers, usePaginatedMembers, useUrlPagination } from '~src/queries/members'
import { paginatedElectionsQuery } from '~src/queries/organization'
import { statusPalette } from '~theme/status'
import { useTableAsCards } from '~components/ui/useTableAsCards'
import { MemberbaseTabsContext } from '..'
import { useTable } from '../TableProvider'
import { ImportMembers, ImportProgress } from './Import'
import { MemberManager } from './Manager'
import { maskIfNeeded } from './maskIfNeeded'
import MemberCard from './MemberCard'

enum DeleteModes {
  SELECTED = 'selected',
  ALL = 'all',
}

type MemberActionsProps = {
  member: Member
  onDelete: () => void
  onAddToGroup: () => void
  onAddToCensus: () => void
}

type MemberBulkActionsProps = {
  onDelete: () => void
  onAddToGroup: () => void
  onAddToCensus: () => void
}

type DeleteMemberModalProps = {
  isOpen: boolean
  onClose: () => void
  mode: DeleteModes
} & Omit<DialogRootProps, 'children'>

type CreateGroupButtonProps = {
  members?: Member[]
  total?: number
} & ButtonProps

type MembersListProps = {
  openDeleteSelected: (member: Member) => void
  onAddToGroup: (member: Member) => void
  onAddToCensus: (member: Member) => void
}

type AddMembersToGroupDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

type AddMembersToCensusDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

type MemberFiltersProps = {
  onDelete: () => void
}

type MemberTableItemProps = {
  member: Member
  openDeleteSelected: () => void
  onAddToGroup: () => void
  onAddToCensus: () => void
}

const AddMembersToGroupDrawer = ({ isOpen, onClose }: AddMembersToGroupDrawerProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { data: allGroups } = useGroups()
  const data = (allGroups ?? []).filter((g) => !g.isAutoGroup)
  const [selectedGroup, setSelectedGroup] = useState<{ id: string; title: string } | null>(null)
  const addMemberToGroup = useUpdateGroup()
  const { selectedRows, resetSelectedRows } = useTable()

  const handleAddToGroup = () => {
    addMemberToGroup.mutate(
      { groupId: selectedGroup.id, body: { addMembers: selectedRows.map((row) => row.id) } },
      {
        onSuccess: () => {
          toast({
            title: t('members.table.add_to_group_success', { defaultValue: 'Members added to group successfully' }),
            type: 'success',
            duration: 3000,
            isClosable: true,
          })
          resetSelectedRows()
          onClose()
        },
      }
    )
  }

  return (
    <PanelDrawer
      open={isOpen}
      placement='end'
      onOpenChange={({ open }) => (!open ? onClose() : undefined)}
      size='sm'
      title={t('members.table.add_to_group', { defaultValue: 'Add to Group' })}
      description={t('members.table.add_to_group_description', {
        defaultValue: 'Select a group to add the members to.',
      })}
      bodyProps={{ display: 'flex', flexDirection: 'column', gap: '4' }}
    >
      <Select
        placeholder={t('members.table.select_group', { defaultValue: 'Select group' })}
        options={data}
        getOptionLabel={(option) => (
          <Flex align='center' gap='2'>
            {option.title}
            <Box fontSize='sm' color='fg.muted'>
              <Icon as={UsersIcon} />
              {option.membersCount}
            </Box>
          </Flex>
        )}
        getOptionValue={(option) => option.id}
        value={selectedGroup}
        onChange={(option) => setSelectedGroup(option)}
      />

      {selectedGroup && (
        <Text textStyle='body-sm' color='fg.muted'>
          {t('members.table.add_to_group_confirmation', {
            defaultValue: 'You will add {{count}} members to the "{{group}}" group.',
            count: selectedRows.length,
            group: selectedGroup.title,
          })}
        </Text>
      )}

      <Button onClick={handleAddToGroup} mt='2' width='full' disabled={!selectedGroup || selectedRows.length === 0}>
        {t('members.table.add_to_group_button', {
          defaultValue: 'Add {{count}} member',
          count: selectedRows.length,
        })}
      </Button>
    </PanelDrawer>
  )
}

const ACTIVE_PROCESS_STATUSES: QuestionStatus[] = ['ONGOING', 'UPCOMING', 'PAUSED']

const AddMembersToCensusDrawer = ({ isOpen, onClose }: AddMembersToCensusDrawerProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { client } = useApiClient()
  const { currentAddress } = useAuth()
  const [selectedProcess, setSelectedProcess] = useState<{ id: string; title: string } | null>(null)
  const { selectedRows, resetSelectedRows } = useTable()
  const addCensusParticipants = useAddCensusParticipants()

  const electionsQuery = paginatedElectionsQuery(currentAddress, client, { limit: 100 })
  const { data: elections, isLoading: isLoadingElections } = useQuery({
    ...electionsQuery,
    enabled: electionsQuery.enabled && isOpen,
  })

  const processes = (elections?.processes ?? [])
    .filter((election) => ACTIVE_PROCESS_STATUSES.includes(computeProcessStatus(election.questions)))
    .map((election) => ({ id: election.id, title: getElectionTitle(election) || election.id }))

  const handleClose = () => {
    setSelectedProcess(null)
    onClose()
  }

  const handleAddToCensus = () => {
    if (!selectedProcess) return

    addCensusParticipants.mutate(
      { processId: selectedProcess.id, memberIds: selectedRows.map((row) => row.id) },
      {
        onSuccess: (response) => {
          toast({
            title: t('members.table.add_to_census_success', {
              defaultValue: '{{count}} member added to the census',
              defaultValue_other: '{{count}} members added to the census',
              count: response.added,
            }),
            description: response.errors?.length
              ? t('members.table.add_to_census_partial', {
                  defaultValue: 'Some members could not be added.',
                })
              : undefined,
            type: 'success',
            duration: 3000,
            isClosable: true,
          })
          resetSelectedRows()
          handleClose()
        },
        onError: (error: Error) => {
          toast({
            title: t('members.table.add_to_census_error', { defaultValue: 'Error adding members to the census' }),
            description: error.message,
            type: 'error',
            duration: 3000,
            isClosable: true,
          })
        },
      }
    )
  }

  return (
    <PanelDrawer
      open={isOpen}
      placement='end'
      onOpenChange={({ open }) => (!open ? handleClose() : undefined)}
      size='sm'
      title={t('members.table.add_to_census', { defaultValue: 'Add to census' })}
      description={t('members.table.add_to_census_description', {
        defaultValue: 'Select an active voting process to add the members to its census.',
      })}
      bodyProps={{ display: 'flex', flexDirection: 'column', gap: '4' }}
    >
      <Select
        placeholder={t('members.table.select_process', { defaultValue: 'Select process' })}
        options={processes}
        isLoading={isLoadingElections}
        noOptionsMessage={() => t('members.table.no_active_processes', { defaultValue: 'No active processes found' })}
        getOptionLabel={(option) => option.title}
        getOptionValue={(option) => option.id}
        value={selectedProcess}
        onChange={(option) => setSelectedProcess(option)}
      />

      {selectedProcess && (
        <Text textStyle='body-sm' color='fg.muted'>
          {t('members.table.add_to_census_confirmation', {
            defaultValue: 'You will add {{count}} member to the "{{process}}" process census.',
            defaultValue_other: 'You will add {{count}} members to the "{{process}}" process census.',
            count: selectedRows.length,
            process: selectedProcess.title,
          })}
        </Text>
      )}

      <Button
        onClick={handleAddToCensus}
        mt='2'
        width='full'
        loading={addCensusParticipants.isPending}
        disabled={!selectedProcess || selectedRows.length === 0}
      >
        {t('members.table.add_to_census_button', {
          defaultValue: 'Add {{count}} member',
          count: selectedRows.length,
        })}
      </Button>
    </PanelDrawer>
  )
}

const MemberActions = ({ member, onDelete, onAddToGroup, onAddToCensus }: MemberActionsProps) => {
  const { t } = useTranslation()
  const { open: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()

  return (
    <>
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton variant='ghost' size='sm' aria-label={t('members.table.actions', { defaultValue: 'Actions' })}>
            <MoreIcon />
          </IconButton>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content minW='[120px]'>
            <Menu.Item value='edit' onSelect={() => onEditOpen()}>
              {t('members.table.edit', { defaultValue: 'Edit' })}
            </Menu.Item>
            <Menu.Item value='add-to-group' onSelect={onAddToGroup}>
              {t('members.table.add_to_group', { defaultValue: 'Add to Group' })}
            </Menu.Item>
            <Menu.Item value='add-to-census' onSelect={onAddToCensus}>
              {t('members.table.add_to_census', { defaultValue: 'Add to census' })}
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item value='delete' color='destructive.fg' onSelect={onDelete}>
              {t('members.table.delete', { defaultValue: 'Delete' })}
            </Menu.Item>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
      <MemberManager member={member} open={isEditOpen} onOpenChange={(open) => (open ? onEditOpen() : onEditClose())} />
    </>
  )
}

const ColumnManager = () => {
  const { t } = useTranslation()
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const { columns, setColumns } = useTable()

  const toggleColumn = (columnId: string, visible: boolean) => {
    const updatedColumns = columns.map((col) => (col.id === columnId ? { ...col, visible } : col))
    setColumns(updatedColumns)
  }

  return (
    <>
      <IconButton
        aria-label={t('members.table.manage_columns', { defaultValue: 'Manage Columns' })}
        variant='ghost'
        size='sm'
        onClick={onOpen}
      >
        <SettingsIcon />
      </IconButton>
      <PanelDrawer
        open={isOpen}
        placement='end'
        onOpenChange={({ open }) => (!open ? onClose() : undefined)}
        title={t('members.table.manage_columns', { defaultValue: 'Manage Columns' })}
        description={t('members.table.manage_columns_description', {
          defaultValue: 'Customize which columns are displayed in the members table.',
        })}
      >
        {/* The API never returns the password, so it has nothing to show; it stays in the column list because the member form, CSV mapper and template read their fields from it. */}
        {columns
          .filter((col) => col.id !== 'password')
          .map((col) => (
            <Flex key={col.id} justify='space-between' align='center' my='2'>
              <Text>{col.label}</Text>
              <Switch.Root
                checked={col.visible}
                onCheckedChange={({ checked }) => toggleColumn(col.id, checked === true)}
                aria-label={t('members.table.toggle_column', {
                  defaultValue: `Toggle column {{column}}`,
                  column: col.label,
                })}
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </Flex>
          ))}
      </PanelDrawer>
    </>
  )
}

const MemberFilters = ({ onDelete }: MemberFiltersProps) => {
  const { t } = useTranslation()
  const { search, setSearch, submitSearch } = useOutletContext<MemberbaseTabsContext>()
  const { data } = usePaginatedMembers({ showAll: true })

  const handleSearchChange = (e) => {
    setSearch(e.target.value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    submitSearch()
  }

  return (
    <Flex gap='2' flexDir={{ base: 'column', md: 'row' }}>
      <InputGroup
        maxW='[300px]'
        as='form'
        onSubmit={handleSubmit}
        endElement={
          <IconButton size='xs' variant='plain' aria-label='search' type='submit'>
            <Icon as={SearchIcon} />
          </IconButton>
        }
      >
        <Input
          placeholder={t('members.table.search', { defaultValue: 'Search members...' })}
          value={search}
          onChange={handleSearchChange}
        />
      </InputGroup>
      {data?.members?.length >= 1 && (
        <Button variant='outline' colorPalette={statusPalette.destructive} onClick={onDelete}>
          <Icon as={DeleteIcon} />
          {t('members.table.delete_all', {
            defaultValue: 'Delete (All)',
          })}
        </Button>
      )}
    </Flex>
  )
}

const CreateGroupButton = ({ children, members, total, ...rest }: CreateGroupButtonProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { open: isOpen, onOpen, onClose } = useDisclosure({ defaultOpen: false })
  const { selectedRows } = useTable()
  const navigate = useNavigate()
  const createGroupMutation = useCreateGroup()
  const formId = useId()
  const methods = useForm({
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const selectedMembers = members ?? selectedRows
  const visible = selectedMembers.slice(0, 5)
  const selectedCount = total ?? selectedMembers.length
  const remainingCount = selectedCount - visible.length

  const createGroup = (data) => {
    const memberIDs = selectedRows.map((row) => row.id)
    const group = {
      ...data,
      ...(memberIDs.length > 0 && { memberIDs }),
    }
    createGroupMutation.mutate(group, {
      onSuccess: () => {
        toast({
          title: t('members.table.create_group_success', {
            defaultValue: 'Group created successfully',
          }),
          type: 'success',
          duration: 3000,
          isClosable: true,
        })
        onClose()
        navigate(Routes.dashboard.memberbase.groups)
      },
      onError: (error: Error) => {
        toast({
          title: t('members.table.create_group_error', {
            defaultValue: 'Error creating group',
          }),
          description: error.message,
          type: 'error',
          duration: 3000,
          isClosable: true,
        })
      },
    })
  }

  const memberAlias = (member: Member) => {
    if (!member.name && !member.surname) return member.email || member.memberNumber
    return `${member.name} ${member.surname}`
  }

  return (
    <>
      <Button size='sm' variant='outline' onClick={onOpen} {...rest}>
        <Icon as={UsersIcon} />
        {children}
      </Button>
      <PanelDrawer
        open={isOpen}
        placement='end'
        onOpenChange={({ open }) => (!open ? onClose() : undefined)}
        size='sm'
        title={t('members.table.create_group_form_title', { defaultValue: 'Create New Group' })}
        description={t('members.table.create_group_form_description', {
          defaultValue:
            'Create a new group from selected members. This will organize them for future voting processes.',
        })}
        footer={
          <>
            <Button variant='outline' onClick={onClose}>
              {t('members.table.cancel', { defaultValue: 'Cancel' })}
            </Button>
            <Button disabled={!selectedCount} type='submit' form={formId}>
              {t('members.table.create_group', { defaultValue: 'Create group' })}
            </Button>
          </>
        }
      >
        <FormProvider {...methods}>
          <Box as='form' id={formId} onSubmit={methods.handleSubmit(createGroup)}>
            <Stack gap='4'>
              <InputBasic
                formValue='title'
                label={t('members.table.group_name', { defaultValue: 'Group name' })}
                required
              />
              <InputBasic
                formValue='description'
                label={t('members.table.group_description', { defaultValue: 'Description (Optional)' })}
                placeholder={t('members.table.group_description_placeholder', {
                  defaultValue: 'Enter a brief description of the group',
                })}
              />
              <Box>
                <Text mb='1'>{t('members.table.group_members', { defaultValue: 'Selected Members' })}</Text>
                <Box p='4'>
                  <Text textStyle='body-sm' mb='2'>
                    {t('members.table.group_members_count', {
                      defaultValue: '{{count}} members selected',
                      count: selectedCount,
                    })}
                  </Text>
                  <Wrap>
                    {visible.map((member) => (
                      <WrapItem key={member.id}>
                        <Tag.Root size='sm' variant='subtle' colorPalette='gray'>
                          <Tag.Label>{memberAlias(member)}</Tag.Label>
                        </Tag.Root>
                      </WrapItem>
                    ))}
                    {remainingCount > 0 && (
                      <WrapItem>
                        <Tag.Root size='sm' variant='outline' colorPalette='brand'>
                          <Tag.Label>
                            {t('members.table.remaining_members', {
                              defaultValue: '+{{count}} more',
                              count: remainingCount,
                            })}
                          </Tag.Label>
                        </Tag.Root>
                      </WrapItem>
                    )}
                  </Wrap>
                </Box>
              </Box>
            </Stack>
          </Box>
        </FormProvider>
      </PanelDrawer>
    </>
  )
}

const MemberBulkActions = ({ onDelete, onAddToGroup, onAddToCensus }: MemberBulkActionsProps) => {
  const { t } = useTranslation()
  const { selectedRows } = useTable()

  return (
    <Flex
      gap='4'
      align='center'
      minH='toolbar'
      flexDir={{ base: 'column', md: 'row' }}
      alignItems={{ base: 'stretch', md: 'center' }}
    >
      {selectedRows.length > 0 ? (
        <>
          <Text textStyle='body-sm' color='fg.muted'>
            <Trans
              i18nKey='members.table.selected'
              count={selectedRows.length}
              components={{ strong: <Text as='span' textStyle='body-sm' fontWeight='extrabold' display='inline' /> }}
              defaults='Selected: <strong>{{count}} member</strong>'
            />
          </Text>
          <CreateGroupButton>{t('members.table.create_group', { defaultValue: 'Create group' })}</CreateGroupButton>
          <Button size='sm' variant='outline' onClick={() => onAddToGroup()}>
            <Icon as={AddUserIcon} />
            {t('members.table.add_to_group', { defaultValue: 'Add to Group' })}
          </Button>
          <Button size='sm' variant='outline' onClick={() => onAddToCensus()}>
            <Icon as={AddToListIcon} />
            {t('members.table.add_to_census', { defaultValue: 'Add to census' })}
          </Button>
          <Button size='sm' colorPalette={statusPalette.destructive} variant='outline' onClick={() => onDelete()}>
            <Icon as={DeleteIcon} />
            {t('members.table.bulk_delete', { defaultValue: 'Delete' })}
          </Button>
        </>
      ) : (
        <Text textStyle='body-sm' color='fg.muted'>
          <Trans i18nKey='members.table.select_hint' defaults='Select members to perform bulk actions' />
        </Text>
      )}
    </Flex>
  )
}

const MembersList = ({ openDeleteSelected, onAddToGroup, onAddToCensus }: MembersListProps) => {
  const { data = [], isLoading, isFetching } = useTable()
  const isLoadingOrImporting = isLoading || isFetching
  const isEmpty = data.length === 0 && !isLoadingOrImporting
  return (
    <Table.Body>
      {isEmpty ? (
        <EmptyMembers />
      ) : (
        data.map((member) => (
          <MemberTableItem
            key={member.id}
            member={member}
            openDeleteSelected={() => openDeleteSelected(member)}
            onAddToGroup={() => onAddToGroup(member)}
            onAddToCensus={() => onAddToCensus(member)}
          />
        ))
      )}
    </Table.Body>
  )
}

const MembersCardList = ({ openDeleteSelected, onAddToGroup, onAddToCensus }: MembersListProps) => {
  const { data = [], isLoading, isFetching } = useTable()
  const isLoadingOrImporting = isLoading || isFetching
  const isEmpty = data.length === 0 && !isLoadingOrImporting

  if (isEmpty) return <EmptyMembersMessage />

  return (
    <Stack gap='3'>
      {data.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          actions={
            <MemberActions
              member={member}
              onDelete={() => openDeleteSelected(member)}
              onAddToGroup={() => onAddToGroup(member)}
              onAddToCensus={() => onAddToCensus(member)}
            />
          }
        />
      ))}
    </Stack>
  )
}

const EmptyMembersMessage = () => {
  const { t } = useTranslation()
  const { error } = useTable()
  const { debouncedSearch } = useOutletContext<MemberbaseTabsContext>()

  return (
    <EmptyState
      size='sm'
      height='[150px]'
      title={
        debouncedSearch
          ? t('members.table.no_filter_results', {
              defaultValue: 'No members matching these attributes',
            })
          : error
            ? error.message.toString()
            : t('members.table.no_results', {
                defaultValue: 'No members found',
              })
      }
      description={
        error
          ? undefined
          : debouncedSearch
            ? t('members.list.no_search_results_description', { defaultValue: 'Try adjusting your search terms.' })
            : t('members.list.empty_description', { defaultValue: 'Add your first member to get started.' })
      }
    />
  )
}

const EmptyMembers = () => {
  const { columns } = useTable()

  return (
    <Table.Row>
      <Table.Cell colSpan={columns.filter((c) => c.visible).length + 2}>
        <EmptyMembersMessage />
      </Table.Cell>
    </Table.Row>
  )
}

const MemberTableItem = ({ member, openDeleteSelected, onAddToGroup, onAddToCensus }: MemberTableItemProps) => {
  const { isSelected, toggleOne, columns } = useTable()

  return (
    <Table.Row>
      <Table.Cell>
        <Checkbox.Root
          checked={isSelected(member.id)}
          onCheckedChange={({ checked }) => toggleOne(member.id, checked === true)}
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
        </Checkbox.Root>
      </Table.Cell>
      {columns
        .filter((column) => column.visible)
        .map((column) => (
          // ph-no-capture: member data is never recorded in session replays
          <Table.Cell key={column.id} className='ph-no-capture'>
            {maskIfNeeded(column.id, member[column.id])}
          </Table.Cell>
        ))}
      <Table.Cell>
        <MemberActions
          member={member}
          onDelete={openDeleteSelected}
          onAddToGroup={onAddToGroup}
          onAddToCensus={onAddToCensus}
        />
      </Table.Cell>
    </Table.Row>
  )
}

const DeleteMemberModal = ({ isOpen, onClose, mode, ...props }: DeleteMemberModalProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { organization } = useOrganization()
  const deleteMutation = useDeleteMembers()
  const { data: allMembersData, isFetching: isFetchingAll } = usePaginatedMembers({ showAll: true })
  const { selectedRows, resetSelectedRows } = useTable()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const selectedMembers = mode === DeleteModes.SELECTED ? selectedRows : allMembersData?.members
  const ids = selectedRows.map((member) => member.id)
  const isDeleteAllMode = mode === DeleteModes.ALL

  const handleDelete = async () => {
    try {
      const members = isDeleteAllMode ? { all: true } : ids.length > 0 ? { ids } : {}
      await deleteMutation.mutateAsync(members)
      if (mode === DeleteModes.SELECTED) resetSelectedRows()
      toast({
        title: t('memberbase.delete_member.success', {
          defaultValue: 'Member deleted successfully',
          defaultValue_other: 'Members deleted successfully',
          count: isDeleteAllMode ? allMembersData?.pagination.totalItems : selectedMembers.length,
        }),
        type: 'success',
        duration: 3000,
        isClosable: true,
      })
      navigate(generatePath(Routes.dashboard.memberbase.members, { page: '1' }))
      onClose()
      await queryClient.invalidateQueries({
        queryKey: QueryKeys.organization.members(organization?.address),
        exact: false,
      })
    } catch (error) {
      toast({
        title: t('memberbase.delete_member.error', {
          defaultValue: 'Error deleting member',
          defaultValue_other: 'Error deleting members',
          count: selectedMembers.length,
        }),
        description: error.message,
        type: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <ConfirmDialog
      layout='inline'
      title={t('memberbase.delete_member.title', { defaultValue: 'Delete Members' })}
      description={
        isFetchingAll
          ? t('memberbase.delete_member.loading', {
              defaultValue: 'Loading members to delete...',
            })
          : t('memberbase.delete_member.subtitle', {
              defaultValue: 'Are you sure you want to delete {{count}} member? This action cannot be undone.',
              defaultValue_other: 'Are you sure you want to delete {{count}} members? This action cannot be undone.',
              count: isDeleteAllMode ? allMembersData?.pagination.totalItems : selectedMembers.length,
            })
      }
      open={isOpen}
      onOpenChange={({ open }) => (!open ? onClose() : undefined)}
      cancelText={t('memberbase.delete_member.cancel', { defaultValue: 'Cancel' })}
      confirmText={t('memberbase.delete_member.delete', { defaultValue: 'Delete' })}
      loading={deleteMutation.isPending || isFetchingAll}
      onConfirm={handleDelete}
      confirmProps={{ disabled: isFetchingAll || selectedMembers.length === 0 }}
      {...props}
    />
  )
}

// Range of rows on screen. Its total follows the active search, so the copy switches to
// "results" while searching; the whole memberbase size lives in the Members tab badge.
const MembersRangeSummary = () => {
  const { t } = useTranslation()
  const { debouncedSearch } = useOutletContext<MemberbaseTabsContext>()
  const { page, pagination } = useRoutedPagination()
  const { limit } = useUrlPagination()
  const { data } = useTable()
  const count = pagination?.totalItems

  if (!count || !data.length) return null

  const from = (page - 1) * limit + 1
  const to = from + data.length - 1

  return (
    <Text textStyle='body-sm'>
      {debouncedSearch
        ? t('members.table.showing_results', {
            defaultValue: 'Showing {{from, number}}–{{to, number}} of {{count, number}} result',
            defaultValue_other: 'Showing {{from, number}}–{{to, number}} of {{count, number}} results',
            count,
            from,
            to,
          })
        : t('members.table.showing_members', {
            defaultValue: 'Showing {{from, number}}–{{to, number}} of {{count, number}} member',
            defaultValue_other: 'Showing {{from, number}}–{{to, number}} of {{count, number}} members',
            count,
            from,
            to,
          })}
    </Text>
  )
}

const MembersTable = () => {
  const { t } = useTranslation()
  const [deleteMode, setDeleteMode] = useState<DeleteModes>(DeleteModes.SELECTED)
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
  const { open: isAddToGroupOpen, onOpen: onOpenAddToGroup, onClose: onAddToGroupClose } = useDisclosure()
  const { open: isAddToCensusOpen, onOpen: onOpenAddToCensus, onClose: onAddToCensusClose } = useDisclosure()
  const { isLoading, isFetching, allVisibleSelected, someSelected, resetSelectedRows, toggleAll, toggleOne, columns } =
    useTable()
  const isLoadingOrImporting = isLoading || isFetching
  const isMobile = useTableAsCards()

  const openDeleteSelected = (member?: Member) => {
    setDeleteMode(DeleteModes.SELECTED)
    if (member) {
      resetSelectedRows()
      toggleOne(member.id, true)
    }
    setDeleteModalOpen(true)
  }

  const openAddToGroup = (member?: Member) => {
    if (member) {
      resetSelectedRows()
      toggleOne(member.id, true)
    }
    onOpenAddToGroup()
  }

  const openAddToCensus = (member?: Member) => {
    if (member) {
      resetSelectedRows()
      toggleOne(member.id, true)
    }
    onOpenAddToCensus()
  }

  const openDeleteAll = () => {
    setDeleteMode(DeleteModes.ALL)
    setDeleteModalOpen(true)
  }

  return (
    <>
      <ImportProgress />
      <Card.Root variant='frame'>
        <Flex direction={{ base: 'column', lg: 'row' }} p='4' gap='2'>
          <Flex direction='column' flex={1} gap='2'>
            <MemberFilters onDelete={openDeleteAll} />
            <MemberBulkActions
              onDelete={openDeleteSelected}
              onAddToGroup={openAddToGroup}
              onAddToCensus={openAddToCensus}
            />
          </Flex>
          <Flex gap='2'>
            <ImportMembers />
            <MemberManager
              control={
                <Button>
                  <Icon as={AddIcon} />
                  {t('memberbase.add_member.button', { defaultValue: 'Add Member' })}
                </Button>
              }
            />
          </Flex>
        </Flex>
        {isLoadingOrImporting && <ListLoader />}
        {isMobile ? (
          <Box p='4'>
            <Flex justify='space-between' align='center' mb='3'>
              <Checkbox.Root
                checked={allVisibleSelected ? true : someSelected ? 'indeterminate' : false}
                onCheckedChange={({ checked }) => toggleAll(checked === true)}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>{t('members.table.select_all', { defaultValue: 'Select all' })}</Checkbox.Label>
              </Checkbox.Root>
              <ColumnManager />
            </Flex>
            <MembersCardList
              openDeleteSelected={openDeleteSelected}
              onAddToGroup={openAddToGroup}
              onAddToCensus={openAddToCensus}
            />
            <Box pt='4'>
              <RoutedPaginatedTableFooter summary={<MembersRangeSummary />} />
            </Box>
          </Box>
        ) : (
          <Table.ScrollArea>
            <Table.Root variant='outline'>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader width='table.action'>
                    <Checkbox.Root
                      checked={allVisibleSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={({ checked }) => toggleAll(checked === true)}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control />
                    </Checkbox.Root>
                  </Table.ColumnHeader>
                  {columns
                    .filter((col) => col.visible)
                    .map((col) => (
                      <Table.ColumnHeader key={col.id}>{col.label}</Table.ColumnHeader>
                    ))}
                  <Table.ColumnHeader width='table.action'>
                    <ColumnManager />
                  </Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <MembersList
                openDeleteSelected={openDeleteSelected}
                onAddToGroup={openAddToGroup}
                onAddToCensus={openAddToCensus}
              />
              <Table.Caption p='4'>
                <RoutedPaginatedTableFooter summary={<MembersRangeSummary />} />
              </Table.Caption>
            </Table.Root>
          </Table.ScrollArea>
        )}
      </Card.Root>
      <DeleteMemberModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} mode={deleteMode} />
      <AddMembersToGroupDrawer isOpen={isAddToGroupOpen} onClose={onAddToGroupClose} />
      <AddMembersToCensusDrawer isOpen={isAddToCensusOpen} onClose={onAddToCensusClose} />
    </>
  )
}

export default MembersTable

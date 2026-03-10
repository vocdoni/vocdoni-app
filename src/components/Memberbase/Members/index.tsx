import {
  Box,
  Button,
  type ButtonProps,
  Checkbox,
  Drawer,
  Flex,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  Menu,
  Progress,
  Switch,
  Table,
  Tag,
  Text,
  useDisclosure,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuEllipsis, LuPlus, LuSearch, LuSettings, LuTrash2, LuUserPlus, LuUsers, LuX } from 'react-icons/lu'
import { generatePath, useNavigate, useOutletContext } from 'react-router-dom'
import InputBasic from '~components/Form/InputBasic'
import { Select } from '~components/Form/Select'
import DeleteModal, { DeleteModalProps } from '~components/Modal/DeleteModal'
import RoutedPaginatedTableFooter from '~components/Pagination/PaginatedTableFooter'
import { useToast } from '~components/Toast'
import { Routes } from '~routes'
import { useCreateGroup, useGroups, useUpdateGroup } from '~src/queries/groups'
import { QueryKeys } from '~src/queries/keys'
import { Member, useDeleteMembers, usePaginatedMembers } from '~src/queries/members'
import { MemberbaseTabsContext } from '..'
import { useTable } from '../TableProvider'
import { ImportMembers, ImportProgress } from './Import'
import { MemberManager } from './Manager'

enum DeleteModes {
  SELECTED = 'selected',
  ALL = 'all',
}

type MemberActionsProps = {
  member: Member
  onDelete: () => void
  onAddToGroup: () => void
}

type MemberBulkActionsProps = {
  onDelete: () => void
  onAddToGroup: () => void
}

type DeleteMemberModalProps = {
  isOpen: boolean
  onClose: () => void
  mode: DeleteModes
} & Omit<DeleteModalProps, 'children' | 'title' | 'subtitle'>

type CreateGroupButtonProps = {
  members?: Member[]
  includeAllMembers?: boolean
  total?: number
} & ButtonProps

type MembersListProps = {
  openDeleteSelected: (member: Member) => void
  onAddToGroup: (member: Member) => void
}

type AddMembersToGroupDrawerProps = {
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
}

const maskedFields = new Set<string>(['phone'])

export const maskIfNeeded = (fieldId: string, value: string): string => {
  if (!maskedFields.has(fieldId)) return value
  if (!value) return ''
  return '*********'
}

const AddMembersToGroupDrawer = ({ isOpen, onClose }: AddMembersToGroupDrawerProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { data } = useGroups()
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
    <Drawer.Root open={isOpen} placement='end' onOpenChange={({ open }) => (!open ? onClose() : undefined)} size='sm'>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Header display='flex' justifyContent='space-between' alignItems='center'>
            <Box>
              <Heading size='md'>{t('members.table.add_to_group', { defaultValue: 'Add to Group' })}</Heading>
              <Text fontSize='sm' color='texts.subtle'>
                {t('members.table.add_to_group_description', {
                  defaultValue: 'Select a group to add the members to.',
                })}
              </Text>
            </Box>
            <IconButton
              aria-label={t('members.table.close_drawer', { defaultValue: 'Close' })}
              variant='ghost'
              size='sm'
              onClick={onClose}
            >
              <LuX />
            </IconButton>
          </Drawer.Header>

          <Drawer.Body display='flex' flexDirection='column' gap={4}>
            <Select
              placeholder={t('members.table.select_group', { defaultValue: 'Select group' })}
              options={data}
              getOptionLabel={(option) => (
                <Flex align='center' gap={2}>
                  {option.title}
                  <Box fontSize='sm' color='texts.subtle'>
                    <Icon as={LuUsers} />
                    {option.membersCount}
                  </Box>
                </Flex>
              )}
              getOptionValue={(option) => option.id}
              value={selectedGroup}
              onChange={(option) => setSelectedGroup(option)}
            />

            {selectedGroup && (
              <Text fontSize='sm' color='texts.subtle'>
                {t('members.table.add_to_group_confirmation', {
                  defaultValue: 'You will add {{count}} members to the "{{group}}" group.',
                  count: selectedRows.length,
                  group: selectedGroup.title,
                })}
              </Text>
            )}

            <Button
              onClick={handleAddToGroup}
              mt={2}
              width='100%'
              disabled={!selectedGroup || selectedRows.length === 0}
            >
              {t('members.table.add_to_group_button', {
                defaultValue: 'Add {{count}} member',
                count: selectedRows.length,
              })}
            </Button>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  )
}

const MemberActions = ({ member, onDelete, onAddToGroup }: MemberActionsProps) => {
  const { t } = useTranslation()
  const { open: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()

  return (
    <>
      <Menu.Root>
        <Menu.Trigger asChild>
          <IconButton variant='ghost' size='sm' aria-label={t('members.table.actions', { defaultValue: 'Actions' })}>
            <LuEllipsis />
          </IconButton>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content minW='120px'>
            <Menu.Item value='edit' onSelect={() => onEditOpen()}>
              {t('members.table.edit', { defaultValue: 'Edit' })}
            </Menu.Item>
            <Menu.Item value='add-to-group' onSelect={onAddToGroup}>
              {t('members.table.add_to_group', { defaultValue: 'Add to Group' })}
            </Menu.Item>
            <Menu.Separator />
            <Menu.Item value='delete' color='red.400' onSelect={onDelete}>
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
        <LuSettings />
      </IconButton>
      <Drawer.Root open={isOpen} placement='end' onOpenChange={({ open }) => (!open ? onClose() : undefined)}>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <Drawer.Header>
              <Heading size='md'>{t('members.table.manage_columns', { defaultValue: 'Manage Columns' })}</Heading>
              <Text fontSize='sm' color='texts.subtle'>
                {t('members.table.manage_columns_description', {
                  defaultValue: 'Customize which columns are displayed in the members table.',
                })}
              </Text>
            </Drawer.Header>
            <Drawer.Body>
              {columns.map((col) => (
                <Flex key={col.id} justify='space-between' align='center' my={2}>
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
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
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
    <Flex gap={2} flexDir={{ base: 'column', md: 'row' }}>
      <InputGroup
        maxW='300px'
        as='form'
        onSubmit={handleSubmit}
        endElement={
          <IconButton size='xs' variant='plain' aria-label='search' type='submit'>
            <Icon as={LuSearch} />
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
        <>
          <CreateGroupButton includeAllMembers members={data?.members ?? []} total={data.pagination.totalItems}>
            {t('members.table.create_group_all', { defaultValue: 'Create group (All)' })}
          </CreateGroupButton>
          <Button variant='outline' colorPalette='red' onClick={onDelete}>
            <Icon as={LuTrash2} />
            {t('members.table.delete_all', {
              defaultValue: 'Delete (All)',
            })}
          </Button>
        </>
      )}
    </Flex>
  )
}

const CreateGroupButton = ({
  children,
  members,
  includeAllMembers = false,
  total,
  ...rest
}: CreateGroupButtonProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const { open: isOpen, onOpen, onClose } = useDisclosure({ defaultOpen: false })
  const { selectedRows } = useTable()
  const navigate = useNavigate()
  const createGroupMutation = useCreateGroup()
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
      includeAllMembers,
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
      <Button variant='outline' colorPalette='gray' onClick={onOpen} {...rest}>
        <Icon as={LuUsers} />
        {children}
      </Button>
      <Drawer.Root open={isOpen} placement='end' onOpenChange={({ open }) => (!open ? onClose() : undefined)} size='sm'>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <IconButton
              aria-label={t('common.close_drawer', { defaultValue: 'Close drawer' })}
              position='absolute'
              top='6px'
              right='6px'
              onClick={onClose}
            >
              <Icon as={LuX} />
            </IconButton>
            <Drawer.Header display='flex' flexDirection='column' gap={2}>
              <Heading size='md'>
                {t('members.table.create_group_form_title', { defaultValue: 'Create New Group' })}
              </Heading>
              <Text fontSize='sm' color='texts.subtle'>
                {t('members.table.create_group_form_description', {
                  defaultValue:
                    'Create a new group from selected members. This will organize them for future voting processes.',
                })}
              </Text>
            </Drawer.Header>
            <FormProvider {...methods}>
              <Box as='form' onSubmit={methods.handleSubmit(createGroup)}>
                <Drawer.Body p={4} display='flex' flexDirection='column' gap={4}>
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
                    <Text mb={1}>{t('members.table.group_members', { defaultValue: 'Selected Members' })}</Text>
                    <Box border='1px' borderColor='table.border' borderRadius='md' p={4}>
                      <Text fontSize='sm' mb={2}>
                        {t('members.table.group_members_count', {
                          defaultValue: '{{count}} members selected',
                          count: selectedCount,
                        })}
                      </Text>
                      <Wrap>
                        {visible.map((member) => (
                          <WrapItem key={member.id}>
                            <Tag.Root borderRadius='sm' size='sm' variant='subtle' colorPalette='gray'>
                              <Tag.Label>{memberAlias(member)}</Tag.Label>
                            </Tag.Root>
                          </WrapItem>
                        ))}
                        {remainingCount > 0 && (
                          <WrapItem>
                            <Tag.Root borderRadius='sm' size='sm' variant='outline' colorPalette='brand'>
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
                </Drawer.Body>
                <Flex justifyContent='flex-end' p={4}>
                  <Button variant='outline' onClick={onClose}>
                    {t('members.table.cancel', { defaultValue: 'Cancel' })}
                  </Button>
                  <Button disabled={!selectedCount} ml={2} type='submit'>
                    {t('members.table.create_group', { defaultValue: 'Create group' })}
                  </Button>
                </Flex>
              </Box>
            </FormProvider>
          </Drawer.Content>
        </Drawer.Positioner>
      </Drawer.Root>
    </>
  )
}

const MemberBulkActions = ({ onDelete, onAddToGroup }: MemberBulkActionsProps) => {
  const { t } = useTranslation()
  const { selectedRows } = useTable()

  return (
    <Flex
      gap={4}
      align='center'
      minH='42px'
      flexDir={{ base: 'column', md: 'row' }}
      alignItems={{ base: 'stretch', md: 'center' }}
    >
      {selectedRows.length > 0 ? (
        <>
          <Text fontSize='sm' color='texts.subtle'>
            <Trans
              i18nKey='members.table.selected'
              count={selectedRows.length}
              components={{ strong: <Text as='span' fontSize='sm' fontWeight='extrabold' display='inline' /> }}
              defaults='Selected: <strong>{{count}} member</strong>'
            />
          </Text>
          <CreateGroupButton>{t('members.table.create_group', { defaultValue: 'Create group' })}</CreateGroupButton>
          <Button size='sm' variant='outline' onClick={() => onAddToGroup()}>
            <Icon as={LuUserPlus} />
            {t('members.table.add_to_group', { defaultValue: 'Add to Group' })}
          </Button>
          <Button size='sm' colorPalette='red' variant='outline' onClick={() => onDelete()}>
            <Icon as={LuTrash2} />
            {t('members.table.bulk_delete', { defaultValue: 'Delete' })}
          </Button>
        </>
      ) : (
        <Text fontSize='sm' color='texts.subtle'>
          <Trans i18nKey='members.table.select_hint' defaults='Select members to perform bulk actions' />
        </Text>
      )}
    </Flex>
  )
}

const MembersList = ({ openDeleteSelected, onAddToGroup }: MembersListProps) => {
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
          />
        ))
      )}
    </Table.Body>
  )
}

const EmptyMembers = () => {
  const { t } = useTranslation()
  const { columns, error } = useTable()
  const { debouncedSearch } = useOutletContext<MemberbaseTabsContext>()

  return (
    <Table.Row>
      <Table.Cell colSpan={columns.filter((c) => c.visible).length + 2}>
        <Flex justify='center' align='center' height='150px'>
          <Text color='texts.subtle' fontSize='sm'>
            {debouncedSearch
              ? t('members.table.no_filter_results', {
                  defaultValue: 'No members matching these attributes',
                })
              : error
                ? error.message.toString()
                : t('members.table.no_results', {
                    defaultValue: 'No members found',
                  })}
          </Text>
        </Flex>
      </Table.Cell>
    </Table.Row>
  )
}

const MemberTableItem = ({ member, openDeleteSelected, onAddToGroup }: MemberTableItemProps) => {
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
          <Table.Cell key={column.id}>{maskIfNeeded(column.id, member[column.id])}</Table.Cell>
        ))}
      <Table.Cell>
        <MemberActions member={member} onDelete={openDeleteSelected} onAddToGroup={onAddToGroup} />
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
      navigate(generatePath(Routes.dashboard.memberbase.members, { page: 1 }))
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
    <DeleteModal
      title={t('memberbase.delete_member.title', { defaultValue: 'Delete Members' })}
      subtitle={
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
      {...props}
    >
      <Flex justifyContent='flex-end' mt={4} gap={2}>
        <Button variant='outline' onClick={onClose}>
          {t('memberbase.delete_member.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button
          loading={deleteMutation.isPending || isFetchingAll}
          colorPalette='red'
          onClick={handleDelete}
          disabled={isFetchingAll || selectedMembers.length === 0}
        >
          {t('memberbase.delete_member.delete', { defaultValue: 'Delete' })}
        </Button>
      </Flex>
    </DeleteModal>
  )
}

const MembersTable = () => {
  const { t } = useTranslation()
  const [deleteMode, setDeleteMode] = useState<DeleteModes>(DeleteModes.SELECTED)
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
  const { open: isAddToGroupOpen, onOpen: onOpenAddToGroup, onClose: onAddToGroupClose } = useDisclosure()
  const { isLoading, isFetching, allVisibleSelected, someSelected, resetSelectedRows, toggleAll, toggleOne, columns } =
    useTable()
  const isLoadingOrImporting = isLoading || isFetching

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

  const openDeleteAll = () => {
    setDeleteMode(DeleteModes.ALL)
    setDeleteModalOpen(true)
  }

  return (
    <>
      <ImportProgress />
      <Box border='1px solid' borderRadius='sm' borderColor='table.border'>
        <Flex direction={{ base: 'column', lg: 'row' }} p={4} gap={2}>
          <Flex direction='column' flex={1} gap={2}>
            <MemberFilters onDelete={openDeleteAll} />
            <MemberBulkActions onDelete={openDeleteSelected} onAddToGroup={openAddToGroup} />
          </Flex>
          <Flex gap={2}>
            <ImportMembers />
            <MemberManager
              control={
                <Button>
                  <Icon as={LuPlus} />
                  {t('memberbase.add_member.button', { defaultValue: 'Add Member' })}
                </Button>
              }
            />
          </Flex>
        </Flex>
        {isLoadingOrImporting && (
          <Progress.Root size='xs' value={null}>
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
        )}
        <Table.ScrollArea>
          <Table.Root variant='outline'>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader width='50px'>
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
                <Table.ColumnHeader width='50px'>
                  <ColumnManager />
                </Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <MembersList openDeleteSelected={openDeleteSelected} onAddToGroup={openAddToGroup} />
            <Table.Caption p={4}>
              <RoutedPaginatedTableFooter />
            </Table.Caption>
          </Table.Root>
        </Table.ScrollArea>
      </Box>
      <DeleteMemberModal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} mode={deleteMode} />
      <AddMembersToGroupDrawer isOpen={isAddToGroupOpen} onClose={onAddToGroupClose} />
    </>
  )
}

export default MembersTable

import {
  Box,
  Button,
  ButtonProps,
  Checkbox,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Heading,
  Icon,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  ModalProps,
  Progress,
  Switch,
  Table,
  TableContainer,
  Tag,
  TagLabel,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
  Wrap,
  WrapItem,
} from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-providers'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuEllipsis, LuPlus, LuSearch, LuSettings, LuTrash2, LuUserPlus, LuUsers, LuX } from 'react-icons/lu'
import { generatePath, useNavigate, useOutletContext } from 'react-router-dom'
import InputBasic from '~components/shared/Form/InputBasic'
import { Select } from '~components/shared/Form/Select'
import DeleteModal from '~components/shared/Modal/DeleteModal'
import RoutedPaginatedTableFooter from '~components/shared/Pagination/PaginatedTableFooter'
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
} & Omit<ModalProps, 'children'>

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
            status: 'success',
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
    <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='sm'>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerHeader display='flex' justifyContent='space-between' alignItems='center'>
          <Box>
            <Heading size='md'>{t('members.table.add_to_group', { defaultValue: 'Add to Group' })}</Heading>
            <Text fontSize='sm' color='texts.subtle'>
              {t('members.table.add_to_group_description', {
                defaultValue: 'Select a group to add the members to.',
              })}
            </Text>
          </Box>
          <IconButton
            icon={<LuX />}
            aria-label={t('members.table.close_drawer', { defaultValue: 'Close' })}
            variant='ghost'
            size='sm'
            onClick={onClose}
          />
        </DrawerHeader>

        <DrawerBody display='flex' flexDirection='column' gap={4}>
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
            isDisabled={!selectedGroup || selectedRows.length === 0}
          >
            {t('members.table.add_to_group_button', {
              defaultValue: 'Add {{count}} member',
              count: selectedRows.length,
            })}
          </Button>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

const MemberActions = ({ member, onDelete, onAddToGroup }: MemberActionsProps) => {
  const { t } = useTranslation()

  return (
    <>
      <Menu placement='bottom-end'>
        <MenuButton as={IconButton} icon={<LuEllipsis />} variant='ghost' size='sm' />
        <MenuList minW='120px'>
          <MemberManager
            member={member}
            control={<MenuItem>{t('members.table.edit', { defaultValue: 'Edit' })}</MenuItem>}
          />
          <MenuItem onClick={onAddToGroup}>
            {t('members.table.add_to_group', { defaultValue: 'Add to Group' })}
          </MenuItem>
          <MenuDivider />
          <MenuItem color='red.400' onClick={onDelete}>
            {t('members.table.delete', { defaultValue: 'Delete' })}
          </MenuItem>
        </MenuList>
      </Menu>
    </>
  )
}

const ColumnManager = () => {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { columns, setColumns } = useTable()

  const toggleColumn = (columnId: string) => {
    const updatedColumns = columns.map((col) => (col.id === columnId ? { ...col, visible: !col.visible } : col))
    setColumns(updatedColumns)
  }

  return (
    <>
      <IconButton
        icon={<LuSettings />}
        aria-label={t('members.table.manage_columns', { defaultValue: 'Manage Columns' })}
        variant='ghost'
        size='sm'
        onClick={onOpen}
      />
      <Drawer isOpen={isOpen} placement='right' onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader>
            <Heading size='md'>{t('members.table.manage_columns', { defaultValue: 'Manage Columns' })}</Heading>
            <Text fontSize='sm' color='texts.subtle'>
              {t('members.table.manage_columns_description', {
                defaultValue: 'Customize which columns are displayed in the members table.',
              })}
            </Text>
          </DrawerHeader>
          <DrawerBody>
            {columns.map((col) => (
              <Flex key={col.id} justify='space-between' align='center' my={2}>
                <Text>{col.label}</Text>
                <Switch
                  isChecked={col.visible}
                  onChange={toggleColumn.bind(null, col.id)}
                  aria-label={t('members.table.toggle_column', {
                    defaultValue: `Toggle ${col.id} column`,
                  })}
                />
              </Flex>
            ))}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
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
      <InputGroup maxW='300px' as='form' onSubmit={handleSubmit}>
        <Input
          placeholder={t('members.table.search', { defaultValue: 'Search members...' })}
          value={search}
          onChange={handleSearchChange}
        />
        <InputRightElement>
          <IconButton size='xs' aria-label='search' type='submit' icon={<Icon as={LuSearch} />} />
        </InputRightElement>
      </InputGroup>
      {data?.members?.length >= 1 && (
        <>
          <CreateGroupButton includeAllMembers members={data?.members ?? []} total={data.pagination.totalItems}>
            {t('members.table.create_group_all', { defaultValue: 'Create group (All)' })}
          </CreateGroupButton>
          <Button leftIcon={<Icon as={LuTrash2} />} variant='outline' colorScheme='red' onClick={onDelete}>
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
  const { isOpen, onOpen, onClose } = useDisclosure({ defaultIsOpen: false })
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
          status: 'success',
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
          status: 'error',
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
      <Button leftIcon={<Icon as={LuUsers} />} variant='outline' colorScheme='gray' onClick={onOpen} {...rest}>
        {children}
      </Button>
      <Drawer isOpen={isOpen} placement='right' onClose={onClose} size='sm'>
        <DrawerOverlay />
        <DrawerContent>
          <IconButton
            aria-label={t('common.close_drawer', { defaultValue: 'Close drawer' })}
            icon={<Icon as={LuX} />}
            position='absolute'
            top='6px'
            right='6px'
            onClick={onClose}
            variant='transparent'
          />
          <DrawerHeader display='flex' flexDirection='column' gap={2}>
            <Heading size='md'>
              {t('members.table.create_group_form_title', { defaultValue: 'Create New Group' })}
            </Heading>
            <Text fontSize='sm' color='texts.subtle'>
              {t('members.table.create_group_form_description', {
                defaultValue:
                  'Create a new group from selected members. This will organize them for future voting processes.',
              })}
            </Text>
          </DrawerHeader>
          <FormProvider {...methods}>
            <Box as='form' onSubmit={methods.handleSubmit(createGroup)}>
              <DrawerBody p={4} display='flex' flexDirection='column' gap={4}>
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
                          <Tag borderRadius='sm' size='sm' variant='subtle' colorScheme='gray'>
                            <TagLabel>{memberAlias(member)}</TagLabel>
                          </Tag>
                        </WrapItem>
                      ))}
                      {remainingCount > 0 && (
                        <WrapItem>
                          <Tag borderRadius='sm' size='sm' variant='outline' colorScheme='black'>
                            <TagLabel>
                              {t('members.table.remaining_members', {
                                defaultValue: '+{{count}} more',
                                count: remainingCount,
                              })}
                            </TagLabel>
                          </Tag>
                        </WrapItem>
                      )}
                    </Wrap>
                  </Box>
                </Box>
              </DrawerBody>
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
        </DrawerContent>
      </Drawer>
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
          <Button leftIcon={<Icon as={LuUserPlus} />} size='sm' variant='outline' onClick={() => onAddToGroup()}>
            {t('members.table.add_to_group', { defaultValue: 'Add to Group' })}
          </Button>
          <Button
            leftIcon={<Icon as={LuTrash2} />}
            size='sm'
            colorScheme='red'
            variant='outline'
            onClick={() => onDelete()}
          >
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
    <Tbody>
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
    </Tbody>
  )
}

const EmptyMembers = () => {
  const { t } = useTranslation()
  const { columns, error } = useTable()
  const { debouncedSearch } = useOutletContext<MemberbaseTabsContext>()

  return (
    <Tr>
      <Td colSpan={columns.filter((c) => c.visible).length + 2}>
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
      </Td>
    </Tr>
  )
}

const MemberTableItem = ({ member, openDeleteSelected, onAddToGroup }: MemberTableItemProps) => {
  const { isSelected, toggleOne, columns } = useTable()

  return (
    <Tr>
      <Td>
        <Checkbox isChecked={isSelected(member.id)} onChange={(e) => toggleOne(member.id, e.target.checked)} />
      </Td>
      {columns
        .filter((column) => column.visible)
        .map((column) => (
          <Td key={column.id}>{maskIfNeeded(column.id, member[column.id])}</Td>
        ))}
      <Td>
        <MemberActions member={member} onDelete={openDeleteSelected} onAddToGroup={onAddToGroup} />
      </Td>
    </Tr>
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
        status: 'success',
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
        status: 'error',
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
      isOpen={isOpen}
      onClose={onClose}
      {...props}
    >
      <Flex justifyContent='flex-end' mt={4} gap={2}>
        <Button variant='outline' onClick={onClose}>
          {t('memberbase.delete_member.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button
          isLoading={deleteMutation.isPending || isFetchingAll}
          shouldWrapChildren
          colorScheme='red'
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
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isAddToGroupOpen, onOpen: onOpenAddToGroup, onClose: onAddToGroupClose } = useDisclosure()
  const { isLoading, isFetching, allVisibleSelected, someSelected, resetSelectedRows, toggleAll, toggleOne, columns } =
    useTable()
  const isLoadingOrImporting = isLoading || isFetching

  const openDeleteSelected = (member?: Member) => {
    setDeleteMode(DeleteModes.SELECTED)
    if (member) {
      resetSelectedRows()
      toggleOne(member.id, true)
    }
    onOpen()
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
    onOpen()
  }

  return (
    <>
      <ImportProgress />
      <Box border='1px' borderRadius='sm' borderColor='table.border'>
        <Flex direction={{ base: 'column', lg: 'row' }} p={4} gap={2}>
          <Flex direction='column' flex={1} gap={2}>
            <MemberFilters onDelete={openDeleteAll} />
            <MemberBulkActions onDelete={openDeleteSelected} onAddToGroup={openAddToGroup} />
          </Flex>
          <Flex gap={2}>
            <ImportMembers />
            <MemberManager
              control={
                <Button leftIcon={<Icon as={LuPlus} />}>
                  {t('memberbase.add_member.button', { defaultValue: 'Add Member' })}
                </Button>
              }
            />
          </Flex>
        </Flex>
        {isLoadingOrImporting && <Progress size='xs' isIndeterminate />}
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th width='50px'>
                  <Checkbox
                    isChecked={allVisibleSelected}
                    isIndeterminate={someSelected && !allVisibleSelected}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </Th>
                {columns
                  .filter((col) => col.visible)
                  .map((col) => (
                    <Th key={col.id}>{col.label}</Th>
                  ))}
                <Th width='50px'>
                  <ColumnManager />
                </Th>
              </Tr>
            </Thead>
            <MembersList openDeleteSelected={openDeleteSelected} onAddToGroup={openAddToGroup} />
          </Table>
        </TableContainer>
        <Box p={4}>
          <RoutedPaginatedTableFooter />
        </Box>
      </Box>
      <DeleteMemberModal isOpen={isOpen} onClose={onClose} mode={deleteMode} />
      <AddMembersToGroupDrawer isOpen={isAddToGroupOpen} onClose={onAddToGroupClose} />
    </>
  )
}

export default MembersTable

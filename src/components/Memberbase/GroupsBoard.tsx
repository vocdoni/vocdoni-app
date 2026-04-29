import {
  Button,
  Card,
  CheckboxControl,
  CheckboxHiddenInput,
  CheckboxRoot,
  CloseButton,
  Drawer,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  MenuContent,
  MenuItem,
  MenuPositioner,
  MenuRoot,
  MenuSeparator,
  MenuTrigger,
  Progress,
  Separator,
  SimpleGrid,
  Table,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { PaginationProvider, usePagination } from '@vocdoni/react-components/pagination'
import { useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LuCalendar, LuClock, LuEllipsis, LuEye, LuTrash, LuUsers, LuVote } from 'react-icons/lu'
import { generatePath, useNavigate } from 'react-router-dom'
import { DashboardBox } from '~components/Dashboard/Contents'
import { ListStateAlert } from '~components/Feedback/ListStateAlert'
import DeleteModal from '~components/Modal/DeleteModal'
import { PaginatedTableFooter } from '~components/Pagination/PaginatedTableFooter'
import { useToast } from '~components/Toast'
import { Routes } from '~routes'
import { Group, useDeleteGroup, useGroupMembers, useGroups, useUpdateGroup } from '~src/queries/groups'
import { TableProvider, useTable } from './TableProvider'

type GroupActionsProps = {
  group: Group
  onMembersDrawerOpen: () => void
  onDeleteModalOpen: () => void
}

type ViewMembersDrawerProps = {
  group: Group
  isOpen: boolean
  onClose: () => void
  openDeleteModal: () => void
}

type HistoryDrawerProps = {
  group: Group
  isOpen: boolean
  onClose: () => void
}

type GroupCardProps = {
  group: Group
}

type GroupMembersProps = {
  group: Group
  isOpen: boolean
}

type DeleteGroupModalProps = {
  group: Group
  isOpen: boolean
  onClose: () => void
}

const useGroupDisplay = (group: Group) => {
  const { t } = useTranslation()
  return {
    displayTitle: group.isAutoGroup ? t('groups_board.auto_group.title', { defaultValue: 'All Members' }) : group.title,
    displayDescription: group.isAutoGroup
      ? t('groups_board.auto_group.description', {
          defaultValue: 'Automatically includes all members of your organization.',
        })
      : group.description,
  }
}

export const useNavigateToVote = () => {
  const navigate = useNavigate()

  return (groupId: string) => {
    const votePath = generatePath(Routes.processes.create, { groupId })
    navigate(votePath)
  }
}

const GroupsInfo = () => {
  const { t } = useTranslation()
  const { open: isOpen, onClose } = useDisclosure({ defaultOpen: true })

  if (!isOpen) return null

  return (
    <DashboardBox position='relative' flexDirection='column' display='flex' gap={2} p={6} borderColor='table.border'>
      <CloseButton onClick={onClose} position='absolute' top={2} right={2} colorPalette='gray' size='sm' />
      <Flex flexDirection='row' gap={4}>
        <Icon as={LuUsers} boxSize={8} />
        <Flex flexDirection='column' gap={4}>
          <Text fontSize='md' fontWeight='bold'>
            {t('groups_board.info.title', { defaultValue: 'About Groups' })}
          </Text>
          <Text fontSize='sm' lineHeight='16px'>
            {t('groups_board.info.description', {
              defaultValue:
                'Groups are collections of members within your memberbase that can be used to create censuses for voting processes.',
            })}
          </Text>
          <Text fontSize='sm' lineHeight='16px'>
            {t('groups_board.info.extra', {
              defaultValue:
                'When you initiate a vote, a census is created as a time-specific snapshot of the group. Any subsequent changes to the group will not affect existing censuses, but will be reflected in future voting processes.',
            })}
          </Text>
        </Flex>
      </Flex>
    </DashboardBox>
  )
}

const HistoryDrawer = ({ group, isOpen, onClose }: HistoryDrawerProps) => {
  const { t } = useTranslation()
  const { displayTitle } = useGroupDisplay(group)

  return (
    <Drawer.Root open={isOpen} onOpenChange={({ open }) => (!open ? onClose() : undefined)} size='sm'>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.CloseTrigger asChild>
            <CloseButton aria-label={t('drawer.close', 'Close drawer')} onClick={onClose} />
          </Drawer.CloseTrigger>
          <Drawer.Header display='flex' flexDirection='column' alignItems='start'>
            <Drawer.Title>
              {t('groups_board.history.title', { defaultValue: '{{ title }} History', title: displayTitle })}
            </Drawer.Title>
            <Text color='texts.subtle' fontSize='sm'>
              {t('groups_board.history.description', {
                defaultValue: 'View the history of this group and its associated censuses',
              })}
            </Text>
          </Drawer.Header>
          <Drawer.Body>
            <Flex justify='flex-end'>
              <Button variant='outline' onClick={onClose}>
                {t('groups_board.history.close', { defaultValue: 'Close' })}
              </Button>
            </Flex>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  )
}

const GroupActions = ({ group, onMembersDrawerOpen, onDeleteModalOpen }: GroupActionsProps) => {
  const { t } = useTranslation()
  const navigateToVote = useNavigateToVote()
  const { open: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure()

  return (
    <>
      <MenuRoot>
        <MenuTrigger asChild>
          <IconButton aria-label={t('actions.more', { defaultValue: 'More options' })} variant='ghost' size='sm'>
            <Icon as={LuEllipsis} />
          </IconButton>
        </MenuTrigger>
        <MenuPositioner>
          <MenuContent minW='100px' fontSize='sm'>
            <MenuItem value='members' onClick={onMembersDrawerOpen}>
              <HStack gap={2}>
                <Icon boxSize={4} as={LuEye} />
                <Text as='span'>{t('group.actions.view_members', { defaultValue: 'View Members' })}</Text>
              </HStack>
            </MenuItem>
            <MenuItem value='vote' onClick={() => navigateToVote(group.id)}>
              <HStack gap={2}>
                <Icon boxSize={4} as={LuVote} />
                <Text as='span'>{t('group.actions.create_vote', { defaultValue: 'Create a Vote' })}</Text>
              </HStack>
            </MenuItem>
            <MenuItem value='history' disabled onClick={onHistoryOpen}>
              <HStack gap={2}>
                <Icon boxSize={4} as={LuClock} />
                <Text as='span'>{t('group.actions.history', { defaultValue: 'History' })}</Text>
              </HStack>
            </MenuItem>
            {!group.isAutoGroup && (
              <>
                <MenuSeparator />
                <MenuItem value='delete' color='red.500' onClick={onDeleteModalOpen}>
                  <HStack gap={2}>
                    <Icon boxSize={4} as={LuTrash} />
                    <Text as='span'>{t('group.actions.delete_group', { defaultValue: 'Delete Group' })}</Text>
                  </HStack>
                </MenuItem>
              </>
            )}
          </MenuContent>
        </MenuPositioner>
      </MenuRoot>
      <HistoryDrawer group={group} isOpen={isHistoryOpen} onClose={onHistoryClose} />
    </>
  )
}

const GroupMembersTable = ({ groupId, group }: { groupId: string; group: Group }) => {
  const { t } = useTranslation()
  const deleteGroupMembers = useUpdateGroup()
  const [isDeleteMembersModalOpen, setDeleteMembersModalOpen] = useState(false)
  const {
    data,
    isLoading,
    columns,
    selectedRows,
    resetSelectedRows,
    allVisibleSelected,
    isSelected,
    someSelected,
    toggleAll,
    toggleOne,
  } = useTable()
  const isEmpty = data.length === 0 && !isLoading

  const onDeleteMember = (memberIds: string[]) => {
    deleteGroupMembers.mutate({ groupId: groupId, body: { removeMembers: memberIds } })
  }

  return (
    <>
      {!group.isAutoGroup && (
        <Flex gap={4} align='center' minH='42px' mb={2}>
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
              <Button onClick={() => setDeleteMembersModalOpen(true)} size='sm' colorPalette='red' variant='outline'>
                <Icon as={LuTrash} />
                {t('members.table.bulk_delete', { defaultValue: 'Delete' })}
              </Button>
            </>
          ) : (
            <Text fontSize='sm' color='texts.subtle'>
              <Trans i18nKey='members.table.select_hint' defaults='Select members to perform bulk actions' />
            </Text>
          )}
        </Flex>
      )}
      <Table.ScrollArea
        border='1px'
        borderRadius='sm'
        borderColor='table.border'
        overflowX='visible'
        overflowY='visible'
      >
        {isEmpty ? (
          <Flex justify='center' align='center' height='200px'>
            <Text color='texts.subtle' fontSize='sm'>
              {t('members.table.no_results', {
                defaultValue: 'No members found',
              })}
            </Text>
          </Flex>
        ) : (
          <>
            {isLoading && (
              <Progress.Root value={null}>
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            )}
            <Table.Root variant='outline'>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader width='50px'>
                    <CheckboxRoot
                      checked={allVisibleSelected ? true : someSelected ? 'indeterminate' : false}
                      onCheckedChange={({ checked }) => toggleAll(checked === true)}
                    >
                      <CheckboxHiddenInput />
                      <CheckboxControl />
                    </CheckboxRoot>
                  </Table.ColumnHeader>
                  {columns.map((col) => (
                    <Table.ColumnHeader key={col.id}>{col.label}</Table.ColumnHeader>
                  ))}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {data.map((member) => (
                  <Table.Row key={member.id}>
                    <Table.Cell>
                      <CheckboxRoot
                        checked={isSelected(member.id)}
                        onCheckedChange={({ checked }) => toggleOne(member.id, checked === true)}
                      >
                        <CheckboxHiddenInput />
                        <CheckboxControl />
                      </CheckboxRoot>
                    </Table.Cell>
                    {columns.map((column) => (
                      <Table.Cell key={column.id}>{member[column.id]}</Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
              <Table.Caption>
                <PaginatedTableFooter />
              </Table.Caption>
            </Table.Root>
          </>
        )}
      </Table.ScrollArea>
      <DeleteModal
        title={t('group.delete_member.title', { defaultValue: 'Delete Members' })}
        subtitle={t('group.delete_member.subtitle', {
          defaultValue: 'Are you sure you want to delete {{count}} members?',
          count: selectedRows.length,
        })}
        open={isDeleteMembersModalOpen}
        onOpenChange={({ open }) => setDeleteMembersModalOpen(open)}
      >
        <Flex justifyContent='flex-end' mt={4} gap={2}>
          <Button variant='outline' onClick={() => setDeleteMembersModalOpen(false)}>
            {t('memberbase.delete_member.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            loading={deleteGroupMembers.isPending}
            colorPalette='red'
            onClick={() => {
              onDeleteMember(selectedRows.map((row) => row.id))
              setDeleteMembersModalOpen(false)
              resetSelectedRows()
            }}
          >
            {t('memberbase.delete_member.delete', { defaultValue: 'Delete' })}
          </Button>
        </Flex>
      </DeleteModal>
    </>
  )
}

const ViewMembersDrawer = ({ group, isOpen, onClose, openDeleteModal }: ViewMembersDrawerProps) => {
  const { t } = useTranslation()
  const navigateToVote = useNavigateToVote()
  const { displayTitle } = useGroupDisplay(group)

  return (
    <Drawer.Root open={isOpen} onOpenChange={({ open }) => (!open ? onClose() : undefined)} size='lg'>
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.CloseTrigger asChild>
            <CloseButton aria-label={t('drawer.close', 'Close drawer')} onClick={onClose} />
          </Drawer.CloseTrigger>
          <Drawer.Header display='flex' flexDirection='column' alignItems='start'>
            <Drawer.Title>{displayTitle}</Drawer.Title>
            <Text color='texts.subtle' fontSize='sm'>
              {`${t('group.created_on', {
                defaultValue: 'Created {{date}}',
                date: new Date(group.createdAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
              })} • ${t('group.members', {
                defaultValue: '{{count}} member',
                defaultValue_other: '{{count}} members',
                count: group.membersCount || 0,
              })}`}
            </Text>
          </Drawer.Header>
          <Drawer.Body>
            <GroupMembersDisplay group={group} isOpen={isOpen} />
            <Separator my={4} />
            <Flex direction='column' gap={4}>
              <Text fontWeight='extrabold' fontSize='sm'>
                {t('group.actions_title', { defaultValue: 'Actions' })}
              </Text>
              <Text fontSize='xs' color='texts.subtle'>
                {t('group.actions_description', {
                  defaultValue:
                    "When a new vote is created, the system takes a snapshot of the group's members at that moment. Any changes to the member list afterward will not affect the created census.",
                })}
              </Text>
            </Flex>
            <Flex justify='space-between' mt={4} gap={2}>
              <Button size='xs' onClick={() => navigateToVote(group.id)}>
                <Icon as={LuVote} boxSize={4} />
                {t('group.create_vote', { defaultValue: 'Create a Vote' })}
              </Button>
              {!group.isAutoGroup && (
                <Button onClick={openDeleteModal} colorPalette='red' size='xs'>
                  <Icon as={LuTrash} boxSize={4} />
                  {t('group.delete_group', { defaultValue: 'Delete group' })}
                </Button>
              )}
            </Flex>
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  )
}

const GroupMembersDisplay = ({ group, isOpen }: GroupMembersProps) => {
  const initialPage = 1
  const { data, isLoading } = useGroupMembers(group.id, initialPage, isOpen)

  if (isLoading) {
    return (
      <Progress.Root value={null}>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    )
  }

  const pagination = data.pagination

  return (
    <PaginationProvider initialPage={initialPage} pagination={pagination}>
      <GroupMembersWithPagination group={group} isOpen={isOpen} />
    </PaginationProvider>
  )
}

const GroupMembersWithPagination = ({ group, isOpen }: GroupMembersProps) => {
  const { t } = useTranslation()
  const { page } = usePagination()
  const { data, isLoading, error } = useGroupMembers(group.id, page, isOpen)
  const members = data?.members ?? []
  const hasError = !!error && !isLoading
  const isEmpty = members.length === 0 && !isLoading && !hasError
  const showAlert = hasError || isEmpty
  const alertStatus = hasError ? 'error' : 'info'
  const alertTitle = hasError
    ? t('group.members.error', { defaultValue: 'Unable to load group members' })
    : t('group.members.empty', { defaultValue: 'No members found' })
  const alertDescription = hasError
    ? error?.message?.toString()
    : t('group.members.empty_description', { defaultValue: 'Add members to see them listed here.' })

  return (
    <>
      {showAlert && <ListStateAlert show status={alertStatus} title={alertTitle} description={alertDescription} />}
      <TableProvider
        data={members}
        isLoading={isLoading}
        initialColumns={[
          { id: 'name', label: t('group.name', { defaultValue: 'Name' }) },
          { id: 'email', label: t('group.email', { defaultValue: 'Email' }) },
        ]}
      >
        <GroupMembersTable groupId={group.id} group={group} />
      </TableProvider>
    </>
  )
}

const DeleteGroupModal = ({ group, isOpen, onClose }: DeleteGroupModalProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const deleteGroupMutation = useDeleteGroup()

  const handleDelete = () => {
    deleteGroupMutation.mutate(group.id, {
      onSuccess: () => {
        toast({
          title: t('group.actions.delete_success', { defaultValue: 'Group deleted successfully' }),
          type: 'success',
          duration: 3000,
          closable: true,
        })
        onClose()
      },
      onError: (error) => {
        toast({
          title: t('group.actions.delete_error', { defaultValue: 'Error deleting group' }),
          description: error.message,
          type: 'error',
          duration: 3000,
          closable: true,
        })
      },
    })
  }

  return (
    <DeleteModal
      title={t('group.actions.delete_confirm_title', { defaultValue: 'Delete Group' })}
      subtitle={
        <Trans
          i18nKey='group.actions.delete_confirm_description'
          values={{ title: group.title }}
          components={{ bold: <Text as='span' fontSize='sm' fontWeight='extrabold' /> }}
          defaults='Are you sure you want to delete <bold>{{title}}</bold>? This action cannot be undone and will permanently remove the group from your organization.'
        />
      }
      open={isOpen}
      onOpenChange={({ open }) => (!open ? onClose() : undefined)}
    >
      <Flex justifyContent='flex-end' mt={4} gap={2}>
        <Button variant='outline' onClick={onClose}>
          {t('group.actions.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button colorPalette='red' onClick={handleDelete}>
          {t('group.actions.delete', { defaultValue: 'Delete' })}
        </Button>
      </Flex>
    </DeleteModal>
  )
}

const GroupCard = ({ group }: GroupCardProps) => {
  const { t } = useTranslation()
  const navigateToVote = useNavigateToVote()
  const { open: isMembersDrawerOpen, onOpen: onMembersDrawerOpen, onClose: onMembersDrawerClose } = useDisclosure()
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false)
  const { displayTitle, displayDescription } = useGroupDisplay(group)

  return (
    <>
      <Card.Root variant='outline' borderColor='table.border' p={4} pt={2}>
        <Card.Header p={0}>
          <Flex justify='space-between' align='center'>
            <Heading size='md'>{displayTitle}</Heading>
            <GroupActions
              group={group}
              onMembersDrawerOpen={onMembersDrawerOpen}
              onDeleteModalOpen={() => setDeleteModalOpen(true)}
            />
          </Flex>
        </Card.Header>
        <Card.Body p={0}>
          <Flex direction='column' gap={2}>
            <Flex align='center' gap={2}>
              <Icon as={LuCalendar} boxSize={3.5} />
              <Text color='texts.subtle' fontSize='sm'>
                {t('group.created_on', {
                  defaultValue: 'Created {{date}}',
                  date: new Date(group.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }),
                })}
              </Text>
            </Flex>
            <Flex align='center' gap={2}>
              <Icon as={LuUsers} boxSize={3.5} />
              <Text
                onClick={onMembersDrawerOpen}
                fontWeight='bold'
                fontSize='sm'
                cursor='pointer'
                _hover={{ textDecoration: 'underline' }}
              >
                {t('group.members', {
                  defaultValue: '{{count}} member',
                  defaultValue_other: '{{count}} members',
                  count: group.membersCount || 0,
                })}
              </Text>
            </Flex>
            <Text fontSize='sm' color='texts.subtle'>
              {displayDescription}
            </Text>
          </Flex>
        </Card.Body>
        <Card.Footer px={0} pb={0} mt={3}>
          <Button w='full' size='xs' onClick={() => navigateToVote(group.id)}>
            <Icon boxSize={4} as={LuVote} />
            {t('group.create_vote', { defaultValue: 'Create a Vote' })}
          </Button>
        </Card.Footer>
      </Card.Root>
      <ViewMembersDrawer
        group={group}
        isOpen={isMembersDrawerOpen}
        onClose={onMembersDrawerClose}
        openDeleteModal={() => setDeleteModalOpen(true)}
      />
      <DeleteGroupModal group={group} isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)} />
    </>
  )
}

const GroupsBoard = () => {
  const { t } = useTranslation()
  const { data: groups, isLoading, error, isFetched, fetchNextPage, hasNextPage, isFetchingNextPage } = useGroups()
  const hasError = !!error && !isLoading
  const noGroups = isFetched && (!groups || groups.length === 0) && !isLoading && !hasError
  const showAlert = hasError || noGroups
  const alertStatus = hasError ? 'error' : 'info'
  const alertTitle = hasError
    ? t('groups_board.load_error', { defaultValue: 'Unable to load groups' })
    : t('groups_board.no_groups', { defaultValue: 'No groups found' })
  const alertDescription = hasError
    ? error?.message?.toString()
    : t('groups_board.create_group', { defaultValue: 'Create a new group to get started.' })

  return (
    <>
      {isLoading && (
        <Progress.Root value={null}>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      )}
      {showAlert && <ListStateAlert show status={alertStatus} title={alertTitle} description={alertDescription} />}
      {!hasError && !isLoading && groups && groups.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </SimpleGrid>
      )}
      {hasNextPage && !hasError && !isLoading && groups && groups.length > 0 && (
        <Button
          mt={4}
          alignSelf='center'
          onClick={() => fetchNextPage()}
          loading={isFetchingNextPage}
          variant='outline'
        >
          {t('groups_board.load_more', { defaultValue: 'Load more' })}
        </Button>
      )}
    </>
  )
}

const Groups = () => {
  return (
    <Flex direction='column' gap={4}>
      <GroupsInfo />
      <GroupsBoard />
    </Flex>
  )
}

export default Groups

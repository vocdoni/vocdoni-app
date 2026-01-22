import {
  Box,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Checkbox,
  CloseButton,
  Divider,
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
  InputLeftElement,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Progress,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { PaginationProvider, usePagination } from '@vocdoni/react-providers'
import { Trans, useTranslation } from 'react-i18next'
import { LuCalendar, LuClock, LuEllipsis, LuEye, LuSearch, LuTrash, LuUsers, LuVote, LuX } from 'react-icons/lu'
import { generatePath, useNavigate } from 'react-router-dom'
import { DashboardBox } from '~components/shared/Dashboard/Contents'
import { ListStateAlert } from '~components/shared/Feedback/ListStateAlert'
import DeleteModal from '~components/shared/Modal/DeleteModal'
import { PaginatedTableFooter } from '~components/shared/Pagination/PaginatedTableFooter'
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

export const useNavigateToVote = () => {
  const navigate = useNavigate()

  return (groupId: string) => {
    const votePath = generatePath(Routes.processes.create, { groupId })
    navigate(votePath)
  }
}

const GroupsFilter = () => {
  const { t } = useTranslation()
  return (
    <InputGroup maxW='250px'>
      <InputLeftElement pointerEvents='none'>
        <Icon as={LuSearch} color='texts.subtle' />
      </InputLeftElement>
      <Input placeholder={t('groups_board.search', { defaultValue: 'Search groups...' })} />
    </InputGroup>
  )
}

const GroupsInfo = () => {
  const { t } = useTranslation()
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true })

  if (!isOpen) return null

  return (
    <DashboardBox position='relative' flexDirection='column' display='flex' gap={2} p={6} borderColor='table.border'>
      <CloseButton onClick={onClose} position='absolute' top={2} right={2} colorScheme='gray' size='sm' />
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

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size='sm'>
      <DrawerOverlay />
      <DrawerContent>
        <IconButton
          aria-label={t('drawer.close', 'Close drawer')}
          icon={<Icon as={LuX} />}
          position='absolute'
          top='6px'
          right='6px'
          onClick={onClose}
          variant='transparent'
        />
        <DrawerHeader>
          <Flex direction='column' gap={2}>
            <Heading size='md'>
              {t('groups_board.history.title', { defaultValue: '{{ title }} History', title: group.title })}
            </Heading>
            <Text color='texts.subtle' size='sm'>
              {t('groups_board.history.description', {
                defaultValue: 'View the history of this group and its associated censuses',
              })}
            </Text>
          </Flex>
        </DrawerHeader>
        <DrawerBody>
          <Flex justify='flex-end'>
            <Button variant='outline' onClick={onClose}>
              {t('groups_board.history.close', { defaultValue: 'Close' })}
            </Button>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

const GroupActions = ({ group, onMembersDrawerOpen, onDeleteModalOpen }: GroupActionsProps) => {
  const { t } = useTranslation()
  const navigateToVote = useNavigateToVote()
  const { isOpen: isHistoryOpen, onOpen: onHistoryOpen, onClose: onHistoryClose } = useDisclosure()

  return (
    <>
      <Menu placement='bottom-end'>
        <MenuButton
          as={IconButton}
          aria-label={t('actions.more', { defaultValue: 'More options' })}
          icon={<Icon as={LuEllipsis} />}
          variant='ghost'
          size='sm'
        />
        <MenuList minW='100px' fontSize='sm'>
          <MenuItem icon={<Icon boxSize={4} as={LuEye} />} onClick={onMembersDrawerOpen}>
            {t('group.actions.view_members', { defaultValue: 'View Members' })}
          </MenuItem>
          <MenuItem icon={<Icon boxSize={4} as={LuVote} />} onClick={() => navigateToVote(group.id)}>
            {t('group.actions.create_vote', { defaultValue: 'Create a Vote' })}
          </MenuItem>
          <MenuItem isDisabled icon={<Icon boxSize={4} as={LuClock} />} onClick={onHistoryOpen}>
            {t('group.actions.history', { defaultValue: 'History' })}
          </MenuItem>
          <MenuDivider />
          <MenuItem icon={<Icon boxSize={4} as={LuTrash} />} color='red.500' onClick={onDeleteModalOpen}>
            {t('group.actions.delete_group', { defaultValue: 'Delete Group' })}
          </MenuItem>
        </MenuList>
      </Menu>
      <HistoryDrawer group={group} isOpen={isHistoryOpen} onClose={onHistoryClose} />
    </>
  )
}

const GroupMembersTable = ({ groupId }: { groupId: string }) => {
  const { t } = useTranslation()
  const deleteGroupMembers = useUpdateGroup()
  const { isOpen, onOpen, onClose } = useDisclosure()
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
            <Button leftIcon={<Icon as={LuTrash} />} onClick={onOpen} size='sm' colorScheme='red' variant='outline'>
              {t('members.table.bulk_delete', { defaultValue: 'Delete' })}
            </Button>
          </>
        ) : (
          <Text fontSize='sm' color='texts.subtle'>
            <Trans i18nKey='members.table.select_hint' defaults='Select members to perform bulk actions' />
          </Text>
        )}
      </Flex>
      <TableContainer border='1px' borderRadius='sm' borderColor='table.border' overflowX='visible' overflowY='visible'>
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
            {isLoading && <Progress isIndeterminate />}
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
                  {columns.map((col) => (
                    <Th key={col.id}>{col.label}</Th>
                  ))}
                </Tr>
              </Thead>
              <Tbody>
                {data.map((member) => (
                  <Tr key={member.id}>
                    <Td>
                      <Checkbox
                        isChecked={isSelected(member.id)}
                        onChange={(e) => toggleOne(member.id, e.target.checked)}
                      />
                    </Td>
                    {columns.map((column) => (
                      <Td key={column.id}>{member[column.id]}</Td>
                    ))}
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Box p={4}>
              <PaginatedTableFooter />
            </Box>
          </>
        )}
      </TableContainer>
      <DeleteModal
        title={t('group.delete_member.title', { defaultValue: 'Delete Members' })}
        subtitle={t('group.delete_member.subtitle', {
          defaultValue: 'Are you sure you want to delete {{count}} members?',
          count: selectedRows.length,
        })}
        isOpen={isOpen}
        onClose={onClose}
      >
        <Flex justifyContent='flex-end' mt={4} gap={2}>
          <Button variant='outline' onClick={onClose}>
            {t('memberbase.delete_member.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button
            isLoading={deleteGroupMembers.isPending}
            shouldWrapChildren
            colorScheme='red'
            onClick={() => {
              onDeleteMember(selectedRows.map((row) => row.id))
              onClose()
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

  return (
    <Drawer isOpen={isOpen} onClose={onClose} size='lg'>
      <DrawerOverlay />
      <DrawerContent>
        <IconButton
          aria-label={t('drawer.close', 'Close drawer')}
          icon={<Icon as={LuX} />}
          position='absolute'
          top='6px'
          right='6px'
          onClick={onClose}
          variant='transparent'
        />
        <DrawerHeader>
          <Flex direction='column' gap={2}>
            <Heading size='md'>{group.title}</Heading>
            <Text color='texts.subtle' size='sm'>
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
          </Flex>
        </DrawerHeader>
        <DrawerBody>
          <GroupMembersDisplay group={group} isOpen={isOpen} />
          <Divider my={4} />
          <Flex direction='column' gap={4}>
            <Text fontWeight='extrabold' size='sm'>
              {t('group.actions_title', { defaultValue: 'Actions' })}
            </Text>
            <Text size='xs' color='texts.subtle'>
              {t('group.actions_description', {
                defaultValue:
                  "When a new vote is created, the system takes a snapshot of the group's members at that moment. Any changes to the member list afterward will not affect the created census.",
              })}
            </Text>
          </Flex>
          <Flex justify='space-between' mt={4}>
            <Button leftIcon={<Icon as={LuVote} boxSize={4} />} size='xs' onClick={() => navigateToVote(group.id)}>
              {t('group.create_vote', { defaultValue: 'Create a Vote' })}
            </Button>
            <Button leftIcon={<Icon as={LuTrash} boxSize={4} />} onClick={openDeleteModal} colorScheme='red' size='xs'>
              {t('group.delete_group', { defaultValue: 'Delete group' })}
            </Button>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

const GroupMembersDisplay = ({ group, isOpen }: GroupMembersProps) => {
  const initialPage = 1
  const { data, isLoading } = useGroupMembers(group.id, initialPage, isOpen)

  if (isLoading) return <Progress isIndeterminate />

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
        <GroupMembersTable groupId={group.id} />
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
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
        onClose()
      },
      onError: (error) => {
        toast({
          title: t('group.actions.delete_error', { defaultValue: 'Error deleting group' }),
          description: error.message,
          status: 'error',
          duration: 3000,
          isClosable: true,
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
          components={{ bold: <Text as='span' size='sm' fontWeight='extrabold' /> }}
          defaults='Are you sure you want to delete <bold>{{title}}</bold>? This action cannot be undone and will permanently remove the group from your organization.'
        />
      }
      isOpen={isOpen}
      onClose={onClose}
    >
      <Flex justifyContent='flex-end' mt={4} gap={2}>
        <Button variant='outline' onClick={onClose}>
          {t('group.actions.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button colorScheme='red' onClick={handleDelete}>
          {t('group.actions.delete', { defaultValue: 'Delete' })}
        </Button>
      </Flex>
    </DeleteModal>
  )
}

const GroupCard = ({ group }: GroupCardProps) => {
  const { t } = useTranslation()
  const navigateToVote = useNavigateToVote()
  const { isOpen: isMembersDrawerOpen, onOpen: onMembersDrawerOpen, onClose: onMembersDrawerClose } = useDisclosure()
  const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure()

  return (
    <>
      <Card variant='outline' borderColor='table.border' p={4} pt={2}>
        <CardHeader p={0}>
          <Flex justify='space-between' align='center'>
            <Heading size='md'>{group.title}</Heading>
            <GroupActions
              group={group}
              onMembersDrawerOpen={onMembersDrawerOpen}
              onDeleteModalOpen={onDeleteModalOpen}
            />
          </Flex>
        </CardHeader>
        <CardBody p={0}>
          <Flex direction='column' gap={2}>
            <Flex align='center' gap={2}>
              <Icon as={LuCalendar} boxSize={3.5} />
              <Text color='texts.subtle' size='sm'>
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
                size='sm'
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
            <Text size='sm' color='texts.subtle'>
              {group.description}
            </Text>
          </Flex>
        </CardBody>
        <CardFooter px={0} pb={0}>
          <Button
            w='full'
            size='xs'
            leftIcon={<Icon boxSize={4} as={LuVote} />}
            onClick={() => navigateToVote(group.id)}
          >
            <Text size='xs'>{t('group.create_vote', { defaultValue: 'Create a Vote' })}</Text>
          </Button>
        </CardFooter>
      </Card>
      <ViewMembersDrawer
        group={group}
        isOpen={isMembersDrawerOpen}
        onClose={onMembersDrawerClose}
        openDeleteModal={onDeleteModalOpen}
      />
      <DeleteGroupModal group={group} isOpen={isDeleteModalOpen} onClose={onDeleteModalClose} />
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
      {isLoading && <Progress isIndeterminate />}
      {showAlert && <ListStateAlert show status={alertStatus} title={alertTitle} description={alertDescription} />}
      {!hasError && !isLoading && groups && groups.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
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
          isLoading={isFetchingNextPage}
          shouldWrapChildren
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

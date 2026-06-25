import {
  Alert,
  Badge,
  Center,
  Flex,
  Icon,
  IconButton,
  Menu,
  Portal,
  Spinner,
  Stack,
  Table,
  Text,
} from '@chakra-ui/react'
import { LuEllipsisVertical } from 'react-icons/lu'
import { getApiErrorMessage } from '~platform/api/client'
import { useOrg } from '~platform/auth/useOrg'
import { toaster } from '~platform/components/ui/toaster'
import { useProfile } from '~platform/queries/profile'
import { useOrganizationRoles } from '~platform/queries/organization'
import {
  useCancelInvite,
  useOrgUsers,
  usePendingInvites,
  useRemoveUser,
  useResendInvite,
  useUpdateUserRole,
} from '~platform/queries/team'
import { InviteMemberButton } from './InviteMemberModal'

const roleLabel = (role: string, roles?: { role: string; name: string }[]) =>
  roles?.find((r) => r.role === role)?.name ?? role

const TeamTab = () => {
  const { isAdmin } = useOrg()
  const { data: profile } = useProfile()
  const { data: roles } = useOrganizationRoles()
  const users = useOrgUsers()
  const pending = usePendingInvites()
  const updateRole = useUpdateUserRole()
  const removeUser = useRemoveUser()
  const cancelInvite = useCancelInvite()
  const resendInvite = useResendInvite()

  const run = async (fn: () => Promise<unknown>, success: string) => {
    try {
      await fn()
      toaster.create({ type: 'success', title: success, closable: true })
    } catch (err) {
      toaster.create({ type: 'error', title: 'Action failed', description: getApiErrorMessage(err), closable: true })
    }
  }

  if (users.isLoading) {
    return (
      <Center py={12}>
        <Spinner />
      </Center>
    )
  }

  // The users/pending endpoints are admin-gated; a non-admin (manager) gets a 401 here.
  if (users.error) {
    return (
      <Alert.Root status='info'>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Team management is admin-only</Alert.Title>
          <Alert.Description>Only organization admins can view and manage team members.</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )
  }

  const members = users.data ?? []
  const invites = pending.data ?? []

  return (
    <Stack gap={5}>
      <Flex justify='space-between' align='center' gap={4} wrap='wrap'>
        <Text color='fg.muted' fontSize='sm'>
          People with access to this organization.
        </Text>
        {isAdmin && <InviteMemberButton />}
      </Flex>

      <Table.ScrollArea borderWidth='1px' borderRadius='md'>
        <Table.Root variant='outline'>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Name</Table.ColumnHeader>
              <Table.ColumnHeader>Email</Table.ColumnHeader>
              <Table.ColumnHeader>Role</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              {isAdmin && <Table.ColumnHeader textAlign='end'>Actions</Table.ColumnHeader>}
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {members.map((m) => {
              const isSelf = profile?.id === String(m.info.id)
              const name = [m.info.firstName, m.info.lastName].filter(Boolean).join(' ') || '-'
              return (
                <Table.Row key={`user-${m.info.id}`}>
                  <Table.Cell>
                    {name}
                    {isSelf && (
                      <Text as='span' color='fg.muted'>
                        {' '}
                        (you)
                      </Text>
                    )}
                  </Table.Cell>
                  <Table.Cell>{m.info.email}</Table.Cell>
                  <Table.Cell>
                    <Badge variant='subtle'>{roleLabel(m.role, roles)}</Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge colorPalette='green' variant='subtle'>
                      Active
                    </Badge>
                  </Table.Cell>
                  {isAdmin && (
                    <Table.Cell textAlign='end'>
                      <Menu.Root>
                        <Menu.Trigger asChild>
                          <IconButton aria-label='Member actions' variant='ghost' size='sm' disabled={isSelf}>
                            <Icon as={LuEllipsisVertical} />
                          </IconButton>
                        </Menu.Trigger>
                        <Portal>
                          <Menu.Positioner>
                            <Menu.Content>
                              {(roles ?? [])
                                .filter((r) => r.role !== m.role)
                                .map((r) => (
                                  <Menu.Item
                                    key={r.role}
                                    value={`role-${r.role}`}
                                    onClick={() =>
                                      run(
                                        () => updateRole.mutateAsync({ userId: m.info.id, role: r.role }),
                                        'Role updated'
                                      )
                                    }
                                  >
                                    Change role to {r.name}
                                  </Menu.Item>
                                ))}
                              <Menu.Item
                                value='remove'
                                color='fg.error'
                                onClick={() =>
                                  run(() => removeUser.mutateAsync({ userId: m.info.id }), 'Member removed')
                                }
                              >
                                Remove from organization
                              </Menu.Item>
                            </Menu.Content>
                          </Menu.Positioner>
                        </Portal>
                      </Menu.Root>
                    </Table.Cell>
                  )}
                </Table.Row>
              )
            })}

            {invites.map((inv) => (
              <Table.Row key={`invite-${inv.id}`}>
                <Table.Cell>-</Table.Cell>
                <Table.Cell>{inv.email}</Table.Cell>
                <Table.Cell>
                  <Badge variant='subtle'>{roleLabel(inv.role, roles)}</Badge>
                </Table.Cell>
                <Table.Cell>
                  <Badge colorPalette='orange' variant='subtle'>
                    Pending
                  </Badge>
                </Table.Cell>
                {isAdmin && (
                  <Table.Cell textAlign='end'>
                    <Menu.Root>
                      <Menu.Trigger asChild>
                        <IconButton aria-label='Invitation actions' variant='ghost' size='sm'>
                          <Icon as={LuEllipsisVertical} />
                        </IconButton>
                      </Menu.Trigger>
                      <Portal>
                        <Menu.Positioner>
                          <Menu.Content>
                            <Menu.Item
                              value='resend'
                              onClick={() =>
                                run(() => resendInvite.mutateAsync({ invitationId: inv.id }), 'Invitation resent')
                              }
                            >
                              Resend invitation
                            </Menu.Item>
                            <Menu.Item
                              value='cancel'
                              color='fg.error'
                              onClick={() =>
                                run(() => cancelInvite.mutateAsync({ invitationId: inv.id }), 'Invitation cancelled')
                              }
                            >
                              Cancel invitation
                            </Menu.Item>
                          </Menu.Content>
                        </Menu.Positioner>
                      </Portal>
                    </Menu.Root>
                  </Table.Cell>
                )}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Table.ScrollArea>
    </Stack>
  )
}

export default TeamTab

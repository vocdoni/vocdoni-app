import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  CloseButton,
  Dialog,
  type DialogRootProps,
  Field,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Menu,
  Progress,
  RadioGroup,
  Spinner,
  Stack,
  Text,
  useDisclosure,
  useRadioGroupContext,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query'
import { enforceHexPrefix, useClient } from '@vocdoni/react-providers'
import { formatDistanceToNow } from 'date-fns'
import { ComponentProps, ReactNode, useState } from 'react'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuEllipsis, LuMail, LuPlus, LuRefreshCw, LuUserCog, LuUserPlus } from 'react-icons/lu'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { ListStateAlert } from '~components/shared/Feedback/ListStateAlert'
import DeleteModal from '~components/shared/Modal/DeleteModal'
import { roleIcons } from '~shared/Layout/SaasSelector'
import { useToast } from '~shared/Toast'
import { useProfile } from '~src/queries/account'
import { QueryKeys } from '~src/queries/keys'
import { Role, useRemoveUserMutation, useRoles } from '~src/queries/organization'
import { InviteToTeamModal } from './Invite'

// Define types
type UserInfo = {
  id: number
  email: string
  firstName: string
  lastName: string
}

type ActiveUser = {
  info: UserInfo
  role: string
  expiration?: string
}

type PendingUser = {
  id: string
  email: string
  role: string
  expiration?: string
  info?: undefined
}

type User = ActiveUser | PendingUser

const isActiveUser = (user: User): user is ActiveUser => !!user.info

type UserModalProps<T extends User> = {
  user: T
} & Pick<DialogRootProps, 'open' | 'onOpenChange'>

type ActiveUserModalProps = UserModalProps<ActiveUser>
type PendingUserModalProps = UserModalProps<PendingUser>
type ChangeRoleDialogProps = ActiveUserModalProps

type UpdateRoleBody = {
  role: string
}

type UpdateRoleParams = {
  id: string
  body: UpdateRoleBody
}

type ChangeRoleFormProps = {
  user: ActiveUser
  onClose: () => void
}

type RoleRadioProps = ComponentProps<typeof RadioGroup.Item> & {
  fieldName: ReactNode
  description: ReactNode
  value: string
}

type RoleRadioGroupProps = {
  currentRole: string
}

type UsersResponse = {
  users: User[]
}

type PendingUsersResponse = {
  pending: PendingUser[]
}

type UserActionsProps = {
  user: User
}

type PendingActionsProps = {
  user: PendingUser
  closeMenu: () => void
  openCancelInvitation: () => void
}

type ActiveUserActionsProps = {
  openChangeRole: () => void
  openRemoveUser: () => void
}

type UsersListProps = {
  users: User[]
}

// Fetch hook for organization users
export const useUsers = ({
  options,
}: {
  options?: Omit<UseQueryOptions<UsersResponse>, 'queryKey' | 'queryFn'>
} = {}) => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()
  return useQuery({
    queryKey: QueryKeys.organization.users(enforceHexPrefix(account?.address)),
    queryFn: () =>
      bearedFetch<UsersResponse>(
        ApiEndpoints.OrganizationUsers.replace('{address}', enforceHexPrefix(account?.address))
      ),
    ...options,
    select: (data) => data.users,
  })
}

// Fetch hook for pending users
export const usePendingUsers = ({
  options,
}: {
  options?: Omit<UseQueryOptions<PendingUsersResponse>, 'queryKey' | 'queryFn'>
} = {}) => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()
  return useQuery({
    queryKey: QueryKeys.organization.pendingUsers(enforceHexPrefix(account?.address)),
    queryFn: () =>
      bearedFetch<PendingUsersResponse>(
        ApiEndpoints.OrganizationPendingUsers.replace('{address}', enforceHexPrefix(account?.address))
      ),
    ...options,
    select: (data) => data.pending,
  })
}

export const useAllUsers = () => {
  const { data: usersData, isLoading: usersLoading, isError: isUsersError, error: usersError } = useUsers()

  const {
    data: pendingData,
    isLoading: pendingLoading,
    isError: pendingError,
    error: pendingFetchError,
  } = usePendingUsers()

  return {
    users: [...(usersData || []), ...(pendingData || [])],
    isLoading: usersLoading || pendingLoading,
    isError: isUsersError || pendingError,
    error: usersError || pendingFetchError,
  }
}

const useUpdateRole = () => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()
  const client = useQueryClient()

  return useMutation<void, Error, UpdateRoleParams>({
    mutationFn: async ({ id, body }) =>
      await bearedFetch<void>(
        ApiEndpoints.OrganizationUser.replace('{address}', enforceHexPrefix(account?.address)).replace('{userId}', id),
        {
          method: 'PUT',
          body,
        }
      ),
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: QueryKeys.organization.users(),
      })
    },
  })
}

const useCancelInvitation = () => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()
  const client = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) =>
      await bearedFetch<void>(
        ApiEndpoints.OrganizationPendingUser.replace('{address}', enforceHexPrefix(account?.address)).replace(
          '{inviteId}',
          id
        ),
        { method: 'DELETE' }
      ),
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: QueryKeys.organization.pendingUsers(),
      })
    },
  })
}

const useResendInvitationMutation = () => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()

  return useMutation<void, Error, string>({
    mutationFn: async (id) =>
      await bearedFetch<void>(
        ApiEndpoints.OrganizationPendingUser.replace('{address}', enforceHexPrefix(account?.address)).replace(
          '{inviteId}',
          id
        ),
        {
          method: 'PUT',
        }
      ),
  })
}

const RoleRadio = ({ fieldName: title, description, value, disabled, ...props }: RoleRadioProps) => {
  const group = useRadioGroupContext()
  const isSelected = group?.value === value

  return (
    <RadioGroup.Item
      value={value}
      disabled={disabled}
      border='1px solid'
      borderRadius='md'
      borderColor={isSelected && 'gray.400'}
      p={2}
      cursor={disabled ? 'not-allowed' : 'pointer'}
      opacity={disabled ? 0.6 : 1}
      _hover={!disabled ? { borderColor: 'gray.400' } : undefined}
      {...props}
    >
      <RadioGroup.ItemHiddenInput />
      <Flex align='start' gap={4}>
        <RadioGroup.ItemIndicator mt={1} />
        <Box flex='1'>
          <Flex gap={2} align='center' mb={1}>
            <Text>{roleIcons[value]}</Text>
            <RadioGroup.ItemText as='span' fontWeight='semibold'>
              {title}
            </RadioGroup.ItemText>
          </Flex>
          <Text fontSize='sm' color='texts.subtle'>
            {description}
          </Text>
        </Box>
      </Flex>
    </RadioGroup.Item>
  )
}

const getRoleDescription = (role: Role) => {
  const hasOrgPermission = role.organizationWritePermission
  const hasProcessPermission = role.processWritePermission

  if (hasOrgPermission && hasProcessPermission) {
    return (
      <Trans i18nKey='role.full_access.description' defaults='Full access to all organization settings and members.' />
    )
  } else if (hasOrgPermission || hasProcessPermission) {
    return (
      <Trans
        i18nKey='role.manage_members_votes.description'
        defaults='Can manage members, groups, censuses, and voting processes.'
      />
    )
  }

  return <Trans i18nKey='role.read_only.description' defaults='Read-only access to organization data.' />
}

const RoleRadioGroup = ({ currentRole }: RoleRadioGroupProps) => {
  const { t } = useTranslation()
  const { data: roles, isLoading: rolesLoading, isError: rolesError, error: rolesFetchError } = useRoles()
  const { control, getValues } = useFormContext()

  console.log('values:', getValues())

  if (rolesError) return <Alert.Root status='error'>{rolesFetchError?.message || t('error.loading_roles')}</Alert.Root>

  return (
    <Field.Root>
      <Field.Label fontSize='sm'>{t('role.update.new_role', { defaultValue: 'New role' })}</Field.Label>
      {rolesLoading && (
        <Progress.Root value={null}>
          <Progress.Track>
            <Progress.Range />
          </Progress.Track>
        </Progress.Root>
      )}
      <Controller
        name='role'
        control={control}
        render={({ field }) => (
          <RadioGroup.Root value={field.value} onValueChange={({ value }) => field.onChange(value)} colorPalette='gray'>
            <Stack direction='column' gap={2}>
              {roles?.map((role: Role) => (
                <RoleRadio
                  key={role.role}
                  value={role.role}
                  fieldName={role.name}
                  // disabled={role.role === currentRole}
                  description={getRoleDescription(role)}
                />
              ))}
            </Stack>
          </RadioGroup.Root>
        )}
      />
    </Field.Root>
  )
}

const ChangeRoleForm = ({ user, onClose }: ChangeRoleFormProps) => {
  const toast = useToast()
  const { t } = useTranslation()
  const methods = useForm<UpdateRoleBody>({
    defaultValues: {
      role: user.role,
    },
  })
  const updateRole = useUpdateRole()

  const onSubmit = (body: UpdateRoleBody) => {
    updateRole.mutate(
      { id: user?.info.id.toString(), body },
      {
        onSuccess: (): void => {
          toast({
            title: t('role.update.success', { defaultValue: 'Role updated successfully' }),
            type: 'success',
            duration: 5000,
            isClosable: true,
          })
          onClose()
        },
        onError: (error: Error): void => {
          toast({
            title: t('role.update.error', { defaultValue: 'Error updating role' }),
            description: error.message,
            type: 'error',
            duration: 5000,
            isClosable: true,
          })
        },
      }
    )
  }

  const currentRole = user?.role
  const fullName = `${user?.info?.firstName} ${user?.info?.lastName}`

  return (
    <FormProvider {...methods}>
      <Flex as='form' direction='column' gap={4} onSubmit={methods.handleSubmit(onSubmit)}>
        <Flex border='1px solid' borderColor='table.border' p={4} borderRadius='md' alignItems='center'>
          <Avatar.Root>
            <Avatar.Fallback name={fullName} />
          </Avatar.Root>
          <Box ml='3'>
            <HStack align='center'>
              <Text fontWeight='bold'>{fullName}</Text>
            </HStack>
            <Flex direction='column'>
              <Text fontSize='sm' color='texts.subtle'>
                {user?.info.email}
              </Text>
            </Flex>
          </Box>
        </Flex>
        <Text fontSize='sm' fontWeight='bold'>
          {t('role.update.current_role', {
            defaultValue: 'Current Role',
          })}
        </Text>
        <Box p={2} border='1px solid' borderColor='table.border' borderRadius='md'>
          <Flex gap={2} align='center'>
            <Text>{roleIcons[currentRole]}</Text>
            <Text fontWeight='semibold' textTransform='capitalize'>
              {currentRole}
            </Text>
          </Flex>
        </Box>
        <RoleRadioGroup currentRole={currentRole} />
        <Flex gap={2} justifyContent='flex-end' mt={4}>
          <Button variant='outline' onClick={onClose}>
            {t('role.update.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button loading={updateRole.isPending} type='submit'>
            {t('role.update.save', {
              defaultValue: 'Update role',
            })}
          </Button>
        </Flex>
      </Flex>
    </FormProvider>
  )
}

const ChangeRoleModal = ({ open, onOpenChange, user }: ChangeRoleDialogProps) => {
  const { t } = useTranslation()
  const onClose = () => onOpenChange({ open: false })

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} closeOnInteractOutside={false}>
      <Dialog.Backdrop />
      <Dialog.Positioner display='flex' alignItems='center' justifyContent='center'>
        <Dialog.Content maxW='xl' py={4}>
          <Dialog.CloseTrigger>
            <CloseButton />
          </Dialog.CloseTrigger>
          <Dialog.Header>
            <Dialog.Title>
              <Heading variant='header'>{t('role.update.title', { defaultValue: 'Change team member role' })}</Heading>
            </Dialog.Title>
            <Text variant='subheader'>
              <Trans i18nKey='role.update.subtitle'>
                Update the permissions for this team member by changing their role.
              </Trans>
            </Text>
          </Dialog.Header>
          <Dialog.Body>
            <ChangeRoleForm user={user} onClose={onClose} />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

const RemoveUserModal = ({ open, onOpenChange, user }: ActiveUserModalProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const removeUser = useRemoveUserMutation()
  const onClose = () => onOpenChange({ open: false })

  const id = user.info?.id

  const removeUserHandler = () => {
    removeUser.mutate(id, {
      onSuccess: () => {
        toast({
          title: t('team.remove_member.success', { defaultValue: 'Member removed successfully' }),
          type: 'success',
          duration: 5000,
          isClosable: true,
        })
        onClose()
      },
      onError: (error: Error) => {
        toast({
          title: t('team.remove_member.error', { defaultValue: 'Error removing member' }),
          description: error.message,
          type: 'error',
          duration: 5000,
          isClosable: true,
        })
      },
    })
  }

  return (
    <DeleteModal
      title={t('team.remove_member.title', { defaultValue: 'Are you sure?' })}
      subtitle={t('team.remove_member.confirmation', {
        defaultValue: 'This will remove {{name}} from your team. They will no longer have access to your organization.',
        name: `${user.info.firstName} ${user.info.lastName}`,
      })}
      open={open}
      onOpenChange={({ open }) => onOpenChange({ open })}
    >
      <Flex justifyContent='flex-end' mt={4} gap={2}>
        <Button variant='outline' onClick={onClose}>
          {t('team.remove_member.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button loading={removeUser.isPending} colorPalette='red' onClick={removeUserHandler}>
          {t('team.remove_member.confirm', { defaultValue: 'Remove' })}
        </Button>
      </Flex>
    </DeleteModal>
  )
}

const CancelInvitationModal = ({ open, onOpenChange, user }: PendingUserModalProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const cancelInvitation = useCancelInvitation()
  const onClose = () => onOpenChange({ open: false })

  const cancelInvitationHandler = () => {
    cancelInvitation.mutate(user.id, {
      onSuccess: () => {
        toast({
          title: t('team.actions.cancel_invitation_success', { defaultValue: 'Invitation cancelled successfully' }),
          type: 'success',
          duration: 5000,
          isClosable: true,
        })
        onClose()
      },
      onError: (error: Error) => {
        toast({
          title: t('team.actions.cancel_invitation_error', { defaultValue: 'Error cancelling invitation' }),
          description: error.message,
          type: 'error',
          duration: 5000,
          isClosable: true,
        })
      },
    })
  }

  return (
    <DeleteModal
      title={t('team.cancel_invitation.title', { defaultValue: 'Are you sure?' })}
      subtitle={t('team.cancel_invitation.confirmation', {
        defaultValue: 'This will cancel the invitation. The person will not be able to join your organization.',
      })}
      open={open}
      onOpenChange={({ open }) => onOpenChange({ open })}
    >
      <Flex justifyContent='flex-end' mt={4} gap={2}>
        <Button variant='outline' onClick={onClose}>
          {t('team.cancel_invitation.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Button loading={cancelInvitation.isPending} colorPalette='red' onClick={cancelInvitationHandler}>
          {t('team.cancel_invitation.confirm', { defaultValue: 'Cancel invitation' })}
        </Button>
      </Flex>
    </DeleteModal>
  )
}

const PendingInvitationActions = ({ user, closeMenu, openCancelInvitation }: PendingActionsProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const resendInvitation = useResendInvitationMutation()
  const isLoading = resendInvitation.isPending

  const resendInvitationHandler = () => {
    resendInvitation.mutate(user.id, {
      onSuccess: () => {
        toast({
          title: t('team.actions.resend_invitation_success', {
            defaultValue: 'Invitation resent to {{email}} successfully',
            email: user?.email,
          }),
          type: 'success',
          duration: 5000,
          isClosable: true,
        })
        closeMenu()
      },
      onError: (error: Error) => {
        toast({
          title: t('team.actions.resend_invitation_error', {
            defaultValue: 'Error resending invitation to {{email}}',
            email: user?.email,
          }),
          description: error.message,
          type: 'error',
          duration: 5000,
          isClosable: true,
        })
      },
    })
  }

  return (
    <>
      <Menu.Item value='resend-invitation' fontSize='sm' disabled={isLoading} onClick={resendInvitationHandler}>
        <HStack gap={2}>
          {isLoading ? <Spinner size='xs' /> : <Icon as={LuRefreshCw} />}
          <Text as='span'>{t('team.actions.resend_invitation', { defaultValue: 'Resend Invitation' })}</Text>
        </HStack>
      </Menu.Item>
      <Menu.Item
        value='cancel-invitation'
        color='red'
        fontSize='sm'
        disabled={isLoading}
        onClick={openCancelInvitation}
      >
        {t('team.actions.cancel_invitation', { defaultValue: 'Cancel Invitation' })}
      </Menu.Item>
    </>
  )
}

const ActiveUserActions = ({ openChangeRole, openRemoveUser }: ActiveUserActionsProps) => {
  const { t } = useTranslation()

  return (
    <>
      <Menu.Item value='change-role' onClick={openChangeRole} fontSize='sm'>
        <HStack gap={2}>
          <Icon boxSize={4} as={LuUserCog} />
          <Text as='span'>{t('team.actions.change_role', { defaultValue: 'Change role' })}</Text>
        </HStack>
      </Menu.Item>
      <Menu.Separator />
      <Menu.Item value='remove-user' color='red.400' fontSize='sm' onClick={openRemoveUser}>
        {t('team.actions.remove_user', { defaultValue: 'Remove user' })}
      </Menu.Item>
    </>
  )
}

const UserActions = ({ user }: UserActionsProps) => {
  const { t } = useTranslation()
  const { data: profile, isLoading } = useProfile()
  const { open: isMenuOpen, onOpen: openMenu, onClose: closeMenu } = useDisclosure()
  const [isRoleModalOpen, setRoleModalOpen] = useState(false)
  const [isRemoveUserModalOpen, setRemoveUserModalOpen] = useState(false)
  const [isCancelInvitationModalOpen, setCancelInvitationModalOpen] = useState(false)
  const openChangeRole = () => {
    setRoleModalOpen(true)
    closeMenu()
  }
  const openRemoveUser = () => {
    setRemoveUserModalOpen(true)
    closeMenu()
  }
  const openCancelInvitation = () => {
    setCancelInvitationModalOpen(true)
    closeMenu()
  }

  const isCurrentUser = String(user.info?.id) === String(profile?.id)

  if (isCurrentUser) return null

  return (
    <>
      <Menu.Root
        closeOnSelect={false}
        open={isMenuOpen}
        onOpenChange={({ open }) => (open ? openMenu() : closeMenu())}
        positioning={{ placement: 'bottom-end' }}
      >
        <Menu.Trigger asChild>
          <IconButton
            loading={isLoading}
            ml='auto'
            variant='ghost'
            aria-label={t('team.actions.options', { defaultValue: 'Options' })}
            onClick={openMenu}
          >
            <Icon as={LuEllipsis} />
          </IconButton>
        </Menu.Trigger>
        <Menu.Positioner>
          <Menu.Content minW='unset'>
            <Menu.ItemGroup>
              <Menu.ItemGroupLabel>{t('team.actions.title', { defaultValue: 'Actions' })}</Menu.ItemGroupLabel>
              {isActiveUser(user) ? (
                <ActiveUserActions openChangeRole={openChangeRole} openRemoveUser={openRemoveUser} />
              ) : (
                <PendingInvitationActions
                  user={user}
                  openCancelInvitation={openCancelInvitation}
                  closeMenu={closeMenu}
                />
              )}
            </Menu.ItemGroup>
          </Menu.Content>
        </Menu.Positioner>
      </Menu.Root>
      {isActiveUser(user) ? (
        <>
          <ChangeRoleModal open={isRoleModalOpen} onOpenChange={({ open }) => setRoleModalOpen(open)} user={user} />
          <RemoveUserModal
            open={isRemoveUserModalOpen}
            onOpenChange={({ open }) => setRemoveUserModalOpen(open)}
            user={user}
          />
        </>
      ) : (
        <CancelInvitationModal
          open={isCancelInvitationModalOpen}
          onOpenChange={({ open }) => setCancelInvitationModalOpen(open)}
          user={user}
        />
      )}
    </>
  )
}

const UsersEmpty = () => {
  const { t } = useTranslation()

  return (
    <Flex alignItems='center' p={10} gap={6} flexDirection='column'>
      <Flex alignItems='center' flexDirection='column'>
        <Icon as={LuUserPlus} boxSize={20} color='texts.subtle' />
        <Text fontSize='lg' fontWeight='bold'>
          {t('team.only_one_member.title', { defaultValue: "You're the only team member of this organization" })}
        </Text>
        <Text color='texts.subtle'>
          {t('team.only_one_member.subtitle', {
            defaultValue: 'Add team members to collaborate on your organization',
          })}
        </Text>
      </Flex>
      <InviteToTeamModal leftIcon={<Icon mr={2} as={LuPlus} />} whiteSpace='normal'>
        {t('team.only_one_member.add_team_member', { defaultValue: 'Add team member' })}
      </InviteToTeamModal>
    </Flex>
  )
}

const UsersList = ({ users }: UsersListProps) => {
  const { t } = useTranslation()

  return (
    <Flex direction='column'>
      {users.map((user, i) => {
        const isActive = isActiveUser(user)
        const name = isActive
          ? `${user.info.firstName} ${user.info.lastName}`
          : t('team.pending_invitation', { defaultValue: 'Invitation Pending' })
        const email = isActive ? user.info.email : user.email
        const avatarName = isActive && `${user.info.firstName} ${user.info.lastName}`

        return (
          <Flex alignItems='center' p={2} key={i}>
            <Avatar.Root>{!isActive ? <Avatar.Icon as={LuMail} /> : <Avatar.Fallback name={avatarName} />}</Avatar.Root>
            <Box ml='3'>
              <HStack align='center'>
                <Text fontWeight='bold'>{name}</Text>
                <Badge variant='surface' textTransform='capitalize'>
                  {user.role}
                </Badge>
              </HStack>
              <Flex direction='column'>
                <Text fontSize='sm' color='texts.subtle'>
                  {email}
                </Text>
                {user.expiration && (
                  <Text fontSize='xs' color='texts.subtle'>
                    {t('team.expires_in', {
                      defaultValue: 'Expires in {{time}}',
                      time: formatDistanceToNow(new Date(user.expiration)),
                    })}
                  </Text>
                )}
              </Flex>
            </Box>
            <UserActions user={user} />
          </Flex>
        )
      })}
    </Flex>
  )
}

export const OrganizationUsers = () => {
  const { t } = useTranslation()
  const { users, isLoading, isError, error } = useAllUsers()
  const hasError = isError && !isLoading
  const isEmpty = users.length === 0 && !isLoading && !hasError
  const showAlert = hasError || isEmpty
  const alertTitle = hasError
    ? t('team.load_error', { defaultValue: 'Unable to load team members' })
    : t('team.empty', { defaultValue: 'No team members found' })
  const alertDescription = hasError
    ? error instanceof Error
      ? error.message
      : t('team.load_error_description', { defaultValue: 'Please try again.' })
    : t('team.empty_description', { defaultValue: 'Invite teammates to get started.' })

  if (isLoading) {
    return (
      <Progress.Root value={null}>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    )
  }

  return (
    <>
      {showAlert && (
        <ListStateAlert show status={hasError ? 'error' : 'info'} title={alertTitle} description={alertDescription} />
      )}
      {!hasError && (users.length === 1 ? <UsersEmpty /> : users.length > 1 ? <UsersList users={users} /> : null)}
    </>
  )
}

import { Button, CloseButton, Dialog, Field, Icon, Input, NativeSelect, Portal, Stack } from '@chakra-ui/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { LuUserPlus } from 'react-icons/lu'
import { getApiErrorMessage } from '~platform/api/client'
import { toaster } from '~platform/components/ui/toaster'
import { useOrganizationRoles } from '~platform/queries/organization'
import { useInviteMember } from '~platform/queries/team'

type FormData = { email: string; role: string }

/** Admin-only "invite team member" action: email + role, posted to the org users endpoint. */
export const InviteMemberButton = () => {
  const [open, setOpen] = useState(false)
  const invite = useInviteMember()
  const { data: roles } = useOrganizationRoles()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ defaultValues: { email: '', role: '' } })

  const onSubmit = async (values: FormData) => {
    try {
      await invite.mutateAsync(values)
      toaster.create({ type: 'success', title: 'Invitation sent', closable: true })
      reset()
      setOpen(false)
    } catch (err) {
      toaster.create({
        type: 'error',
        title: 'Could not send invitation',
        description: getApiErrorMessage(err),
        closable: true,
      })
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)} placement='center'>
      <Dialog.Trigger asChild>
        <Button size='sm'>
          <Icon as={LuUserPlus} />
          Invite member
        </Button>
      </Dialog.Trigger>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content as='form' onSubmit={handleSubmit(onSubmit)}>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
            <Dialog.Header>
              <Dialog.Title>Invite team member</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Field.Root invalid={!!errors.email} required>
                  <Field.Label>Email</Field.Label>
                  <Input
                    type='email'
                    placeholder='colleague@example.com'
                    {...register('email', { required: 'Email is required' })}
                  />
                  <Field.ErrorText>{errors.email?.message}</Field.ErrorText>
                </Field.Root>

                <Field.Root invalid={!!errors.role} required>
                  <Field.Label>Role</Field.Label>
                  <NativeSelect.Root>
                    <NativeSelect.Field
                      placeholder='Select a role'
                      {...register('role', { required: 'Role is required' })}
                    >
                      {(roles ?? []).map((r) => (
                        <option key={r.role} value={r.role}>
                          {r.name}
                        </option>
                      ))}
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                  </NativeSelect.Root>
                  <Field.ErrorText>{errors.role?.message}</Field.ErrorText>
                </Field.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button variant='ghost' onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type='submit' loading={invite.isPending}>
                Send invitation
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

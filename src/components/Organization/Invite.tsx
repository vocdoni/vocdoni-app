import { Button, ButtonProps, CloseButton, Dialog, Flex, HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import InputBasic from '~components/Form/InputBasic'
import { RoleSelector, SelectOptionType } from '~components/Layout/SaasSelector'
import { teamWriterLimitErrorMessage, teamWriterLimitMessage } from '~components/Pricing/payment-errors'
import { useToast } from '~components/Toast'
import { MaxWritersPerOrg } from '~constants'
import { useInviteMemberMutation } from '~src/queries/organization'
import { useAllUsers } from './Team'

// Only admins and managers count against MaxWritersPerOrg; viewers are never limited.
const isWriterRole = (role: string) => ['admin', 'manager'].includes(role.toLowerCase())

// Invite form component
const InviteForm = ({ writersFull }: { writersFull: boolean }) => {
  const { t } = useTranslation()
  const toast = useToast()
  const mutation = useInviteMemberMutation()

  const methods = useForm({
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = (data) =>
    mutation.mutate(
      { email: data.email, role: data.role.value },
      {
        onSuccess: () => {
          toast({
            title: t('invite.success', { defaultValue: 'Invitation sent successfully!' }),
            description: t('invite.user_invited', { defaultValue: 'Email sent to {{email}}', email: data.email }),
            type: 'success',
            duration: 5000,
            isClosable: true,
          })
        },
        onError: (error: Error) => {
          toast({
            title: t('invite.error', { defaultValue: 'Error' }),
            description: teamWriterLimitErrorMessage(t, error) ?? error.message,
            type: 'error',
            duration: 5000,
            isClosable: true,
          })
        },
      }
    )

  return (
    <FormProvider {...methods}>
      <Flex as='form' onSubmit={methods.handleSubmit(onSubmit)} flexDirection='column' gap={6}>
        <InputBasic
          formValue='email'
          label={t('email')}
          placeholder={t('email_placeholder', { defaultValue: 'your@email.com' })}
          type='email'
          required
        />
        <RoleSelector
          name='role'
          required
          helper={writersFull ? teamWriterLimitMessage(t) : undefined}
          isOptionDisabled={(option: SelectOptionType) => writersFull && isWriterRole(option.value)}
        />
        <Flex justifyContent='flex-end' gap={2}>
          <Dialog.ActionTrigger asChild>
            <Button colorPalette='gray' variant='outline'>
              <Trans i18nKey='cancel'>Cancel</Trans>
            </Button>
          </Dialog.ActionTrigger>
          <Button type='submit' loading={mutation.isPending}>
            <Trans i18nKey='send_invitation'>Send invitation</Trans>
          </Button>
        </Flex>
      </Flex>
    </FormProvider>
  )
}

export const InviteToTeamModal = ({
  leftIcon,
  children,
  ...props
}: ButtonProps & { leftIcon?: React.ReactNode; children?: React.ReactNode }) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()
  const { users, isLoading } = useAllUsers()
  // Pending invitations take a slot until they expire, as the backend counts them.
  const now = new Date()
  const writers = users.filter(
    (user) => isWriterRole(user.role) && (!!user.info || !user.expiration || new Date(user.expiration) > now)
  )
  const writersFull = writers.length >= MaxWritersPerOrg

  return (
    <Dialog.Root open={open} onOpenChange={(details) => setOpen(details.open)}>
      <Dialog.Trigger asChild>
        <Button {...props} loading={isLoading} loadingText={t('loading')}>
          {leftIcon ? (
            <HStack gap={2}>
              {leftIcon}
              <Text as='span'>{children}</Text>
            </HStack>
          ) : (
            children
          )}
        </Button>
      </Dialog.Trigger>
      <Dialog.Backdrop />
      <Dialog.Positioner display='flex' alignItems='center' justifyContent='center'>
        <Dialog.Content maxW='xl'>
          <Dialog.CloseTrigger asChild>
            <CloseButton size='sm' />
          </Dialog.CloseTrigger>
          <Dialog.Header display='flex' flexDirection='column' alignItems='flex-start' gap={1}>
            <Dialog.Title>
              <Trans i18nKey='invite.title'>Add team member</Trans>
            </Dialog.Title>
            <Text variant='subheader'>
              <Trans i18nKey='invite.subtitle'>
                Send an invitation to join your organization. They'll receive an email with instructions.
              </Trans>
            </Text>
          </Dialog.Header>
          <Dialog.Body>
            <InviteForm writersFull={writersFull} />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

import { Button, ButtonProps, CloseButton, Dialog, Flex, HStack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { useSubscription } from '~components/Auth/Subscription'
import { usePricingModal } from '~components/Pricing/use-pricing-modal'
import { SubscriptionPermission } from '~constants'
import InputBasic from '~shared/Form/InputBasic'
import { RoleSelector } from '~shared/Layout/SaasSelector'
import { useToast } from '~shared/Toast'
import { useInviteMemberMutation } from '~src/queries/organization'
import { useCallbackContext } from '~utils/callback-provider'
import { useAllUsers } from './Team'

// Invite form component
const InviteForm = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const mutation = useInviteMemberMutation()
  const { success } = useCallbackContext()

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
          success()
        },
        onError: (error: Error) => {
          toast({
            title: t('invite.error', { defaultValue: 'Error' }),
            description: error.message,
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
        <RoleSelector name='role' required />
        <Flex justifyContent='flex-end' gap={2}>
          <Dialog.ActionTrigger asChild>
            <Button colorScheme='gray' variant='outline'>
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
  const { permission } = useSubscription()
  const { t } = useTranslation()
  const { users, isLoading } = useAllUsers()
  const { openModal } = usePricingModal()

  const memberships = permission(SubscriptionPermission.Users)
  const canInvite = memberships > (users?.length || 0)

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => {
        if (details.open && !canInvite) return
        setOpen(details.open)
      }}
    >
      <Dialog.Trigger asChild>
        <Button
          onClick={(e) => {
            if (!canInvite) {
              e.preventDefault()
              openModal('planUpgrade', {
                context: 'collaboration',
                limit: t('number_of_members', {
                  defaultValue: '{{ count }} team member',
                  count: memberships,
                }),
              })
            }
          }}
          {...props}
          loading={isLoading}
          loadingText={t('loading')}
        >
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
            <InviteForm />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

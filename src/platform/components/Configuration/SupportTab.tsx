import { Button, Field, Input, NativeSelect, Stack, Text, Textarea } from '@chakra-ui/react'
import { useForm } from 'react-hook-form'
import { getApiErrorMessage } from '~platform/api/client'
import { toaster } from '~platform/components/ui/toaster'
import { SupportTicket, useSendTicket } from '~platform/queries/support'

// Ticket categories accepted by the backend (free-form value). Confirm the canonical list with
// the backend team if it grows.
const TICKET_TYPES = [
  { value: 'technical', label: 'Technical issue' },
  { value: 'billing', label: 'Billing' },
  { value: 'feature_request', label: 'Feature request' },
  { value: 'other', label: 'Other' },
]

const SupportTab = () => {
  const send = useSendTicket()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupportTicket>({ defaultValues: { type: '', title: '', description: '' } })

  const onSubmit = async (values: SupportTicket) => {
    try {
      await send.mutateAsync(values)
      toaster.create({ type: 'success', title: 'Support ticket submitted', closable: true })
      reset()
    } catch (err) {
      toaster.create({
        type: 'error',
        title: 'Could not submit ticket',
        description: getApiErrorMessage(err),
        closable: true,
      })
    }
  }

  return (
    <Stack as='form' gap={4} maxW='2xl' onSubmit={handleSubmit(onSubmit)}>
      <Text color='fg.muted' fontSize='sm'>
        Open a support ticket and our team will get back to you by email.
      </Text>

      <Field.Root invalid={!!errors.title} required>
        <Field.Label>Title</Field.Label>
        <Input placeholder='Short summary' {...register('title', { required: 'Title is required' })} />
        <Field.ErrorText>{errors.title?.message}</Field.ErrorText>
      </Field.Root>

      <Field.Root invalid={!!errors.type} required>
        <Field.Label>Type</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field placeholder='Select a category' {...register('type', { required: 'Type is required' })}>
            {TICKET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
        <Field.ErrorText>{errors.type?.message}</Field.ErrorText>
      </Field.Root>

      <Field.Root invalid={!!errors.description} required>
        <Field.Label>Description</Field.Label>
        <Textarea
          rows={6}
          placeholder='Describe your issue or request in detail'
          {...register('description', { required: 'Description is required' })}
        />
        <Field.ErrorText>{errors.description?.message}</Field.ErrorText>
      </Field.Root>

      <Button type='submit' alignSelf='flex-start' loading={send.isPending}>
        Submit ticket
      </Button>
    </Stack>
  )
}

export default SupportTab

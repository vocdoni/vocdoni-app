import { Alert, Button, Code, Field, Input, Spinner, Stack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { getApiErrorMessage } from '~platform/api/client'
import { useOrg } from '~platform/auth/OrgContext'
import { toaster } from '~platform/components/ui/toaster'
import { useOrganization, useUpdateOrganization, UpdateOrganizationBody } from '~platform/queries/organization'

const OrgDetailsTab = () => {
  const { isAdmin } = useOrg()
  const { data, isLoading, error } = useOrganization()
  const update = useUpdateOrganization()

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<UpdateOrganizationBody>()

  // Pre-fill the form once the organization details load (and after a successful save).
  useEffect(() => {
    if (data) {
      reset({ website: data.website })
    }
  }, [data, reset])

  if (isLoading) return <Spinner />

  if (error || !data) {
    return (
      <Alert.Root status='error'>
        <Alert.Indicator />
        <Alert.Title>Unable to load organization details</Alert.Title>
      </Alert.Root>
    )
  }

  const onSubmit = async (values: UpdateOrganizationBody) => {
    try {
      await update.mutateAsync(values)
      toaster.create({ type: 'success', title: 'Organization updated', closable: true })
    } catch (err) {
      toaster.create({
        type: 'error',
        title: 'Could not update organization',
        description: getApiErrorMessage(err),
        closable: true,
      })
    }
  }

  return (
    <Stack as='form' gap={4} maxW='2xl' onSubmit={handleSubmit(onSubmit)}>
      {!isAdmin && (
        <Alert.Root status='info'>
          <Alert.Indicator />
          <Alert.Title>Only organization admins can edit these details.</Alert.Title>
        </Alert.Root>
      )}

      <Field.Root>
        <Field.Label>Address</Field.Label>
        <Code>{data.address}</Code>
      </Field.Root>

      <Field.Root>
        <Field.Label>Website</Field.Label>
        <Input placeholder='https://...' disabled={!isAdmin} {...register('website')} />
      </Field.Root>

      {isAdmin && (
        <Button type='submit' alignSelf='flex-start' loading={update.isPending} disabled={!isDirty}>
          Save changes
        </Button>
      )}
    </Stack>
  )
}

export default OrgDetailsTab

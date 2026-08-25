import { Button, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { organizationQueryKeys } from '@vocdoni/react-components'
import { useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useSaasAccount } from '~components/Account/SaasAccountProvider'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { DashboardBox } from '~components/Dashboard/Contents'
import { HSeparator } from '~components/Layout/Separators'
import { AvatarUploader } from '~components/Layout/Uploader'
import { CreateOrgParams } from '~components/Organization/AccountTypes'
import { useToast } from '~components/Toast'
import { SetupStepIds, useOrganizationSetup } from '~src/queries/organization'
import { PrivateOrgForm, PrivateOrgFormData, PublicOrgForm } from './Form'

// The form field is named `avatar` (shared AvatarUploader + read-side adapter shape),
// but it maps to the API `logo` field on submit, so it is omitted from the derived body
// type and re-added here as the form-only field.
type FormData = PrivateOrgFormData & Omit<CreateOrgParams, 'size' | 'type' | 'country' | 'logo'> & { avatar: string }

const useOrganizationEdit = (options?: Omit<UseMutationOptions<void, Error, CreateOrgParams>, 'mutationFn'>) => {
  const { bearedFetch, currentAddress } = useAuth()
  const client = useQueryClient()
  return useMutation<void, Error, CreateOrgParams>({
    mutationFn: (params: CreateOrgParams) => {
      if (!currentAddress) {
        return Promise.reject(new Error('No organization address selected'))
      }
      return bearedFetch<void>(ApiEndpoints.Organization.replace('{address}', currentAddress), {
        body: params,
        method: 'PUT',
      })
    },
    ...options,
    onSuccess: () => {
      // Invalidating the shared organization entry refreshes both readers at once: this
      // used to invalidate an app-only key, leaving the react-providers OrganizationProvider
      // (which feeds the dashboard header and org display components) showing stale data
      // until something else remounted it.
      client.invalidateQueries({
        queryKey: organizationQueryKeys.organization(currentAddress),
      })
    },
  })
}

const EditOrganization = () => {
  const toast = useToast()
  const { t } = useTranslation()
  const [isPending, setPending] = useState(false)
  const { organization } = useSaasAccount()
  const { setStepDoneAsync } = useOrganizationSetup()
  const { mutateAsync } = useOrganizationEdit()

  const methods = useForm<FormData>({
    defaultValues: {
      name: organization?.account.name.default || '',
      website: organization?.website || '',
      description: organization?.account.description.default || '',
      size: organization?.size ?? '',
      type: organization?.type ?? '',
      country: organization?.country,
      avatar: organization?.account.avatar || '',
      header: organization?.account.header || '',
    },
  })

  const { handleSubmit } = methods

  const onSubmit: SubmitHandler<FormData> = async (values: FormData) => {
    setPending(true)
    // Profile metadata (name/description/avatar) is now persisted through the SaaS
    // organization endpoint; the backend provisions the on-chain account server-side,
    // so there is no client-side on-chain account update anymore.
    const newInfo: CreateOrgParams = {
      name: values.name,
      description: values.description,
      logo: values.avatar,
      header: values.header,
      website: values.website,
      size: values.size,
      type: values.type,
      country: values.country,
    }

    try {
      await mutateAsync(newInfo)
      await setStepDoneAsync(SetupStepIds.organizationDetails)
      toast({
        title: t('edit_saas_profile.edited_successfully', { defaultValue: 'Updated successfully' }),
        type: 'success',
      })
    } catch (e) {
      toast({
        title: t('edit_saas_profile.edit_failed', { defaultValue: 'Update failed' }),
        description: (e as Error).message,
        type: 'error',
      })
    } finally {
      setPending(false)
    }
  }

  return (
    <DashboardBox p={6}>
      <FormProvider {...methods}>
        <Flex as='form' id='process-create-form' onSubmit={handleSubmit(onSubmit)} flexDirection='column' gap={6}>
          <Flex flexDir='column'>
            <Heading size='md'>
              {t('create_org.organization_details', { defaultValue: 'Organization details' })}
            </Heading>
            <Text color='texts.subtle' fontSize='sm'>
              {t('create_org.organization_details_description', {
                defaultValue: "Manage your organization's profile and configuration settings.",
              })}
            </Text>
          </Flex>
          <Flex gap={6} flexDirection={{ base: 'column', sm: 'row' }}>
            <AvatarUploader w='fit-content' />
            <PublicOrgForm />
          </Flex>
          <Flex align='center'>
            <HSeparator />
            <Text
              color='texts.subtle'
              fontWeight='bold'
              mx={3.5}
              whiteSpace='nowrap'
              fontSize='xs'
              textTransform='uppercase'
            >
              {t('other_details', { defaultValue: 'Other details' })}
            </Text>
            <HSeparator />
          </Flex>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
            <PrivateOrgForm />
          </SimpleGrid>

          <Flex align='center' direction='column' alignSelf='end'>
            <Button type='submit' loading={isPending} aria-label={t('actions.save', { defaultValue: 'Save' })} w='full'>
              {t('actions.save', { defaultValue: 'Save' })}
            </Button>
          </Flex>
        </Flex>
      </FormProvider>
    </DashboardBox>
  )
}

export default EditOrganization

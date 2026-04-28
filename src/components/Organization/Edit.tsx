import { Button, Flex, Heading, SimpleGrid, Text } from '@chakra-ui/react'
import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { useClient } from '@vocdoni/react-components'
import { Account } from '@vocdoni/sdk'
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
import { QueryKeys } from '~src/queries/keys'
import { SetupStepIds, useOrganizationSetup } from '~src/queries/organization'
import { PrivateOrgForm, PrivateOrgFormData, PublicOrgForm } from './Form'

type FormData = PrivateOrgFormData & Omit<CreateOrgParams, 'size' | 'type' | 'country'>

const useOrganizationEdit = (options?: Omit<UseMutationOptions<void, Error, CreateOrgParams>, 'mutationFn'>) => {
  const { bearedFetch } = useAuth()
  const { account } = useClient()
  const client = useQueryClient()
  return useMutation<void, Error, CreateOrgParams>({
    mutationFn: (params: CreateOrgParams) =>
      bearedFetch<void>(ApiEndpoints.Organization.replace('{address}', account?.address), {
        body: params,
        method: 'PUT',
      }),
    ...options,
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: QueryKeys.organization.info(),
      })
    },
  })
}

const EditOrganization = () => {
  const toast = useToast()
  const { t } = useTranslation()
  const [isPending, setPending] = useState(false)
  const { updateAccount } = useClient()
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
    const newInfo: CreateOrgParams = {
      website: values.website,
      size: values.size,
      type: values.type,
      country: values.country,
    }

    try {
      await mutateAsync({ ...organization, ...newInfo })
      const newAccount = new Account({ ...organization?.account, ...values })
      // Check if account changed before trying to update
      if (JSON.stringify(newAccount.generateMetadata()) !== JSON.stringify(organization?.account.generateMetadata())) {
        await updateAccount(newAccount)
      }
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

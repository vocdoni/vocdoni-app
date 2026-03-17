import { Button, Flex, FlexProps, Link, Text } from '@chakra-ui/react'
import { useToast } from '~components/Toast'

import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { enforceHexPrefix, useClient } from '@vocdoni/react-components'
import { Account, RemoteSigner } from '@vocdoni/sdk'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Link as ReactRouterLink, To, useNavigate } from 'react-router-dom'
import { AppEnv } from '~src/app-env'
import { useAnalytics } from '~components/AnalyticsProvider'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { LocalStorageKeys, useAuthProvider } from '~components/Auth/useAuthProvider'
import { CreateOrgParams } from '~components/Organization/AccountTypes'
import { OrganizationMetaKeys, OrganizationMetaResponse, SetupStepIds } from '~queries/organization'
import { QueryKeys } from '~src/queries/keys'
import { Routes } from '~src/router/routes'
import { AnalyticsEvent } from '~utils/analytics'
import { PrivateOrgForm, PrivateOrgFormData, PublicOrgForm } from './Form'

type FormData = PrivateOrgFormData & Omit<CreateOrgParams, 'size' | 'type' | 'country'>

type OrganizationCreateResponse = {
  address: string
  account: Account
  signer: RemoteSigner
  client: ReturnType<typeof useClient>['client']
}

const useOrganizationCreate = (
  options?: Omit<UseMutationOptions<OrganizationCreateResponse, Error, FormData>, 'mutationFn'>
) => {
  const { bearedFetch } = useAuth()
  const { client, setSigner, signer: csigner } = useClient()
  const { bearer, signerRefresh } = useAuthProvider()
  const qclient = useQueryClient()

  return useMutation<OrganizationCreateResponse, Error, FormData>({
    mutationFn: async (values: FormData) => {
      // Create account on the saas to generate new priv keys
      const { address }: { address: string } = await bearedFetch(ApiEndpoints.Organizations, {
        body: {
          name: values.name,
          website: values.website,
          description: values.description,
          size: values.size,
          country: values.country,
          type: values.type,
        },
        method: 'POST',
      })

      const signer = new RemoteSigner({
        url: AppEnv.SAAS_URL,
        token: bearer,
      })

      signer.address = address
      client.wallet = signer

      const account = new Account({
        name: typeof values.name === 'object' ? values.name.default : values.name,
        description: typeof values.description === 'object' ? values.description.default : values.description,
      })

      await client.createAccount({ account })

      localStorage.setItem(LocalStorageKeys.SignerAddress, address)
      qclient.invalidateQueries({ queryKey: QueryKeys.profile })

      // Refresh the signer if it was already set
      if (csigner !== null) {
        setSigner(signer)
        await signerRefresh()
      }

      return { address, account, signer, client }
    },
    ...options,
  })
}

export const OrganizationCreate = ({
  canSkip,
  minified,
  onSuccessRoute = Routes.dashboard.base,
  ...props
}: {
  onSuccessRoute?: To
  canSkip?: boolean
  minified?: boolean
} & FlexProps) => {
  const toast = useToast()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [isPending, setIsPending] = useState(false)
  const methods = useForm<FormData>()
  const { fetchAccount } = useClient()
  const { handleSubmit } = methods
  const { trackPlausibleEvent } = useAnalytics()
  const { bearedFetch } = useAuth()

  const { mutateAsync: createOrganization } = useOrganizationCreate({
    onSuccess: async ({ address }) => {
      trackPlausibleEvent({ name: AnalyticsEvent.OrganizationCreated })
      toast({
        title: t('organization.create_org_success', {
          defaultValue: 'Organization created successfully',
        }),
        type: 'success',
        duration: 5000,
        isClosable: true,
      })
      try {
        // Mark organizationDetails step as done (can't use org hook here because org is not created yet)
        await bearedFetch<OrganizationMetaResponse>(
          ApiEndpoints.OrganizationMeta.replace('{address}', enforceHexPrefix(address)),
          {
            method: 'PUT',
            body: {
              meta: {
                [OrganizationMetaKeys.completedSteps]: [SetupStepIds.organizationDetails],
              },
            },
          }
        )
      } catch (e) {
        console.warn('Error marking organizationDetails step as done', e)
        toast({
          title: t('organization.create_org_step_update_failed', {
            defaultValue: 'Failed to update organization setup step status',
          }),
          description: e.message,
          type: 'warning',
          duration: 5000,
          isClosable: true,
        })
      }
      navigate(onSuccessRoute)
      setTimeout(async () => {
        await fetchAccount()
      }, 50)
    },
    onError: (error) => {
      toast({
        title: t('organization.create_org_failed', {
          defaultValue: 'Failed to create organization',
        }),
        description: error.message,
        type: 'error',
        duration: 5000,
        isClosable: true,
      })
    },
  })

  const onSubmit = async (values: FormData) => {
    setIsPending(true)
    try {
      await createOrganization(values)
    } catch (e) {
      // Error handling is managed by react-query
    } finally {
      setIsPending(false)
    }
  }

  const DashboardLink = ({ children }: { children?: React.ReactNode }) => (
    <Link asChild>
      <ReactRouterLink to={Routes.dashboard.base}>{children}</ReactRouterLink>
    </Link>
  )

  return (
    <FormProvider {...methods}>
      <Flex
        as='form'
        id='process-create-form'
        direction='column'
        gap={6}
        mx='auto'
        {...props}
        onSubmit={(e) => {
          e.stopPropagation()
          e.preventDefault()
          handleSubmit(onSubmit)(e)
        }}
      >
        <PublicOrgForm minified={minified} />
        <PrivateOrgForm minified={minified} />
        <Button
          form='process-create-form'
          type='submit'
          loading={isPending}
          aria-label={t('organization.create_org', { defaultValue: 'Create organization' })}
        >
          {t('organization.create_org')}
        </Button>
        <Text color={'account_create_text_secondary'} fontSize='sm' textAlign='center' mt='auto'>
          <Trans i18nKey='create_org.already_profile' components={{ dlink: <DashboardLink /> }}>
            If your organization already has a profile, <DashboardLink>access the dashboard</DashboardLink> and contact
            the administrator to invite you
          </Trans>
        </Text>
        {canSkip && (
          <Button
            asChild
            aria-label={t('do_it_later', { defaultValue: 'Do it later' })}
            variant='outline'
            border='none'
            disabled={isPending}
          >
            <ReactRouterLink to={Routes.dashboard.base}>
              {t('do_it_later', { defaultValue: 'Do it later' })}
            </ReactRouterLink>
          </Button>
        )}
      </Flex>
    </FormProvider>
  )
}

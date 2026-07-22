import { Button, Flex, FlexProps, Link, Text } from '@chakra-ui/react'
import { useToast } from '~components/Toast'

import { useMutation, UseMutationOptions, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { Link as ReactRouterLink, To, useNavigate } from 'react-router-dom'
import { useAnalytics } from '~components/AnalyticsProvider'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { LocalStorageKeys } from '~components/Auth/useAuthProvider'
import { CreateOrgParams } from '~components/Organization/AccountTypes'
import { OrganizationMetaKeys, OrganizationMetaResponse, SetupStepIds } from '~queries/organization'
import { QueryKeys } from '~src/queries/keys'
import { Routes } from '~src/router/routes'
import { AnalyticsEvents } from '~utils/analytics'
import { PrivateOrgForm, PrivateOrgFormData, PublicOrgForm } from './Form'

type FormData = PrivateOrgFormData & Omit<CreateOrgParams, 'size' | 'type' | 'country'>

type OrganizationCreateResponse = {
  address: string
}

const useOrganizationCreate = (
  options?: Omit<UseMutationOptions<OrganizationCreateResponse, Error, FormData>, 'mutationFn'>
) => {
  // Read refreshAddresses from the AuthContext rather than calling useAuthProvider()
  // again: a second useAuthProvider instance registers its own observer on the
  // `auth/addresses` query, and when that query is in error state (users with no
  // organization get a 404) the observer's retry-on-mount refetch re-renders the
  // top-level AuthProvider, which rebuilds the router and remounts this component
  // in an endless loop.
  const { bearedFetch, refreshAddresses } = useAuth()
  const qclient = useQueryClient()

  return useMutation<OrganizationCreateResponse, Error, FormData>({
    mutationFn: async (values: FormData) => {
      // Create the organization on the SaaS. `provisionAccount` tells the backend to
      // provision the on-chain account server-side, replacing the former client-side
      // RemoteSigner `createAccount` step.
      const { address }: { address: string } = await bearedFetch(ApiEndpoints.Organizations, {
        body: {
          name: values.name,
          website: values.website,
          description: values.description,
          size: values.size,
          country: values.country,
          type: values.type,
          provisionAccount: true,
        },
        method: 'POST',
      })

      localStorage.setItem(LocalStorageKeys.SignerAddress, address)
      qclient.invalidateQueries({ queryKey: QueryKeys.profile })
      // Make the freshly created org the active one and refresh dependent queries.
      await refreshAddresses()

      return { address }
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
  const { handleSubmit } = methods
  const { trackPlausibleEvent } = useAnalytics()
  const { bearedFetch } = useAuth()

  const { mutateAsync: createOrganization } = useOrganizationCreate({
    onSuccess: async ({ address }) => {
      trackPlausibleEvent({ name: AnalyticsEvents.OrganizationCreated })
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
        await bearedFetch<OrganizationMetaResponse>(ApiEndpoints.OrganizationMeta.replace('{address}', address), {
          method: 'PUT',
          body: {
            meta: {
              [OrganizationMetaKeys.completedSteps]: [SetupStepIds.organizationDetails],
            },
          },
        })
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

import {
  Button,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  FieldLabel as FormLabel,
  HStack,
  Icon,
  Input,
  Switch,
  useDisclosure,
  VStack,
} from '@chakra-ui/react'
import { useEffect } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuPlus } from 'react-icons/lu'
import { ApiError, ErrorCode, getApiErrorMessage } from '~components/Auth/api'
import { ModalForm, useModalForm } from '~components/Form/ModalForm'
import { MembershipSizeSelector, OrganizationTypeSelector } from '~components/Layout/SaasSelector'
import { useToast } from '~components/Toast'
import {
  CreateManagedOrganizationBody,
  useCreateManagedOrganization,
  useIntegratorInfo,
  useIsIntegratorAdmin,
} from '~queries/integrator'

type FormData = {
  type: string
  website?: string
  size?: string
  color?: string
  subdomain?: string
  country?: string
  timezone?: string
  ownerEmail?: string
  communications?: boolean
}

// Drop empty optional fields so we don't send empty strings the backend would have to interpret.
const buildBody = (values: FormData): CreateManagedOrganizationBody => {
  const body: CreateManagedOrganizationBody = { type: values.type }
  if (values.website) body.website = values.website
  if (values.size) body.size = values.size
  if (values.color) body.color = values.color
  if (values.subdomain) body.subdomain = values.subdomain
  if (values.country) body.country = values.country
  if (values.timezone) body.timezone = values.timezone
  if (values.ownerEmail) body.ownerEmail = values.ownerEmail
  body.communications = !!values.communications
  return body
}

const CreateManagedOrganizationForm = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const createManagedOrg = useCreateManagedOrganization()
  const methods = useForm<FormData>()
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = methods
  const { formRef, setIsSubmitting, onClose } = useModalForm()

  useEffect(() => {
    setIsSubmitting(isSubmitting)
  }, [isSubmitting, setIsSubmitting])

  const onSubmit = async (values: FormData) => {
    try {
      await createManagedOrg.mutateAsync(buildBody(values))
      toast({
        title: t('integrator.create.success', { defaultValue: 'Organization created successfully' }),
        type: 'success',
        duration: 5000,
        closable: true,
      })
      reset()
      onClose()
    } catch (error) {
      const code = error instanceof ApiError ? error.apiError?.code : undefined
      let description = getApiErrorMessage(error)
      if (code === ErrorCode.MaxManagedOrgsReached) {
        description = t('integrator.create.limit_reached', {
          defaultValue: "You've reached your managed-organization limit.",
        })
      } else if (code === ErrorCode.IntegratorQuotaExceeded) {
        description = t('integrator.create.quota_exceeded', {
          defaultValue: "You've reached your integrator quota.",
        })
      }
      toast({
        title: t('integrator.create.error', { defaultValue: 'Failed to create organization' }),
        description,
        type: 'error',
        duration: 5000,
        closable: true,
      })
    }
  }

  return (
    <FormProvider {...methods}>
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.stopPropagation()
          handleSubmit(onSubmit)(e)
        }}
      >
        <VStack gap={4} align='stretch'>
          <OrganizationTypeSelector name='type' required />
          <MembershipSizeSelector name='size' />

          <FormControl invalid={!!errors.website}>
            <FormLabel>{t('integrator.create.website', { defaultValue: 'Website' })}</FormLabel>
            <Input placeholder='https://...' {...register('website')} />
            <FormErrorMessage>{errors.website?.message}</FormErrorMessage>
          </FormControl>

          <HStack gap={4} align='start'>
            <FormControl invalid={!!errors.subdomain}>
              <FormLabel>{t('integrator.create.subdomain', { defaultValue: 'Subdomain' })}</FormLabel>
              <Input {...register('subdomain')} />
            </FormControl>
            <FormControl invalid={!!errors.color}>
              <FormLabel>{t('integrator.create.color', { defaultValue: 'Brand color' })}</FormLabel>
              <Input placeholder='#RRGGBB' {...register('color')} />
            </FormControl>
          </HStack>

          <HStack gap={4} align='start'>
            <FormControl invalid={!!errors.country}>
              <FormLabel>{t('integrator.create.country', { defaultValue: 'Country' })}</FormLabel>
              <Input
                placeholder={t('integrator.create.country_placeholder', { defaultValue: 'e.g. ES' })}
                {...register('country')}
              />
            </FormControl>
            <FormControl invalid={!!errors.timezone}>
              <FormLabel>{t('integrator.create.timezone', { defaultValue: 'Timezone' })}</FormLabel>
              <Input placeholder='e.g. Europe/Madrid' {...register('timezone')} />
            </FormControl>
          </HStack>

          <FormControl invalid={!!errors.ownerEmail}>
            <FormLabel>{t('integrator.create.owner_email', { defaultValue: 'Owner email' })}</FormLabel>
            <Input
              type='email'
              placeholder={t('integrator.create.owner_email_placeholder', {
                defaultValue: 'Existing user to own the org (optional)',
              })}
              {...register('ownerEmail')}
            />
            <FormErrorMessage>{errors.ownerEmail?.message}</FormErrorMessage>
          </FormControl>

          <Controller
            name='communications'
            control={control}
            render={({ field }) => (
              <Switch.Root checked={!!field.value} onCheckedChange={({ checked }) => field.onChange(checked === true)}>
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>
                  {t('integrator.create.communications', { defaultValue: 'Enable communications' })}
                </Switch.Label>
              </Switch.Root>
            )}
          />
        </VStack>
      </form>
    </FormProvider>
  )
}

/**
 * "Create managed organization" action. Rendered only for integrator admins (managers can view but
 * not create). Disabled when the managed-orgs quota is already exhausted.
 */
export const CreateManagedOrganizationButton = () => {
  const { t } = useTranslation()
  const isAdmin = useIsIntegratorAdmin()
  const { data: integrator } = useIntegratorInfo()
  const { open: isOpen, onOpen, onClose } = useDisclosure()

  if (!isAdmin) return null

  const atLimit = !!integrator?.limits && integrator.usage.managedOrgs >= integrator.limits.maxManagedOrgs

  return (
    <>
      <Button
        onClick={onOpen}
        disabled={atLimit}
        size='sm'
        title={
          atLimit
            ? t('integrator.create.limit_reached', { defaultValue: "You've reached your managed-organization limit." })
            : undefined
        }
      >
        <Icon as={LuPlus} boxSize={4} />
        {t('integrator.create.action', { defaultValue: 'Create organization' })}
      </Button>
      <ModalForm
        isOpen={isOpen}
        onClose={onClose}
        title={t('integrator.create.title', { defaultValue: 'Create managed organization' })}
        subtitle={t('integrator.create.subtitle', {
          defaultValue: 'Provision a new organization under your integrator account.',
        })}
        submitText={t('integrator.create.action', { defaultValue: 'Create organization' })}
      >
        <CreateManagedOrganizationForm />
      </ModalForm>
    </>
  )
}

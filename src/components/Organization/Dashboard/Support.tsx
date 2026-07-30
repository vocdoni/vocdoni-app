import {
  Box,
  Button,
  Flex,
  FieldRoot as FormControl,
  FieldLabel as FormLabel,
  Heading,
  Icon,
  Progress,
  SimpleGrid,
  SimpleGridProps,
  Stack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { LuInfo } from 'react-icons/lu'
import { useSaasAccount } from '~components/Account/SaasAccountProvider'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { DashboardBox, SectionHeader, SectionHeading, SectionSubHeading } from '~components/Dashboard/Contents'
import InputBasic from '~components/Form/InputBasic'
import { IssueTypeSelector, SelectOptionType } from '~components/Layout/SaasSelector'
import { SubscriptionLockedContent } from '~components/Layout/SubscriptionLockedContent'
import { useToast } from '~components/Toast'
import { SubscriptionPermission } from '~constants'
import { useAppEnv } from '~src/app-env'
import { maskValue } from '~utils/strings'

type FormData = {
  title: string
  type: SelectOptionType
  description: string
}

type SupportTicket = {
  title: string
  type: string
  description: string
}

const OrganizationSupport = () => {
  const { t } = useTranslation()
  const { PRIORITY_SUPPORT_PHONE } = useAppEnv()
  let columns: SimpleGridProps['columns'] = { base: 1 }
  if (PRIORITY_SUPPORT_PHONE) {
    columns = { base: 1, md: 2 }
  }

  return (
    <DashboardBox p={6}>
      <SectionHeader>
        <SectionHeading>{t('organization_settings.support.title', { defaultValue: 'Support' })}</SectionHeading>
        <SectionSubHeading>
          {t('organization_settings.support.description', {
            defaultValue: 'Get help and support for your organization.',
          })}
        </SectionSubHeading>
      </SectionHeader>
      <SimpleGrid columns={columns} gap={6}>
        <SupportTicketForm />
        {PRIORITY_SUPPORT_PHONE && (
          <SubscriptionLockedContent permissionType={SubscriptionPermission.PhoneSupport}>
            {({ isLocked }) => <PhoneSupportCard isLocked={isLocked} />}
          </SubscriptionLockedContent>
        )}
      </SimpleGrid>
    </DashboardBox>
  )
}

const useSendSupportTicket = (options?: Omit<UseMutationOptions<void, Error, SupportTicket>, 'mutationFn'>) => {
  const { bearedFetch, currentAddress } = useAuth()

  return useMutation<void, Error, SupportTicket>({
    mutationFn: (params: SupportTicket) =>
      bearedFetch<void>(ApiEndpoints.OrganizationsSupport.replace('{address}', currentAddress), {
        body: params,
        method: 'POST',
      }),
    ...options,
  })
}

const SupportTicketForm = () => {
  const toast = useToast()
  const { t } = useTranslation()
  const methods = useForm<FormData>({})
  const { handleSubmit, register, reset } = methods
  const { mutateAsync } = useSendSupportTicket({
    onSuccess: () => {
      reset()
    },
  })

  const onSubmit: SubmitHandler<FormData> = async (values: FormData) => {
    const ticket = {
      ...values,
      type: values.type?.value,
    }
    try {
      await mutateAsync(ticket)
      toast({
        title: t('form.support.ticket_success', { defaultValue: 'Support ticket submitted successfully' }),
        type: 'success',
      })
    } catch (e) {
      toast({
        title: t('form.support.ticket_error', { defaultValue: 'Failed to submit support ticket' }),
        description: (e as Error).message,
        type: 'error',
      })
    } finally {
    }
  }

  return (
    <FormProvider {...methods}>
      <Box as='form' p={6} borderWidth='1px' borderRadius='lg' onSubmit={handleSubmit(onSubmit)}>
        <Heading size='md' mb={2}>
          {t('form.support.open_ticket', { defaultValue: 'Open a Support Ticket' })}
        </Heading>
        <Text fontSize='sm' color='fg.muted' mb={6}>
          {t('form.support.subtitle', {
            defaultValue: 'Submit a ticket and our support team will get back to you as soon as possible.',
          })}
        </Text>
        <VStack gap={4} align='stretch'>
          <InputBasic
            formValue='title'
            label={t('form.support.title', { defaultValue: 'Title' })}
            placeholder={t('form.support.title_placeholder', {
              defaultValue: 'Briefly describe your issue',
            })}
            required
          />
          <IssueTypeSelector name='type' required />
          <FormControl required>
            <FormLabel>{t('form.support.description', { defaultValue: 'Description' })}</FormLabel>
            <Textarea
              {...register('description')}
              placeholder={t('form.support.description_placeholder', { defaultValue: 'Describe your issue in detail' })}
            />
          </FormControl>
          <Button type='submit' mt={4}>
            {t('form.support.submit_ticket', { defaultValue: 'Submit Ticket' })}
          </Button>
        </VStack>
      </Box>
    </FormProvider>
  )
}

const PhoneSupportCard = ({ isLocked }) => {
  const { t } = useTranslation()
  const { organization, isLoading } = useSaasAccount()
  const prioritySupportPhone = useAppEnv().PRIORITY_SUPPORT_PHONE

  if (isLoading) {
    return (
      <Progress.Root size='xs' colorPalette='gray' value={null}>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    )
  }

  return (
    <Box p={6}>
      <Heading size='md' mb={1}>
        {t('organization_settings.phone_support.title', { defaultValue: 'Phone Support' })}
      </Heading>
      <Text fontSize='sm' color='text.subtle' mb={6}>
        {t('organization_settings.phone_support.description', {
          defaultValue: 'Available for Custom plan subscribers only.',
        })}
      </Text>

      <Stack gap={4} mb={6}>
        <Flex p={4} borderRadius='md' bg='dashboard.menu' align='flex-start'>
          <Box
            bg='bg.emphasized'
            borderRadius='full'
            fontWeight='bold'
            fontSize='sm'
            w='40px'
            h='40px'
            display='flex'
            alignItems='center'
            justifyContent='center'
            mt='2px'
            mr={3}
          >
            ?
          </Box>
          <Box>
            <Text fontWeight='medium'>
              {t('organization_settings.phone_support.priority_support_line', {
                defaultValue: 'Priority Support Line',
              })}
            </Text>
            <Text fontSize='lg' fontWeight='bold'>
              {maskValue(prioritySupportPhone, isLocked)}
            </Text>
            <Text fontSize='sm' color='texts.dark'>
              {t('organization_settings.phone_support.priority_support_line_description', {
                defaultValue: 'Available Monday–Friday, 9:00–18:00 CET',
              })}
            </Text>
          </Box>
        </Flex>

        <Flex p={4} borderRadius='md' bg='dashboard.menu' align='flex-start'>
          <Box
            bg='bg.emphasized'
            borderRadius='full'
            fontWeight='bold'
            fontSize='sm'
            w='40px'
            h='40px'
            display='flex'
            alignItems='center'
            justifyContent='center'
            mr={3}
          >
            {t('organization_settings.phone_support.id', { defaultValue: 'ID' })}
          </Box>
          <Box>
            <Text fontWeight='medium'>
              {t('organization_settings.phone_support.organization_id', {
                defaultValue: 'Your Organization ID',
              })}
            </Text>
            <Text fontFamily='mono' color='texts.subtle'>
              {maskValue(organization.address ?? '', isLocked)}
            </Text>
            <Text fontSize='sm' color='texts.dark'>
              {t('organization_settings.phone_support.organization_id_description', {
                defaultValue: 'Please provide this ID when contacting support',
              })}
            </Text>
          </Box>
        </Flex>
      </Stack>

      <Flex align='center' mb={6}>
        <Icon as={LuInfo} boxSize={4} mr={2} />
        <Text fontSize='sm' color='texts.dark'>
          {t('organization_settings.phone_support.info', {
            defaultValue: 'Please have your organization ID ready when calling.',
          })}
        </Text>
      </Flex>
    </Box>
  )
}

export default OrganizationSupport

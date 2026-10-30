import {
  Box,
  Button,
  Card,
  Flex,
  FieldRoot as FormControl,
  FieldLabel as FormLabel,
  Icon,
  SimpleGrid,
  SimpleGridProps,
  Stack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { InfoIcon } from '~theme/icons'
import { useSaasAccount } from '~components/Account/SaasAccountProvider'
import { DashboardBox } from '~components/Dashboard/Contents'
import { SectionHeader } from '~components/ui/SectionHeader'
import InputBasic from '~components/Form/InputBasic'
import { IssueTypeSelector, SelectOptionType } from '~components/Layout/SaasSelector'
import { SubscriptionLockedContent } from '~components/Layout/SubscriptionLockedContent'
import { useToast } from '~components/Toast'
import { ListLoader } from '~components/ui/Loader'
import { SubscriptionPermission } from '~constants'
import { useAppEnv } from '~src/app-env'
import { useSendSupportTicket } from '~src/queries/support'
import { maskValue } from '~utils/strings'

type FormData = {
  title: string
  type: SelectOptionType
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
    <DashboardBox size='md'>
      <SectionHeader
        title={t('organization_settings.support.title', { defaultValue: 'Support' })}
        description={t('organization_settings.support.description', {
          defaultValue: 'Get help and support for your organization.',
        })}
        size='md'
      />
      <SimpleGrid columns={columns} gap='6'>
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
      <Card.Root as='form' variant='section' onSubmit={handleSubmit(onSubmit)}>
        <SectionHeader
          title={t('form.support.open_ticket', { defaultValue: 'Open a Support Ticket' })}
          description={t('form.support.subtitle', {
            defaultValue: 'Submit a ticket and our support team will get back to you as soon as possible.',
          })}
          size='md'
          titleGap='2'
          mb='6'
        />
        <VStack gap='4' align='stretch'>
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
          <Button type='submit' mt='4'>
            {t('form.support.submit_ticket', { defaultValue: 'Submit Ticket' })}
          </Button>
        </VStack>
      </Card.Root>
    </FormProvider>
  )
}

const PhoneSupportCard = ({ isLocked }) => {
  const { t } = useTranslation()
  const { organization, isLoading } = useSaasAccount()
  const prioritySupportPhone = useAppEnv().PRIORITY_SUPPORT_PHONE

  if (isLoading) {
    return <ListLoader />
  }

  return (
    <Box p='6'>
      <SectionHeader
        title={t('organization_settings.phone_support.title', { defaultValue: 'Phone Support' })}
        size='md'
        mb='1'
      />
      <Text textStyle='body-sm' mb='6'>
        {t('organization_settings.phone_support.description', {
          defaultValue: 'Available for Custom plan subscribers only.',
        })}
      </Text>

      <Stack gap='4' mb='6'>
        <Flex p='4' borderRadius='md' bg='dashboard.menu' align='flex-start'>
          <Box
            bg='bg.emphasized'
            borderRadius='full'
            fontWeight='bold'
            fontSize='sm'
            w='10'
            h='10'
            display='flex'
            alignItems='center'
            justifyContent='center'
            mt='0.5'
            mr='3'
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
            <Text textStyle='body-sm' color='fg.muted'>
              {t('organization_settings.phone_support.priority_support_line_description', {
                defaultValue: 'Available Monday–Friday, 9:00–18:00 CET',
              })}
            </Text>
          </Box>
        </Flex>

        <Flex p='4' borderRadius='md' bg='dashboard.menu' align='flex-start'>
          <Box
            bg='bg.emphasized'
            borderRadius='full'
            fontWeight='bold'
            fontSize='sm'
            w='10'
            h='10'
            display='flex'
            alignItems='center'
            justifyContent='center'
            mr='3'
          >
            {t('organization_settings.phone_support.id', { defaultValue: 'ID' })}
          </Box>
          <Box>
            <Text fontWeight='medium'>
              {t('organization_settings.phone_support.organization_id', {
                defaultValue: 'Your Organization ID',
              })}
            </Text>
            <Text fontFamily='mono' color='fg.muted'>
              {maskValue(organization.address ?? '', isLocked)}
            </Text>
            <Text textStyle='body-sm' color='fg.muted'>
              {t('organization_settings.phone_support.organization_id_description', {
                defaultValue: 'Please provide this ID when contacting support',
              })}
            </Text>
          </Box>
        </Flex>
      </Stack>

      <Flex align='center' mb='6'>
        <Icon as={InfoIcon} mr='2' />
        <Text textStyle='body-sm' color='fg.muted'>
          {t('organization_settings.phone_support.info', {
            defaultValue: 'Please have your organization ID ready when calling.',
          })}
        </Text>
      </Flex>
    </Box>
  )
}

export default OrganizationSupport

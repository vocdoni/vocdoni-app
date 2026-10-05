import {
  Box,
  Button,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  Heading,
  Icon,
  Portal,
  Stack,
  Tabs,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { VocdoniApiError } from '@vocdoni/api-client'
import type { OrgMemberAuthField, OrgMemberTwoFaField } from '@vocdoni/api-types'
import { useOrganization } from '@vocdoni/react-components'
import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuKeyRound, LuMail, LuPencil } from 'react-icons/lu'
import { codeChannel } from '~components/Memberbase/Censuses/facts'
import { useMemberFields } from '~components/Memberbase/fields'
import { getApiErrorMessage } from '~components/Auth/api'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { useToast } from '~components/Toast'
import { Census, Process } from '../common'
import { CredentialsForm } from './CredentialsForm'
import { SummaryDisplay } from './SummaryDisplay'
import { TwoFactorForm } from './TwoFactorForm'
import { getTwoFaFields, StepCompletionState, VoterAuthFormData } from './utils'
import { ValidationError, ValidationErrorsAlert } from './ValidationErrorsAlert'

type ValidateCensusArgs = {
  groupId: string
  authFields?: string[]
  twoFaFields?: string[]
  anonymous?: boolean
}

// Pre-flight check of the census the process will be created with: the chosen
// credentials must be unique and complete across the target members (the group
// when one is selected, otherwise the whole organization).
const useValidateCensus = () => {
  const { organization } = useOrganization()
  const { client } = useApiClient()

  return useMutation({
    mutationFn: ({ groupId, authFields, twoFaFields, anonymous }: ValidateCensusArgs) =>
      client.elections.validateCensus({
        orgAddress: organization?.address ?? '',
        census: {
          groupId: groupId || undefined,
          authFields: authFields as OrgMemberAuthField[],
          twoFaFields: twoFaFields as OrgMemberTwoFaField[],
          // The anonymity choice lives in the settings sidebar, but it is part
          // of the census spec the backend will receive, so validate it too.
          anonymous: anonymous || undefined,
        },
      }),
  })
}

export const VoterAuthentication = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const mainForm = useFormContext<Process>()
  const { open: isOpen, onOpen, onClose } = useDisclosure()
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [validationError, setValidationError] = useState<ValidationError | null>(null)
  const [stepCompletion, setStepCompletion] = useState<StepCompletionState>({
    step1Completed: false,
    step2Completed: false,
  })

  const voterAuthForm = useForm<VoterAuthFormData>({
    defaultValues: {
      credentials: [],
      use2FA: false,
      use2FAMethod: 'email',
    },
  })

  const validateCensusMutation = useValidateCensus()

  const groupId = mainForm.watch('groupId')
  const census = mainForm.watch('census')
  const anonymousVoting = mainForm.watch('anonymousVoting')
  const fields = useMemberFields()
  // The sign-in in plain words: the fields' names as members see them, and where the code goes
  const details = (census?.credentials ?? []).map((id) => fields.find((field) => field.id === id)?.label ?? id)
  const channel = census?.use2FA ? codeChannel(t, getTwoFaFields(census.use2FAMethod)) : undefined
  const formData = voterAuthForm.watch()
  const hasNoCredentialsSelected = !formData?.credentials?.length && !formData?.use2FA
  const tabValues = ['credentials', 'twoFactor', 'summary'] as const
  const activeTabValue = tabValues[activeTabIndex] ?? tabValues[0]

  // Sync form values with stored census data when modal re-opens
  useEffect(() => {
    if (census) {
      voterAuthForm.setValue('credentials', census.credentials)
      voterAuthForm.setValue('use2FA', census.use2FA)
      voterAuthForm.setValue('use2FAMethod', census.use2FAMethod)
    }
  }, [census])

  const resetForm = useCallback(() => {
    setActiveTabIndex(0)
    setStepCompletion({
      step1Completed: false,
      step2Completed: false,
    })
    setValidationError(null)
    mainForm.clearErrors('census')
  }, [mainForm])

  const handleNext = async () => {
    if (activeTabIndex === 0) {
      setStepCompletion((prev) => ({ ...prev, step1Completed: true }))
      setActiveTabIndex(1)
    } else if (activeTabIndex === 1) {
      setValidationError(null)

      try {
        const currentFormData = voterAuthForm.getValues()
        const twoFaFields = currentFormData.use2FA ? getTwoFaFields(currentFormData.use2FAMethod) : []

        await validateCensusMutation.mutateAsync({
          groupId,
          authFields: currentFormData.credentials,
          twoFaFields,
          anonymous: anonymousVoting,
        })

        setActiveTabIndex(2)
      } catch (error) {
        // The offending member ids ride on the API error body.
        setValidationError((error instanceof VocdoniApiError ? error.body : error?.apiError) as ValidationError)
        const errorMessage =
          getApiErrorMessage(error) ?? t('voter_auth.validation_failed', { defaultValue: 'Validation failed' })
        toast({
          title: t('voter_auth.validation_failed', { defaultValue: 'Validation failed' }),
          description: errorMessage,
          type: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    } else {
      // Step 3 (Confirm): save auth config to form — census is created by the backend during process publish
      const currentFormData = voterAuthForm.getValues()
      const nextCensus: Census = {
        credentials: currentFormData.credentials,
        use2FA: currentFormData.use2FA,
        use2FAMethod: currentFormData.use2FAMethod ?? 'email',
      }
      // `census_configured` is reported by Who can vote once the whole census (who, plus how they
      // sign in) has been checked, so a confirm here doesn't report it too
      mainForm.setValue('census', nextCensus)
      setStepCompletion((prev) => ({ ...prev, step2Completed: true }))
      toast({
        title: t('voter_auth.configured', { defaultValue: 'Voter authentication configured' }),
        type: 'success',
        duration: 3000,
        isClosable: true,
      })
      onClose()
      resetForm()
    }
  }

  const handleTabChange = (index: number) => {
    if (index === 0) {
      setActiveTabIndex(0)
    } else if (index === 1 && stepCompletion.step1Completed) {
      setActiveTabIndex(1)
    } else if (index === 2 && stepCompletion.step2Completed) {
      setActiveTabIndex(2)
    }
  }

  const handlePrevious = () => {
    if (activeTabIndex > 0) {
      setActiveTabIndex(activeTabIndex - 1)
    } else {
      onClose()
    }
  }

  const isLoading = validateCensusMutation.isPending

  return (
    <>
      <Dialog.Root
        open={isOpen}
        onOpenChange={(details) => {
          if (details.open) onOpen()
          else onClose()
        }}
      >
        <Box borderWidth='1px' borderColor='border' borderRadius='md' overflow='hidden'>
          <Flex
            px={3}
            py={2}
            align='center'
            justify='space-between'
            gap={2}
            bg='bg.subtle'
            borderBottomWidth='1px'
            borderColor='border'
          >
            <Flex gap={2} align='center' minW={0}>
              <Icon as={LuKeyRound} color='fg.muted' aria-hidden />
              <Text fontSize='sm' fontWeight='bolder'>
                {t('voter_auth.card.title', { defaultValue: 'How voters sign in' })}
              </Text>
            </Flex>
            {census && (
              <Dialog.Trigger asChild>
                <Button size='xs' variant='ghost' colorPalette='gray' disabled={!groupId}>
                  <Icon as={LuPencil} />
                  {t('voter_auth.card.edit', { defaultValue: 'Edit' })}
                </Button>
              </Dialog.Trigger>
            )}
          </Flex>
          {census ? (
            <Grid templateColumns='auto 1fr' columnGap={3} rowGap={1.5} px={3} py={3} fontSize='13px'>
              {details.length > 0 && (
                <>
                  <Text fontSize='inherit' color='fg.muted'>
                    {t('voter_auth.card.they_type', { defaultValue: 'They type' })}
                  </Text>
                  <Text fontSize='inherit' fontWeight='medium'>
                    {details.join(', ')}
                  </Text>
                </>
              )}
              {channel && (
                <>
                  <Text fontSize='inherit' color='fg.muted'>
                    {details.length
                      ? t('voter_auth.card.then', { defaultValue: 'Then' })
                      : t('voter_auth.card.they_get', { defaultValue: 'They get' })}
                  </Text>
                  <Flex gap={1.5} align='center'>
                    <Icon as={LuMail} boxSize={3.5} aria-hidden />
                    <Text fontSize='inherit' fontWeight='medium'>
                      {t('voter_auth.card.code', { defaultValue: 'A one-time code by {{channel}}', channel })}
                    </Text>
                  </Flex>
                </>
              )}
            </Grid>
          ) : (
            <Stack gap={2.5} px={3} py={3}>
              <Text fontSize='13px' color='fg.muted'>
                {t('voter_auth.card.intro', {
                  defaultValue: 'Choose what voters type to prove who they are, and whether they also get a code.',
                })}
              </Text>
              <Dialog.Trigger asChild>
                <Button size='sm' w='full' disabled={!groupId}>
                  <Icon as={LuKeyRound} />
                  {t('voter_auth.button.set_up_sign_in', { defaultValue: 'Set up voter sign-in' })}
                </Button>
              </Dialog.Trigger>
            </Stack>
          )}
        </Box>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
              <Dialog.Header>
                {/* Dialog.Title renders an <h2> itself, so the styled Heading must BE the
                    title element (asChild) rather than nest inside it, and the subheader
                    paragraph cannot live inside a heading at all. */}
                <Dialog.Title asChild>
                  <Heading variant='header'>
                    {t('voter_auth.title', { defaultValue: 'Configure Voter Authentication' })}
                  </Heading>
                </Dialog.Title>
                <Text variant='subheader'>
                  {t('voter_auth.description', {
                    defaultValue: 'Set up how voters will authenticate to participate in this voting process.',
                  })}
                </Text>
              </Dialog.Header>
              <Dialog.Body>
                <FormProvider {...voterAuthForm}>
                  <ValidationErrorsAlert validationError={validationError} />
                  <Tabs.Root value={activeTabValue} onValueChange={({ value }) => handleTabChange(tabValues[value])}>
                    <Tabs.List w='full'>
                      <Tabs.Trigger value={tabValues[0]} flex='1' justifyContent='center'>
                        <Trans i18nKey='voter_auth.credentials'>Credentials</Trans>
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value={tabValues[1]}
                        flex='1'
                        disabled={!stepCompletion.step1Completed}
                        justifyContent='center'
                      >
                        <Trans i18nKey='voter_auth.two_factor'>Two-Factor</Trans>
                      </Tabs.Trigger>
                      <Tabs.Trigger
                        value={tabValues[2]}
                        flex='1'
                        disabled={!stepCompletion.step2Completed || hasNoCredentialsSelected}
                        justifyContent='center'
                      >
                        <Trans i18nKey='voter_auth.summary'>Summary</Trans>
                      </Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.ContentGroup>
                      <Tabs.Content value={tabValues[0]} px={0} pb={0}>
                        <CredentialsForm />
                      </Tabs.Content>
                      <Tabs.Content value={tabValues[1]} px={0} pb={0}>
                        <TwoFactorForm />
                      </Tabs.Content>
                      <Tabs.Content value={tabValues[2]}>
                        <SummaryDisplay />
                      </Tabs.Content>
                    </Tabs.ContentGroup>
                  </Tabs.Root>
                </FormProvider>
              </Dialog.Body>
              <Dialog.Footer>
                <Button variant='ghost' onClick={handlePrevious}>
                  {t('common.back', 'Back')}
                </Button>
                {/* data-testid: this one button is both "Next" and "Confirm"
                    depending on the step, and the tab triggers stay disabled
                    until their step is completed — so the e2e suite has no
                    copy-free way to advance the modal. */}
                <Button
                  onClick={handleNext}
                  loading={isLoading}
                  disabled={activeTabIndex === 2 ? hasNoCredentialsSelected : false}
                  data-testid='voter-auth-next'
                >
                  {activeTabIndex === 2 ? t('common.confirm', 'Confirm') : t('common.next', 'Next')}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>
      {!groupId && (
        <Text color='texts.subtle' fontSize='xs'>
          {t('voter_auth.no_group_description', {
            defaultValue: 'Please select a group first to configure authentication.',
          })}
        </Text>
      )}
    </>
  )
}

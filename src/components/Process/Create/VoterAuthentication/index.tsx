import { Badge, Button, CloseButton, Dialog, Flex, Heading, Portal, Tabs, Text, useDisclosure } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-providers'
import { ensure0x } from '@vocdoni/sdk'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { ApiEndpoints, getApiErrorMessage } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { useToast } from '~components/Toast'
import { Process } from '../common'
import { CredentialsForm } from './CredentialsForm'
import { CredentialsOverview, SummaryDisplay } from './SummaryDisplay'
import { TwoFactorForm } from './TwoFactorForm'
import { getTwoFaFields, StepCompletionState, VoterAuthFormData } from './utils'
import { ValidationError, ValidationErrorsAlert } from './ValidationErrorsAlert'

type ValidateGroupArgs = {
  groupId: string
  authFields?: string[]
  twoFaFields?: string[]
}

const useValidateGroup = () => {
  const { organization } = useOrganization()
  const { bearedFetch } = useAuth()

  return useMutation({
    mutationFn: async ({ groupId, authFields, twoFaFields }: ValidateGroupArgs) => {
      return await bearedFetch<{ valid: boolean }>(
        ApiEndpoints.OrganizationGroupValidate.replace('{address}', organization?.address).replace(
          '{groupId}',
          groupId
        ),
        {
          method: 'POST',
          body: {
            authFields,
            twoFaFields,
          },
        }
      )
    },
  })
}

const useCreateCensus = () => {
  const { bearedFetch } = useAuth()
  const { organization } = useOrganization()

  return useMutation({
    mutationFn: async () => {
      return await bearedFetch<{ id: string }>(ApiEndpoints.OrganizationCensuses, {
        method: 'POST',
        body: {
          orgAddress: ensure0x(organization?.address),
        },
      })
    },
  })
}

type PublishGroupCensusResponse = {
  root: string
  size: number
  uri: string
}

type PublishCensusRequest = {
  authFields: string[]
  twoFaFields: string[]
  weighted?: boolean
}

type PublishCensusArgs = PublishCensusRequest & {
  censusId: string
  groupId: string
}

const usePublishCensus = () => {
  const { bearedFetch } = useAuth()

  return useMutation({
    mutationFn: async ({ censusId, groupId, authFields, twoFaFields, weighted }: PublishCensusArgs) => {
      const body: PublishCensusRequest = {
        authFields,
        twoFaFields,
        weighted,
      }

      const endpoint = ApiEndpoints.OrganizationCensusPublish.replace('{censusId}', censusId).replace(
        '{groupId}',
        groupId
      )

      return await bearedFetch<PublishGroupCensusResponse>(endpoint, {
        method: 'POST',
        body,
      })
    },
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

  const validateGroupMutation = useValidateGroup()
  const createCensusMutation = useCreateCensus()
  const publishCensusMutation = usePublishCensus()

  const groupId = mainForm.watch('groupId')
  const census = mainForm.watch('census')
  const weighted = mainForm.watch('weightedVote')
  const formData = voterAuthForm.watch()
  const hasNoCredentialsSelected = !formData?.credentials?.length && !formData?.use2FA
  const prevWeightedRef = useRef(weighted)
  const recreateInFlightRef = useRef(false)
  const tabValues = ['credentials', 'twoFactor', 'summary'] as const
  const activeTabValue = tabValues[activeTabIndex] ?? tabValues[0]

  // Sync form values with stored census data
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
    // clear possible main form census validation errors
    mainForm.clearErrors('census')
  }, [mainForm])

  const createAndPublishCensus = useCallback(
    async (currentWeighted: boolean) => {
      const currentFormData = voterAuthForm.getValues()
      const twoFaFields = currentFormData.use2FA ? getTwoFaFields(currentFormData.use2FAMethod) : []

      const { id: censusId } = await createCensusMutation.mutateAsync()
      const { size: maxCensusSize } = await publishCensusMutation.mutateAsync({
        censusId,
        groupId,
        authFields: currentFormData.credentials,
        twoFaFields,
        weighted: currentWeighted,
      })

      mainForm.setValue('census', {
        id: censusId,
        credentials: currentFormData.credentials,
        use2FA: currentFormData.use2FA,
        use2FAMethod: currentFormData.use2FAMethod ?? null,
        size: maxCensusSize,
      })
    },
    [createCensusMutation, publishCensusMutation, voterAuthForm, groupId, mainForm]
  )

  useEffect(() => {
    if (prevWeightedRef.current === weighted) return
    prevWeightedRef.current = weighted

    if (!mainForm.getValues('census') || !groupId || recreateInFlightRef.current) return

    recreateInFlightRef.current = true
    mainForm.setValue('census', null)

    createAndPublishCensus(weighted)
      .catch((error) => {
        setValidationError(error.apiError as ValidationError)
        const errorMessage =
          getApiErrorMessage(error) ??
          t('voter_auth.save_failed', { defaultValue: 'Failed to configure voter authentication' })
        toast({
          title: t('voter_auth.save_failed', { defaultValue: 'Failed to configure voter authentication' }),
          description: errorMessage,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      })
      .finally(() => {
        recreateInFlightRef.current = false
      })
  }, [weighted, groupId, mainForm, createAndPublishCensus, t, toast])

  const handleNext = async () => {
    if (activeTabIndex === 0) {
      // Step 1 → Step 2: Simple navigation
      setStepCompletion((prev) => ({ ...prev, step1Completed: true }))
      setActiveTabIndex(1)
    } else if (activeTabIndex === 1) {
      // Step 2 → Step 3: Validate data
      setValidationError(null)

      try {
        const currentFormData = voterAuthForm.getValues()
        const twoFaFields = currentFormData.use2FA ? getTwoFaFields(currentFormData.use2FAMethod) : []

        // Validate the group configuration
        await validateGroupMutation.mutateAsync({
          groupId,
          authFields: currentFormData.credentials,
          twoFaFields,
        })

        setActiveTabIndex(2)
      } catch (error) {
        setValidationError(error.apiError as ValidationError)
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
      try {
        // Step 3: Create and publish census
        await createAndPublishCensus(weighted)
        setStepCompletion((prev) => ({ ...prev, step2Completed: true }))
        toast({
          title: t('voter_auth.configured', { defaultValue: 'Voter authentication configured' }),
          type: 'success',
          duration: 3000,
          isClosable: true,
        })
        onClose()
        resetForm()
      } catch (error) {
        setValidationError(error.apiError as ValidationError)
        const errorMessage =
          getApiErrorMessage(error) ??
          t('voter_auth.save_failed', { defaultValue: 'Failed to configure voter authentication' })
        toast({
          title: t('voter_auth.save_failed', { defaultValue: 'Failed to configure voter authentication' }),
          description: errorMessage,
          type: 'error',
          duration: 3000,
          isClosable: true,
        })
      }
    }
  }

  const handleTabChange = (index: number) => {
    // Allow navigation to any completed step or the next available step
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

  const isLoading = validateGroupMutation.isPending || createCensusMutation.isPending || publishCensusMutation.isPending

  return (
    <>
      {census && (
        <Flex p={4} direction='column' border='1px solid' borderColor='table.border' borderRadius='md' gap={2}>
          <Flex justify='space-between'>
            <Text fontWeight='semibold'>
              {t('voter_auth.configured_auth', {
                defaultValue: 'Voter Authentication',
              })}
            </Text>
            {census?.use2FA && (
              <Badge fontSize='xs'>
                <Trans i18nKey='voter_auth.2fa_badge'>2FA</Trans>
              </Badge>
            )}
          </Flex>
          <CredentialsOverview
            credentials={census?.credentials}
            use2FA={census?.use2FA}
            use2FAMethod={census?.use2FAMethod}
          />
        </Flex>
      )}
      <Dialog.Root
        open={isOpen}
        onOpenChange={(details) => {
          if (details.open) onOpen()
          else onClose()
        }}
      >
        <Dialog.Trigger asChild>
          <Button disabled={!groupId} colorPalette='gray' w='full'>
            {census ? (
              <Trans i18nKey='voter_auth.button.edit'>Edit Voter Authentication</Trans>
            ) : (
              <Trans i18nKey='voter_auth.button.configure'>Configure Voter Authentication</Trans>
            )}
          </Button>
        </Dialog.Trigger>
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content>
              <Dialog.CloseTrigger asChild>
                <CloseButton />
              </Dialog.CloseTrigger>
              <Dialog.Header>
                <Dialog.Title>
                  <Heading variant='header'>
                    {t('voter_auth.title', { defaultValue: 'Configure Voter Authentication' })}
                  </Heading>
                  <Text variant='subheader'>
                    {t('voter_auth.description', {
                      defaultValue: 'Set up how voters will authenticate to participate in this voting process.',
                    })}
                  </Text>
                </Dialog.Title>
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
                <Button
                  onClick={handleNext}
                  loading={isLoading}
                  disabled={activeTabIndex === 2 ? hasNoCredentialsSelected : false}
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

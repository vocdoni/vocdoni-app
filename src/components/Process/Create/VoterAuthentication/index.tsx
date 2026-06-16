import { Box, Button, CloseButton, Dialog, Grid, GridItem, Portal } from '@chakra-ui/react'
import { useMutation } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import { ensure0x } from '@vocdoni/sdk'
import { useCallback, useEffect, useRef, useState } from 'react'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ApiEndpoints, getApiErrorMessage } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { useToast } from '~components/Toast'
import { Process } from '../common'
import { IdentityStep } from './steps/IdentityStep'
import { LaunchStep } from './steps/LaunchStep'
import { VerificationStep } from './steps/VerificationStep'
import { getTwoFaFields, StepCompletionState, VoterAuthFormData } from './utils'
import { ValidationError, ValidationErrorsAlert } from './ValidationErrorsAlert'
import { VoterPreview } from './VoterPreview'
import { WizardProgress } from './WizardProgress'
import { WizardStep } from './WizardStep'

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

export type VoterAuthenticationProps = {
  isOpen: boolean
  onClose: () => void
}

export const VoterAuthentication = ({ isOpen, onClose }: VoterAuthenticationProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const mainForm = useFormContext<Process>()
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
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

  // Sync form values with stored census data
  useEffect(() => {
    if (census) {
      voterAuthForm.setValue('credentials', census.credentials)
      voterAuthForm.setValue('use2FA', census.use2FA)
      voterAuthForm.setValue('use2FAMethod', census.use2FAMethod)
    }
  }, [census])

  // Start every time the wizard opens at the first step with a clean slate.
  useEffect(() => {
    if (isOpen) {
      setActiveTabIndex(0)
      setDirection('forward')
      setValidationError(null)
    }
  }, [isOpen])

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
      setDirection('forward')
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

        setDirection('forward')
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

  const handlePrevious = () => {
    if (activeTabIndex > 0) {
      setDirection('backward')
      setActiveTabIndex(activeTabIndex - 1)
    } else {
      onClose()
    }
  }

  const isLoading = validateGroupMutation.isPending || createCensusMutation.isPending || publishCensusMutation.isPending

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => {
        if (!details.open) onClose()
      }}
      size='xl'
      scrollBehavior='inside'
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW={{ base: '100%', md: '880px' }} overflow='hidden'>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
            <Dialog.Header flexDirection='column' alignItems='stretch' gap={3} pb={2}>
              <Dialog.Title fontSize='md'>
                {t('voter_auth.title', { defaultValue: 'Set up voter access' })}
              </Dialog.Title>
              <Box maxW='420px' w='full'>
                <WizardProgress currentStep={activeTabIndex} />
              </Box>
            </Dialog.Header>
            <Dialog.Body p={0}>
              <FormProvider {...voterAuthForm}>
                <Grid templateColumns={{ base: '1fr', md: '1fr 300px' }}>
                  <GridItem p={6}>
                    <ValidationErrorsAlert validationError={validationError} />
                    <Box position='relative' minH='420px'>
                      <WizardStep isActive={activeTabIndex === 0} direction={direction}>
                        <IdentityStep />
                      </WizardStep>
                      <WizardStep isActive={activeTabIndex === 1} direction={direction}>
                        <VerificationStep />
                      </WizardStep>
                      <WizardStep isActive={activeTabIndex === 2} direction={direction}>
                        <LaunchStep />
                      </WizardStep>
                    </Box>
                  </GridItem>
                  <GridItem
                    bg='auth.bg'
                    borderLeftWidth={{ base: 0, md: '1px' }}
                    borderTopWidth={{ base: '1px', md: 0 }}
                    borderColor='table.border'
                    p={5}
                    display='flex'
                  >
                    <VoterPreview activeStep={activeTabIndex} />
                  </GridItem>
                </Grid>
              </FormProvider>
            </Dialog.Body>
            <Dialog.Footer borderTopWidth='1px' borderColor='table.border'>
              <Button variant='ghost' onClick={handlePrevious} disabled={isLoading}>
                {activeTabIndex === 0 ? t('common.cancel', 'Cancel') : t('common.back', 'Back')}
              </Button>
              <Button
                onClick={handleNext}
                loading={isLoading}
                disabled={activeTabIndex === 2 ? hasNoCredentialsSelected : false}
              >
                {activeTabIndex === 2
                  ? t('voter_auth.button.create_access', 'Create voter access')
                  : t('common.next', 'Next')}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  HStack,
  Icon,
  IconButton,
  Input,
  Progress,
  Spacer,
  Text,
  VStack,
} from '@chakra-ui/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useOrganization } from '@vocdoni/react-components'
import type {
  BallotProtocol,
  CensusSpec,
  Choice,
  CreateVotingProcessRequest,
  OrgMemberAuthField,
  OrgMemberTwoFaField,
  VotingProcessQuestionRequest,
} from '@vocdoni/api-types'
import { ensure0x } from '@vocdoni/sdk'
import { addDays, parse } from 'date-fns'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Controller, FormProvider, useForm, useFormContext } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuRotateCcw, LuSettings } from 'react-icons/lu'
import {
  createPath,
  generatePath,
  useBlocker,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { useAnalytics } from '~components/AnalyticsProvider'
import { useSubscription } from '~components/Auth/Subscription'
import { ApiEndpoints, ApiError, ErrorCode } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { DashboardContents } from '~components/Dashboard/Contents'
import { SidebarVisibilityProvider, useSidebarVisibility } from '~components/Dashboard/SidebarContext'
import Editor from '~components/Editor'
import DeleteModal from '~components/Modal/DeleteModal'
import { useToast } from '~components/Toast'
import { SubscriptionPermission } from '~constants'
import { useDeleteDraft } from '~elements/dashboard/processes/drafts'
import { QueryKeys } from '~queries/keys'
import { Routes } from '~routes'
import { SetupStepIds, useOrganizationSetup } from '~src/queries/organization'
import { AnalyticsEvents } from '~utils/analytics'
import { LiveStreamingInput } from './LiveStreamingInput'
import { Questions } from './MainContent'
import { CreateSidebar } from './Sidebar'
import { useProcessTemplates } from './TemplateProvider'
import { defaultProcessValues, Option, Process, SelectorTypes, TemplateConfigs, TemplateTypes } from './common'
import { getTwoFaFields } from './VoterAuthentication/utils'

type ConfirmOnNavigateOptions = {
  isDirty: boolean
  isSubmitting?: boolean
  isSubmitSuccessful?: boolean
  onOpen: () => void
  onClose: () => void
}

type LeaveConfirmationModalProps = {
  isOpen: boolean
  onCancel: () => void
  onSaveAndLeave: () => void
  onLeave: () => void
  onResetSamePath: () => void
  isSamePath: boolean
}

type CreateProcessRequest = {
  metadata: Process
  orgAddress: string
}

type UpdateProcessRequest = {
  processId: string
  body: CreateProcessRequest
}

export const saveTimeoutMs = 30000

export const useConfirmOnNavigate = ({
  isDirty,
  isSubmitting,
  isSubmitSuccessful,
  onOpen,
  onClose,
}: ConfirmOnNavigateOptions) => {
  const [snoozeUntil, setSnoozeUntil] = useState<number | null>(null)
  const isSnoozed = snoozeUntil !== null && Date.now() < snoozeUntil

  const shouldBlock = isDirty && !isSubmitting && !isSubmitSuccessful && !isSnoozed
  const blocker = useBlocker(shouldBlock)

  const isOpenRef = useRef(false)
  const isProceedingRef = useRef(false)

  const { pathname: currentPath } = useLocation()
  const nextPath = blocker.location ? createPath(blocker.location) : null
  const isSamePath = nextPath === null || nextPath === currentPath

  useEffect(() => {
    if (!shouldBlock) {
      if (isOpenRef.current) {
        isOpenRef.current = false
        onClose()
      }
      if (blocker.state === 'blocked') {
        blocker.reset()
      }
      return
    }

    if (blocker.state === 'blocked' && !isOpenRef.current && !isProceedingRef.current) {
      isOpenRef.current = true
      onOpen()
    }

    if (blocker.state === 'unblocked' && isOpenRef.current) {
      isOpenRef.current = false
      onClose()
    }
  }, [blocker.state, shouldBlock, onOpen, onClose])

  // Reset snooze when time is up
  useEffect(() => {
    if (snoozeUntil === null) return

    const msLeft = Math.max(0, snoozeUntil - Date.now())
    const id = setTimeout(() => setSnoozeUntil(null), msLeft)
    return () => clearTimeout(id)
  }, [snoozeUntil])

  const closeAll = () => {
    isProceedingRef.current = false
    isOpenRef.current = false
    onClose()
  }

  const cancel = () => {
    closeAll()
    blocker.reset()
  }

  const proceed = () => {
    isProceedingRef.current = true
    closeAll()
    blocker.proceed()

    setTimeout(() => {
      isProceedingRef.current = false
      blocker.reset()
    }, 0)
  }

  const resetSamePath = (cb?: () => void) => {
    cb?.()
    cancel()
  }

  const saveCooldown = (ms: number) => {
    setSnoozeUntil(Date.now() + Math.max(0, ms))
  }

  return { isSamePath, cancel, proceed, resetSamePath, saveCooldown }
}

export const useSafeReset = (externalReset?) => {
  const { groupId } = useParams()
  let contextReset

  try {
    contextReset = useFormContext().reset
  } catch (err) {
    // If useFormContext fails, it means we are not in a FormProvider context so we use the external reset
  }

  return useCallback(
    (overrides: Partial<Process> = {}) => {
      const resetFn = externalReset ?? contextReset

      if (!resetFn) return

      resetFn({
        ...defaultProcessValues,
        ...overrides,
        groupId: groupId ?? '',
      })
    },
    [externalReset, contextReset, groupId]
  )
}

export const useFormDraftSaver = (
  isDirty: boolean,
  getValues: () => any,
  draftId: string | null,
  storeDraftId: (id: string | null) => void,
  saveCooldown?: (ms: number) => void
) => {
  const { currentAddress } = useAuth()
  const createProcess = useCreateProcess()
  const updateProcess = useUpdateProcess()
  const skipNextSaveRef = useRef(false)
  const [draftLimitReached, setDraftLimitReached] = useState(false)

  const isCreating = createProcess.isPending
  const isUpdating = updateProcess.isPending
  const isSaving = isCreating || isUpdating

  const skipSave = (skip) => {
    skipNextSaveRef.current = skip
  }

  const saveDraft = useCallback(
    async (isAutoSave = true) => {
      if (!isDirty || skipNextSaveRef.current) return 'skipped'
      // Prevent repeated auto-save attempts once the draft limit is reached
      if (isAutoSave && draftLimitReached) return 'limit-reached'

      try {
        const form = getValues()
        if (draftId) {
          await updateProcess.mutateAsync({
            processId: draftId,
            body: { metadata: form, orgAddress: ensure0x(currentAddress) },
          })
        } else {
          const draftProcessId = await createProcess.mutateAsync({
            metadata: form,
            orgAddress: ensure0x(currentAddress),
          })
          storeDraftId(draftProcessId)
        }
        saveCooldown?.(saveTimeoutMs)
        setDraftLimitReached(false)
        return 'saved'
      } catch (e) {
        // Check if it's a draft limit error
        if (e instanceof ApiError && e.apiError?.code === ErrorCode.DraftLimitReached) {
          setDraftLimitReached(true)
          // Silently fail for auto-save, throw for manual save
          if (isAutoSave) {
            return 'limit-reached'
          }
          throw e
        }
        // For other errors, only log in auto-save mode
        if (isAutoSave) {
          console.error('Failed to save draft:', e)
          return 'error'
        }
        throw e
      }
    },
    [
      isDirty,
      draftLimitReached,
      getValues,
      draftId,
      currentAddress,
      updateProcess,
      createProcess,
      storeDraftId,
      saveCooldown,
    ]
  )

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ''
      saveDraft(true)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty, saveDraft])

  useEffect(() => {
    const handleFocusOut = () => {
      saveDraft(true)
    }
    window.addEventListener('focusout', handleFocusOut)
    return () => window.removeEventListener('focusout', handleFocusOut)
  }, [saveDraft])

  useEffect(() => {
    const id = setInterval(() => {
      saveDraft(true)
    }, saveTimeoutMs)
    return () => clearInterval(id)
  }, [saveDraft])

  return { saveDraft, isSaving, skipSave, draftLimitReached }
}

const TemplateButtons = () => {
  const { t } = useTranslation()
  const methods = useFormContext<Process>()
  const { activeTemplate, setActiveTemplate } = useProcessTemplates()
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false)
  const reset = useSafeReset()
  const pendingTemplateRef = useRef<TemplateTypes | null>(null)

  const applyTemplate = (templateId: TemplateTypes) => {
    const config = TemplateConfigs[templateId]
    const previousFormValues = methods.getValues()
    setActiveTemplate(templateId)
    reset({
      ...previousFormValues,
      ...config,
    })
  }

  const handleTemplateClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const template = e.currentTarget.dataset.template as TemplateTypes
    if (!template) return

    if (activeTemplate === template) {
      setTemplateModalOpen(false)
      return
    }

    if (!methods.formState.isDirty) {
      applyTemplate(template)
    } else {
      pendingTemplateRef.current = template
      setTemplateModalOpen(true)
    }
  }

  const handleConfirm = () => {
    if (pendingTemplateRef.current) {
      applyTemplate(pendingTemplateRef.current)
      pendingTemplateRef.current = null
    }
    setTemplateModalOpen(false)
  }

  const handleCancel = () => {
    pendingTemplateRef.current = null
    setTemplateModalOpen(false)
  }

  return (
    <>
      <Text fontSize='sm' color='texts.subtle'>
        {t('process.create.template.title', { defaultValue: 'Get started with a template...' })}
      </Text>
      <HStack gap={2} flexWrap='wrap'>
        <Button
          variant='outline'
          size='sm'
          data-template={TemplateTypes.AnnualGeneralMeeting}
          onClick={handleTemplateClick}
        >
          {t('process.create.template.annual_general_meeting', 'Annual General Meeting')}
        </Button>
        <Button variant='outline' size='sm' data-template={TemplateTypes.Election} onClick={handleTemplateClick}>
          {t('process.create.template.election', 'Election')}
        </Button>
        <Button
          variant='outline'
          size='sm'
          data-template={TemplateTypes.ParticipatoryBudgeting}
          onClick={handleTemplateClick}
        >
          {t('process.create.template.participatory_budgeting', 'Participatory Budgeting')}
        </Button>
      </HStack>

      <DeleteModal
        title={t('process.create.change_template.title', 'Change Template')}
        subtitle={t('process.create.change_template.message', {
          defaultValue: 'You have unsaved changes. Are you sure you want to switch templates?',
        })}
        open={isTemplateModalOpen}
        onOpenChange={({ open }) => setTemplateModalOpen(open)}
      >
        <Flex justifyContent='flex-end' mt={4} gap={2}>
          <Button variant='outline' onClick={handleCancel}>
            {t('process.create.change_template.cancel', 'Cancel')}
          </Button>
          <Button colorPalette='red' onClick={handleConfirm}>
            {t('process.create.change_template.change', 'Change Template')}
          </Button>
        </Flex>
      </DeleteModal>
    </>
  )
}

const LeaveConfirmationModal = ({
  isOpen,
  onCancel,
  onLeave,
  onResetSamePath,
  onSaveAndLeave,
  isSamePath,
}: LeaveConfirmationModalProps) => {
  const { t } = useTranslation()

  return (
    <DeleteModal
      title={t('process.create.leave_confirmation.title', { defaultValue: 'Unsaved Changes' })}
      subtitle={
        isSamePath
          ? t('process.create.leave_confirmation.reset_message', {
              defaultValue: 'This will reset the form. Do you want to continue?',
            })
          : t('process.create.leave_confirmation.message', {
              defaultValue: 'You have unsaved changes. Are you sure you want to leave?',
            })
      }
      open={isOpen}
      onOpenChange={({ open }) => (!open ? onCancel() : undefined)}
    >
      <Flex justifyContent='flex-end' mt={4} gap={2}>
        <Button variant='outline' onClick={onCancel}>
          {t('process.create.leave_confirmation.cancel', { defaultValue: 'Cancel' })}
        </Button>
        <Spacer />
        {isSamePath ? (
          <Button colorPalette='red' onClick={() => onResetSamePath()}>
            {t('process.create.leave_confirmation.reset', { defaultValue: 'Reset' })}
          </Button>
        ) : (
          <>
            <Button colorPalette='red' onClick={onLeave}>
              {t('process.create.leave_confirmation.leave', { defaultValue: 'Leave without saving' })}
            </Button>
            <Button onClick={onSaveAndLeave}>
              {t('process.create.leave_confirmation.save_and_leave', { defaultValue: 'Save and leave' })}
            </Button>
          </>
        )}
      </Flex>
    </DeleteModal>
  )
}

export const useCreateProcess = () => {
  const { bearedFetch } = useAuth()

  return useMutation<string, Error, CreateProcessRequest>({
    mutationFn: async (body) => {
      return await bearedFetch(ApiEndpoints.OrganizationProcesses, {
        method: 'POST',
        body,
      })
    },
  })
}

const useUpdateProcess = () => {
  const { bearedFetch } = useAuth()
  return useMutation<void, Error, UpdateProcessRequest>({
    mutationFn: async ({ processId, body }) => {
      return await bearedFetch(ApiEndpoints.OrganizationProcess.replace('{processId}', processId), {
        method: 'PUT',
        body,
      })
    },
  })
}

const buildCensusSpec = (form: Process): CensusSpec => {
  const spec: CensusSpec = { groupId: form.groupId || undefined, weighted: form.weightedVote || undefined }
  if (form.census?.credentials?.length) {
    spec.authFields = form.census.credentials as OrgMemberAuthField[]
  }
  if (form.census?.use2FA && form.census?.use2FAMethod) {
    spec.twoFaFields = getTwoFaFields(form.census.use2FAMethod) as OrgMemberTwoFaField[]
  }
  return spec
}

export const useFormToVotingProcessRequest = () => {
  const { permission } = useSubscription()
  const { organization } = useOrganization()

  const parseLocalDateTime = (dateStr?: string, timeStr?: string): string | undefined => {
    if (!dateStr || !timeStr) return undefined
    return parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date()).toISOString()
  }

  return (form: Process, censusSpec: CensusSpec): CreateVotingProcessRequest => {
    const parsedStart = form.autoStart ? undefined : parseLocalDateTime(form.startDate, form.startTime)
    const startRef = parsedStart ? new Date(parsedStart) : new Date()
    const endDate =
      form.endDate && form.endTime ? parseLocalDateTime(form.endDate, form.endTime) : addDays(startRef, 1).toISOString()

    const secretUntilTheEnd = form.resultVisibility === 'hidden'
    const maxVoteOverwrites = 0
    const isMultiChoice = form.questionType === SelectorTypes.Multiple

    const questions: VotingProcessQuestionRequest[] = form.questions.map((question) => {
      const choices: Choice[] = question.options.map((q: Option, i: number) => ({
        title: { default: q.option },
        value: i,
      }))

      const metadata: Record<string, unknown> | undefined = form.extendedInfo
        ? {
            choices: question.options.map((q, i) => ({ value: i, description: q.description, image: q.image })),
          }
        : undefined

      const commonProtocol: Omit<BallotProtocol, 'maxCount' | 'maxValue' | 'maxTotalCost' | 'uniqueValues'> = {
        costExponent: 1,
        costFromWeight: false,
        maxVoteOverwrites,
      }

      if (isMultiChoice) {
        const maxChoices = (form.maxNumberOfChoices ?? 0) > 0 ? form.maxNumberOfChoices! : question.options.length
        return {
          title: { default: question.title },
          description: question.description ? { default: question.description } : undefined,
          choices,
          type: 'multichoice',
          typeSetup: { maxChoices, minChoices: form.minNumberOfChoices ?? 0, uniqueChoices: true },
          ballotProtocol: {
            ...commonProtocol,
            maxCount: maxChoices,
            maxValue: 1,
            maxTotalCost: maxChoices,
            uniqueValues: true,
          },
          secretUntilTheEnd,
          metadata,
        }
      }

      return {
        title: { default: question.title },
        description: question.description ? { default: question.description } : undefined,
        choices,
        type: 'singlechoice',
        ballotProtocol: {
          ...commonProtocol,
          maxCount: 1,
          maxValue: question.options.length - 1,
          maxTotalCost: 1,
          uniqueValues: false,
        },
        secretUntilTheEnd,
        metadata,
      }
    })

    return {
      orgAddress: organization?.address ?? '',
      title: { default: form.title },
      description: form.description ? { default: form.description } : undefined,
      startDate: parsedStart,
      endDate,
      streamUri: permission(SubscriptionPermission.LiveStreaming) ? form.streamUri || undefined : undefined,
      census: censusSpec,
      questions,
    }
  }
}

export const useDraft = (draftId?: string | null) => {
  const { bearedFetch } = useAuth()

  return useQuery<{ metadata: Process }, Error>({
    queryKey: ['draft', draftId],
    enabled: !!draftId,
    queryFn: async () => {
      return bearedFetch(ApiEndpoints.OrganizationProcess.replace('{processId}', draftId!))
    },
    refetchOnWindowFocus: false,
  })
}

const ProcessCreateView = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const [formDraftLoaded, setFormDraftLoaded] = useState(false)
  const [nextId, setNextId] = useState('')
  const { groupId } = useParams()
  const [searchParams] = useSearchParams()
  const draftId = searchParams.get('draftId')
  const [storedDraftId, storeDraftId] = useLocalStorage('draft-id', null)
  const deleteDraft = useDeleteDraft()
  const navigate = useNavigate()
  const location = useLocation()
  const { showSidebar, toggleSidebar, openSidebar } = useSidebarVisibility()
  const methods = useForm<Process>({
    defaultValues: {
      ...defaultProcessValues,
      groupId,
    },
  })
  const reset = useSafeReset(methods.reset)
  const { activeTemplate, placeholders, setActiveTemplate } = useProcessTemplates()
  const [isLeaveConfirmationOpen, setLeaveConfirmationOpen] = useState(false)
  const openConfirmationModal = () => setLeaveConfirmationOpen(true)
  const { organization } = useOrganization()
  const { client: apiClient } = useApiClient()
  const queryClient = useQueryClient()
  const { isSubmitting, isSubmitSuccessful, isDirty } = methods.formState
  const { setStepDoneAsync } = useOrganizationSetup()
  const { trackPlausibleEvent } = useAnalytics()
  const formToVotingProcessRequest = useFormToVotingProcessRequest()
  const effectiveDraftId = draftId ?? storedDraftId
  // Confirm navigation if form is dirty
  const { isSamePath, cancel, proceed, resetSamePath, saveCooldown } = useConfirmOnNavigate({
    isDirty,
    isSubmitting,
    isSubmitSuccessful,
    onOpen: openConfirmationModal,
    onClose: () => setLeaveConfirmationOpen(false),
  })
  const { saveDraft, isSaving, skipSave } = useFormDraftSaver(
    isDirty,
    methods.getValues,
    effectiveDraftId,
    storeDraftId,
    saveCooldown
  )
  const { permission } = useSubscription()
  const { data: formDraft } = useDraft(effectiveDraftId)

  // Apply form draft if it exists
  useEffect(() => {
    setFormDraftLoaded(true)
    setNextId(Date.now().toString())
    if (!formDraft) return

    Object.entries(formDraft.metadata).forEach(([key, value]) => {
      if (key === 'groupId' && groupId) return
      methods.setValue(key as keyof Process, value as Process[keyof Process], { shouldDirty: true })
    })
  }, [formDraft, groupId, methods])

  const resetForm = () => {
    setActiveTemplate(null)
    reset()
    skipSave(true)
    queueMicrotask(() => {
      navigate(location.pathname, { replace: true })
      storeDraftId(null)
      skipSave(false)
    })
  }

  const showDraftSaveError = (error: unknown) => {
    const limit = permission(SubscriptionPermission.Drafts)
    let description = error instanceof Error ? error.message : String(error)

    if (error instanceof ApiError && error.apiError?.code === ErrorCode.DraftLimitReached) {
      description = t('process.create.limit_reached.message', {
        defaultValue:
          "You've reached your limit of {{ count }} drafts. To save this draft, delete an existing draft or upgrade your plan.",
        count: limit,
      })
    }

    toast({
      title: t('process.create.save_draft_error.title', { defaultValue: 'Error saving draft' }),
      description,
      type: 'error',
      duration: 10000,
    })
  }

  const handleSaveAndLeave = async () => {
    try {
      const result = await saveDraft(false)
      // Only proceed if save was successful
      if (result === 'saved') {
        proceed()
      }
    } catch (error) {
      showDraftSaveError(error)
    }
  }

  const handleManualSave = async () => {
    try {
      const result = await saveDraft(false)
      if (result === 'saved') {
        toast({
          title: t('process.create.save_draft_success', { defaultValue: 'Draft saved' }),
          type: 'success',
          duration: 3000,
        })
      }
    } catch (error) {
      showDraftSaveError(error)
    }
  }

  const discardAndLeave = () => {
    try {
      proceed()
      reset()
      storeDraftId(null)
    } catch (error) {
      toast({
        title: t('form.process_create.error_deleting_draft_title', { defaultValue: 'Error deleting draft' }),
        description: error instanceof Error ? error.message : String(error),
        type: 'error',
        duration: 3000,
      })
    }
  }

  const onSubmit = async (form: Process) => {
    try {
      const censusSpec = buildCensusSpec(form)
      const request = formToVotingProcessRequest(form, censusSpec)
      const draftId = await apiClient.elections.create(request)
      await apiClient.elections.publishAndWait(draftId)

      await setStepDoneAsync(SetupStepIds.firstVoteCreation)

      // Drop the cached elections pages so the processes index reflects the new
      // vote without a full page refresh. The index loads through a route loader
      // backed by ensureQueryData, which returns cached data without refetching
      // when it is merely marked stale — so invalidateQueries isn't enough here.
      // Removing the entries forces the loader to fetch fresh data on its next
      // navigation. The key omits the pagination params so every paginated/status
      // variant is evicted.
      queryClient.removeQueries({
        queryKey: QueryKeys.organization.elections(organization?.address),
      })

      trackPlausibleEvent({ name: AnalyticsEvents.ProcessCreated })

      toast({
        title: t('form.process_create.success_title'),
        description: t('form.process_create.success_description'),
        type: 'success',
        duration: 4000,
      })

      methods.reset(defaultProcessValues)

      const targetPath = draftId
        ? generatePath(Routes.dashboard.process, { id: draftId })
        : Routes.dashboard.processes.all

      if (effectiveDraftId) {
        await deleteDraft.mutateAsync({ draftId: effectiveDraftId, silent: true })
        localStorage.removeItem('draft-id')
      }

      navigate(targetPath)
    } catch (error) {
      console.error('Error creating election:', error)

      toast({
        title: t('form.process_create.error_title', { defaultValue: 'Error creating process' }),
        description: error instanceof Error ? error.message : String(error),
        type: 'error',
        duration: 4000,
      })
    }
  }

  const onError = (errors) => {
    console.error(
      '[ProcessCreate] Validation failed. Failing fields:',
      Object.entries(errors).map(([key, err]: [string, any]) => ({
        field: key,
        type: err?.type,
        message: err?.message,
        value: methods.getValues(key as keyof Process),
      }))
    )

    const sidebarFieldKeys = [
      'groupId',
      'census',
      'resultVisibility',
      'weightedVote',
      'endDate',
      'endTime',
      'startDate',
      'startTime',
    ]

    const hasSidebarErrors = sidebarFieldKeys.some((key) => key in errors)

    if (hasSidebarErrors) {
      openSidebar()
    }
  }

  if (!formDraftLoaded) {
    return (
      <Progress.Root size='xs' value={null}>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
    )
  }

  return (
    <FormProvider {...methods}>
      <Box position='relative' w='full' overflow='hidden' height='full'>
        <DashboardContents
          as='form'
          onSubmit={methods.handleSubmit(onSubmit, onError)}
          display='flex'
          flexDirection='row'
          position='relative'
          id='process-create'
          overflow='hidden'
        >
          <Box
            flex={1}
            marginRight={showSidebar ? { base: 0, md: 'sidebar' } : 0}
            transition='margin-right 0.3s'
            display='flex'
            flexDirection='column'
            gap={8}
            paddingRight={4}
            paddingBottom={4}
          >
            {/* Top bar with draft status and sidebar toggle */}
            <HStack position='sticky' top='0px' p={2} bg='chakra.body.bg' zIndex='contents'>
              {effectiveDraftId && (
                <Box px={3} py={1} borderRadius='full' bg='bg.muted' fontSize='sm'>
                  <Trans i18nKey='process.create.status.draft'>Draft</Trans>
                </Box>
              )}
              <Spacer />
              <ButtonGroup size='sm'>
                {isDirty && (
                  <IconButton
                    onClick={openConfirmationModal}
                    variant='outline'
                    aria-label={t('dashboard.actions.reset_form', {
                      defaultValue: 'Reset form',
                    })}
                  >
                    <Icon as={LuRotateCcw} />
                  </IconButton>
                )}
                <IconButton
                  aria-label={t('dashboard.actions.toggle_sidebar', {
                    defaultValue: 'Toggle sidebar',
                  })}
                  variant='outline'
                  onClick={toggleSidebar}
                >
                  <Icon as={LuSettings} />
                </IconButton>
                <Button type='submit' alignSelf='flex-end' loading={methods.formState.isSubmitting}>
                  <Trans i18nKey='process.create.action.publish'>Publish</Trans>
                </Button>
                <Button type='button' variant='outline' onClick={handleManualSave} loading={isSaving}>
                  <Trans i18nKey='process.create.action.save_draft'>Save</Trans>
                </Button>
              </ButtonGroup>
            </HStack>

            {/* Title, Video, and Description */}
            <VStack as='header' align='stretch' gap={4}>
              <TemplateButtons />
              <FormControl invalid={!!methods.formState.errors.title}>
                <Input
                  variant='borderless'
                  placeholder={
                    placeholders[activeTemplate]?.title ??
                    t('process.create.description.title', {
                      defaultValue: 'Voting Process Title',
                    })
                  }
                  size='2xl'
                  fontWeight='bold'
                  {...methods.register('title', {
                    required: t('form.error.required', 'This field is required'),
                  })}
                />
                <FormErrorMessage>{methods.formState.errors.title?.message?.toString()}</FormErrorMessage>
              </FormControl>

              {/* Live streaming video URL */}
              <LiveStreamingInput />
              <Controller
                name='description'
                control={methods.control}
                render={({ field }) => (
                  <Editor
                    key={nextId}
                    onChange={field.onChange}
                    variant='borderless'
                    placeholder={
                      placeholders[activeTemplate]?.description ??
                      t('process.create.description.placeholder', 'Add a description...')
                    }
                    defaultValue={field.value}
                  />
                )}
              />
            </VStack>

            <Questions />
          </Box>
        </DashboardContents>
        <CreateSidebar />
      </Box>
      <LeaveConfirmationModal
        isOpen={isLeaveConfirmationOpen}
        onCancel={cancel}
        onLeave={discardAndLeave}
        onSaveAndLeave={handleSaveAndLeave}
        onResetSamePath={() => resetSamePath(() => resetForm())}
        isSamePath={isSamePath}
      />
    </FormProvider>
  )
}

export const ProcessCreate = () => (
  <SidebarVisibilityProvider>
    <ProcessCreateView />
  </SidebarVisibilityProvider>
)

export default ProcessCreate

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
import { useMutation, useQuery } from '@tanstack/react-query'
import { useLocalStorage } from '@uidotdev/usehooks'
import { useClient, useOrganization } from '@vocdoni/react-components'
import {
  AccountData,
  ArchivedAccountData,
  Census,
  CspCensus,
  Election,
  ElectionCreationSteps,
  ensure0x,
  IElectionParameters,
  IQuestion,
  MultiChoiceElection,
  PlainCensus,
  UnpublishedElection,
  WeightedCensus,
} from '@vocdoni/sdk'
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
import { DashboardContents } from '~components/Dashboard/Contents'
import { SidebarVisibilityProvider, useSidebarVisibility } from '~components/Dashboard/SidebarContext'
import Editor from '~components/Editor'
import DeleteModal from '~components/Modal/DeleteModal'
import { Web3Address } from '~components/Process/Census/Web3'
import { useToast } from '~components/Toast'
import { SubscriptionPermission } from '~constants'
import { useDeleteDraft } from '~elements/dashboard/processes/drafts'
import { Routes } from '~routes'
import { SetupStepIds, useOrganizationSetup } from '~src/queries/organization'
import { AnalyticsEvents } from '~utils/analytics'
import { CensusMeta, CensusTypes } from '../Census/CensusType'
import { LiveStreamingInput } from './LiveStreamingInput'
import { Questions } from './MainContent'
import { CreateSidebar } from './Sidebar'
import { useProcessTemplates } from './TemplateProvider'
import { defaultProcessValues, Option, Process, SelectorTypes, TemplateConfigs, TemplateTypes } from './common'

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

export const isAccountData = (account: AccountData | ArchivedAccountData): account is AccountData =>
  'electionIndex' in account

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
  const { account } = useClient()
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
            body: { metadata: form, orgAddress: ensure0x(account?.address) },
          })
        } else {
          const draftProcessId = await createProcess.mutateAsync({
            metadata: form,
            orgAddress: ensure0x(account?.address),
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
      account?.address,
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

const useProcessBundle = () => {
  const { bearedFetch } = useAuth()
  return useMutation({
    mutationFn: async ({ censusId, processes }: { censusId: string; processes?: string[] }) => {
      return await bearedFetch<{ uri: string; root: string }>(ApiEndpoints.ProcessBundle, {
        method: 'POST',
        body: {
          censusId,
          processes,
        },
      })
    },
  })
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

export const useFormToElectionMapper = () => {
  const { permission } = useSubscription()

  const parseLocalDateTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr || !timeStr) return undefined

    return parse(`${dateStr} ${timeStr}`, 'yyyy-MM-dd HH:mm', new Date())
  }

  const getMaxCensusSize = (form: Process, census: Census) => {
    switch (form.censusType) {
      case CensusTypes.Spreadsheet:
      case CensusTypes.Web3:
        return form.addresses?.length ?? census?.size
      case CensusTypes.CSP:
      default:
        return form.census?.size ?? census?.size
    }
  }

  return (form: Process, census: Census): UnpublishedElection | MultiChoiceElection => {
    const start = form.autoStart ? new Date() : parseLocalDateTime(form.startDate, form.startTime)
    const startDate = form.autoStart ? undefined : parseLocalDateTime(form.startDate, form.startTime)
    const endDate = form.endDate && form.endTime ? parseLocalDateTime(form.endDate, form.endTime) : addDays(start, 1)

    let base: IElectionParameters = {
      census,
      title: form.title,
      description: form.description,
      electionType: {
        secretUntilTheEnd: Boolean(form.resultVisibility === 'hidden'),
      },
      maxCensusSize: getMaxCensusSize(form, census),
      questions: form.questions.map(
        (question) =>
          ({
            title: { default: question.title },
            description: { default: question.description },
            choices: question.options.map((q: Option, i: number) => {
              const choice: IQuestion['choices'][number] = {
                title: { default: q.option },
                value: i,
              }

              // Only include meta when extendedInfo is enabled
              if (form.extendedInfo) {
                choice.meta = {
                  description: q.description,
                  image: { default: q.image },
                }
              }

              return choice
            }),
          }) as IQuestion
      ),
      startDate,
      endDate,
      voteType: {
        maxVoteOverwrites: form.censusType === CensusTypes.CSP ? 0 : 10,
      },
      streamUri: permission(SubscriptionPermission.LiveStreaming) ? form.streamUri : undefined,
      temporarySecretIdentity:
        form.censusType === CensusTypes.Spreadsheet && Boolean(form.voterPrivacy === 'anonymous'),
      meta: {
        generated: 'ui-scaffold',
        app: 'vocdoni',
        census: {
          type: form.censusType,
          fields: form.spreadsheet?.header ?? undefined,
          weighted: form.weightedVote,
        } as CensusMeta,
      },
    }

    if (form.questionType === SelectorTypes.Multiple) {
      return MultiChoiceElection.from({
        ...base,
        canAbstain: false,
        maxNumberOfChoices: form.maxNumberOfChoices > 0 ? form.maxNumberOfChoices : form.questions[0].options.length,
        minNumberOfChoices: form.minNumberOfChoices ?? 0,
      })
    }

    return Election.from(base)
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
  const { client } = useClient()
  const { isSubmitting, isSubmitSuccessful, isDirty } = methods.formState
  const { setStepDoneAsync } = useOrganizationSetup()
  const processBundleMutation = useProcessBundle()
  const { trackPlausibleEvent } = useAnalytics()
  const formToElectionMapper = useFormToElectionMapper()
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

  const getCensus = async (form: Process, salt: string): Promise<Census> => {
    if (form.censusType === 'spreadsheet') {
      form.addresses = (await form.spreadsheet?.generateWallets(salt)) as Web3Address[]
    }
    let census = null
    switch (form.censusType) {
      case CensusTypes.CSP:
        if (!form.census?.id) {
          throw new Error(
            t('process_create.census_missing', { defaultValue: 'Census data is missing for Memberbase census type' })
          )
        }

        const nextElectionId = await client.electionService.nextElectionId(
          organization.address,
          formToElectionMapper(form, new CspCensus('0x23', document.location.href))
        )
        const bundledProcess = await processBundleMutation.mutateAsync({
          censusId: form.census?.id,
          processes: [nextElectionId],
        })
        census = new CspCensus(bundledProcess.root, bundledProcess.uri)

        return census
      case CensusTypes.Spreadsheet:
      case CensusTypes.Web3:
        if (form.weightedVote) {
          census = new WeightedCensus()
          const addresses = form.addresses.map(({ address, weight }) => ({
            key: address,
            weight: BigInt(weight),
          }))

          census.add(addresses)

          return census
        }
        census = new PlainCensus()
        const addresses = form.addresses.map(({ address }) => address)
        census.add(addresses)

        return census
      default:
        throw new Error(
          t('process_create.census_type_not_allowed', {
            type: form.censusType,
            defaultValue: 'Census type {{type}} not allowed',
          })
        )
    }
  }

  const onSubmit = async (form: Process) => {
    try {
      const account = await client.fetchAccountInfo()
      if (!account.address) {
        throw new Error(t('process_create.no_account_address', { defaultValue: 'No account address found.' }))
      }
      if (!isAccountData(account) || isNaN(account.electionIndex)) {
        throw new Error(
          t('process_create.no_election_index', { defaultValue: 'No election index found for the account.' })
        )
      }
      const saltOwner = organization.address || account.address
      const salt = await client.electionService.getElectionSalt(saltOwner, account.electionIndex)

      const census = await getCensus(form, salt)
      const election = formToElectionMapper(form, census)

      if (form.censusType === CensusTypes.Spreadsheet) {
        ;(election as any).meta = (election as any).meta || {}
        ;(election as any).meta.census = {
          ...((election as any).meta.census || {}),
          salt,
        }
      }

      let electionId: string | null = null
      for await (const step of client.createElectionSteps(election)) {
        if (step.key === ElectionCreationSteps.DONE) {
          electionId = step.electionId
          break
        }
      }

      await setStepDoneAsync(SetupStepIds.firstVoteCreation)

      trackPlausibleEvent({ name: AnalyticsEvents.ProcessCreated })

      toast({
        title: t('form.process_create.success_title'),
        description: t('form.process_create.success_description'),
        type: 'success',
        duration: 4000,
      })

      methods.reset(defaultProcessValues)

      const targetPath = electionId
        ? generatePath(Routes.dashboard.process, { id: electionId })
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
                <Box px={3} py={1} borderRadius='full' bg='gray.100' _dark={{ bg: 'whiteAlpha.200' }} fontSize='sm'>
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
                <Button
                  type='submit'
                  colorPalette='black'
                  alignSelf='flex-end'
                  loading={methods.formState.isSubmitting}
                >
                  <Trans i18nKey='process.create.action.publish'>Publish</Trans>
                </Button>
                <Button
                  type='button'
                  colorPalette='black'
                  variant='outline'
                  onClick={handleManualSave}
                  loading={isSaving}
                >
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

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
import { useOrganization } from '@vocdoni/react-components'
import { VocdoniApiError } from '@vocdoni/api-client'
import type {
  CensusSpec,
  Choice,
  CreateVotingProcessRequest,
  OrgMemberAuthField,
  OrgMemberTwoFaField,
  VotingProcessQuestionRequest,
} from '@vocdoni/api-types'
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
import { ApiError, ErrorCode } from '~components/Auth/api'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { DashboardContents } from '~components/Dashboard/Contents'
import { SidebarVisibilityProvider, useSidebarVisibility } from '~components/Dashboard/SidebarContext'
import Editor from '~components/Editor'
import DeleteModal from '~components/Modal/DeleteModal'
import { useToast } from '~components/Toast'
import { SubscriptionPermission } from '~constants'
import { QueryKeys } from '~queries/keys'
import { Routes } from '~routes'
import { AnalyticsEvents } from '~utils/analytics'
import { LiveStreamingInput } from './LiveStreamingInput'
import { getStoredDraftId, useStoredDraftId } from './draft-storage'
import { Questions } from './MainContent'
import { CreateSidebar } from './Sidebar'
import { useProcessTemplates } from './TemplateProvider'
import { defaultProcessValues, Option, Process, SelectorTypes, TemplateConfigs, TemplateTypes } from './common'
import { votingProcessToForm } from './draft-mapping'
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

type UpdateProcessRequest = {
  processId: string
  body: CreateVotingProcessRequest
}

/**
 * The draft limit is reported by the SaaS API either through the app's own
 * `api()` wrapper or through the integrator-sdk client, depending on the call.
 */
const isDraftLimitError = (error: unknown) =>
  (error instanceof ApiError && error.apiError?.code === ErrorCode.DraftLimitReached) ||
  (error instanceof VocdoniApiError && error.code === ErrorCode.DraftLimitReached)

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
  const createProcess = useCreateProcess()
  const updateProcess = useUpdateProcess()
  const formToVotingProcessRequest = useFormToVotingProcessRequest()
  const { organization } = useOrganization()
  const skipNextSaveRef = useRef(false)
  const [draftLimitReached, setDraftLimitReached] = useState(false)
  // Saving a draft replaces its whole question set server-side (the API deletes
  // the stored questions and inserts the ones it receives), so two writes in
  // flight at once can interleave and leave a duplicated question behind. Every
  // write goes through this queue, one at a time.
  const pendingWriteRef = useRef<Promise<unknown> | null>(null)
  // The id the next write must target, tracked outside React state so a write
  // queued before a re-render still updates the draft its predecessor created
  // instead of creating a second one.
  const draftIdRef = useRef(draftId)

  useEffect(() => {
    draftIdRef.current = draftId
  }, [draftId])

  const isCreating = createProcess.isPending
  const isUpdating = updateProcess.isPending
  const isSaving = isCreating || isUpdating

  const skipSave = (skip) => {
    skipNextSaveRef.current = skip
  }

  const enqueueWrite = useCallback(<T,>(write: () => Promise<T>): Promise<T> => {
    const run = (pendingWriteRef.current ?? Promise.resolve()).then(write, write)
    const settled = run.then(
      () => undefined,
      () => undefined
    )
    pendingWriteRef.current = settled
    void settled.then(() => {
      if (pendingWriteRef.current === settled) pendingWriteRef.current = null
    })
    return run
  }, [])

  // The single write path for a draft, used by both auto-save and publish.
  // Create-vs-update is decided *inside* the queued callback, against the ref:
  // deciding it in a render closure means a write queued while a previous
  // `createProcess` is still in flight sees a stale null id and creates a
  // second process, orphaning the first. `getBody` is called when the write
  // runs, not when it is queued, so a save that waited its turn still sends
  // the latest form. Resolves with the draft id the write landed on.
  const writeDraft = useCallback(
    (getBody: () => CreateVotingProcessRequest) =>
      enqueueWrite(async () => {
        const body = getBody()
        if (draftIdRef.current) {
          await updateProcess.mutateAsync({ processId: draftIdRef.current, body })
          return draftIdRef.current
        }
        const draftProcessId = await createProcess.mutateAsync(body)
        // Record the new id before returning: a publish that fails after this
        // point must keep updating this draft instead of leaking another one.
        draftIdRef.current = draftProcessId
        storeDraftId(draftProcessId)
        return draftProcessId
      }),
    [enqueueWrite, updateProcess, createProcess, storeDraftId]
  )

  const saveDraft = useCallback(
    async (isAutoSave = true) => {
      if (!isDirty || skipNextSaveRef.current) return 'skipped'
      // A draft can't be created without its owner org: wait for the address to resolve
      // instead of firing a request the API would reject.
      if (!organization?.address) return 'skipped'
      // Prevent repeated auto-save attempts once the draft limit is reached
      if (isAutoSave && draftLimitReached) return 'limit-reached'
      // Auto-saves fire on every blur: queueing one behind another only sends
      // the same values twice, and the interval picks up whatever changed
      // while a write was running.
      if (isAutoSave && pendingWriteRef.current) return 'skipped'

      try {
        // A draft is an unpublished process, so it is saved through the same
        // structured create/update requests the publish step uses. The values
        // are read when the write runs, not when it is queued, so a save that
        // waited for its turn still sends the latest form.
        await writeDraft(() => {
          const form = getValues()
          return formToVotingProcessRequest(form, buildCensusSpec(form))
        })
        saveCooldown?.(saveTimeoutMs)
        setDraftLimitReached(false)
        return 'saved'
      } catch (e) {
        // Check if it's a draft limit error
        if (isDraftLimitError(e)) {
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
    [isDirty, draftLimitReached, organization?.address, getValues, writeDraft, formToVotingProcessRequest, saveCooldown]
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

  // Publishing turns the draft into a process, so the stored pointer must be
  // dropped: a later "delete draft" following it would delete the vote we just
  // published. Only when it actually points at *this* draft though — publishing
  // one opened straight from the drafts list (`?draftId=`) must not forget an
  // unrelated resumable draft. Reads storage rather than the `draftId` prop:
  // on the create path the id is stored inside the write queue, after the
  // caller's render closure was captured, so the prop is stale (null) here.
  const clearPublishedDraftId = useCallback(
    (processId: string) => {
      if (getStoredDraftId(organization?.address) === processId) {
        storeDraftId(null)
      }
    },
    [organization?.address, storeDraftId]
  )

  return { saveDraft, isSaving, skipSave, draftLimitReached, writeDraft, clearPublishedDraftId }
}

const TemplateButtons = () => {
  const { t } = useTranslation()
  const methods = useFormContext<Process>()
  const { activeTemplate, setActiveTemplate } = useProcessTemplates()
  const [isTemplateModalOpen, setTemplateModalOpen] = useState(false)
  const reset = useSafeReset()
  const pendingTemplateRef = useRef<TemplateTypes | null>(null)
  const { trackEvent } = useAnalytics()

  const applyTemplate = (templateId: TemplateTypes) => {
    const config = TemplateConfigs[templateId]
    const previousFormValues = methods.getValues()
    trackEvent({ name: AnalyticsEvents.ProcessTemplateSelected, props: { template: templateId } })
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
  const { client } = useApiClient()

  return useMutation<string, Error, CreateVotingProcessRequest>({
    mutationFn: (request) => client.elections.create(request),
  })
}

const useUpdateProcess = () => {
  const { client } = useApiClient()

  return useMutation<void, Error, UpdateProcessRequest>({
    mutationFn: ({ processId, body }) => client.elections.update(processId, body),
  })
}

export const buildCensusSpec = (form: Process): CensusSpec => {
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
    // The SAAS API rejects processes without an owner org. Draft saves are skipped and
    // the publish/save buttons are disabled until the address resolves, so reaching this
    // guard means a caller bypassed those checks.
    if (!organization?.address) {
      throw new Error('Organization address is not available yet')
    }

    const parsedStart = form.autoStart ? undefined : parseLocalDateTime(form.startDate, form.startTime)
    const startRef = parsedStart ? new Date(parsedStart) : new Date()
    const endDate =
      form.endDate && form.endTime ? parseLocalDateTime(form.endDate, form.endTime) : addDays(startRef, 1).toISOString()

    const secretUntilTheEnd = form.resultVisibility === 'hidden'

    const questions: VotingProcessQuestionRequest[] = form.questions.map((question) => {
      const choices: Choice[] = question.options.map((q: Option, i: number) => ({
        title: { default: q.option },
        value: i,
      }))

      const metadata: Record<string, unknown> | undefined = question.extendedInfo
        ? {
            choices: question.options.map((q, i) => ({ value: i, description: q.description, image: q.image })),
          }
        : undefined

      if (question.type === SelectorTypes.Multiple) {
        const maxChoices =
          (question.maxNumberOfChoices ?? 0) > 0 ? question.maxNumberOfChoices! : question.options.length
        return {
          title: { default: question.title },
          description: question.description ? { default: question.description } : undefined,
          choices,
          type: 'multichoice',
          // uniqueChoices must stay false on multichoice: the backend derives the
          // dense 0/1 layout (one field per choice) and maps this flag onto the
          // on-chain uniqueValues, which would discard every multi-selection
          // ballot at tally — the API rejects the combination since ballot 1.0.0.
          typeSetup: { maxChoices, minChoices: question.minNumberOfChoices ?? 0, uniqueChoices: false },
          secretUntilTheEnd,
          metadata,
        }
      }

      return {
        title: { default: question.title },
        description: question.description ? { default: question.description } : undefined,
        choices,
        type: 'singlechoice',
        secretUntilTheEnd,
        metadata,
      }
    })

    return {
      orgAddress: organization.address,
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
  const { client } = useApiClient()

  return useQuery<Process | null, Error>({
    queryKey: ['draft', draftId],
    enabled: !!draftId,
    queryFn: async () => {
      try {
        return votingProcessToForm(await client.elections.get(draftId!))
      } catch (error) {
        // A stale draft id (deleted elsewhere, or left over from the legacy
        // draft store) must not break the wizard: fall back to a blank form.
        if (error instanceof VocdoniApiError && error.status === 404) return null
        throw error
      }
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
  // Draft ids are stored scoped to the acting organization so switching orgs never
  // resumes (and tries to update) a draft owned by a different org
  const [storedDraftId, storeDraftId] = useStoredDraftId(organization?.address)
  const queryClient = useQueryClient()
  const { isSubmitting, isSubmitSuccessful, isDirty } = methods.formState
  const { trackEvent } = useAnalytics()
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
  const { saveDraft, isSaving, skipSave, writeDraft, clearPublishedDraftId } = useFormDraftSaver(
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

    Object.entries(formDraft).forEach(([key, value]) => {
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

    if (isDraftLimitError(error)) {
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
    // Clicking publish blurs whatever field was focused, which fires an
    // auto-save: stop it, and queue this write behind any save still running,
    // so the draft is never rewritten by two requests at once.
    skipSave(true)
    try {
      const censusSpec = buildCensusSpec(form)
      const request = formToVotingProcessRequest(form, censusSpec)
      // The draft is the process: publish the one we have been saving instead of
      // creating a second one and leaving the draft orphaned behind it. Going
      // through `writeDraft` is what makes that hold — it resolves the draft id
      // inside the queue, so a blur auto-save still in flight is updated rather
      // than raced.
      const processId = await writeDraft(() => request)
      await apiClient.elections.publishAndWait(processId)

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

      trackEvent({
        name: AnalyticsEvents.ProcessCreated,
        props: {
          census_type: form.censusType,
          weighted: !!form.weightedVote,
          question_count: form.questions?.length ?? 0,
          template: activeTemplate || 'none',
          from_draft: !!effectiveDraftId,
        },
      })

      toast({
        title: t('form.process_create.success_title'),
        description: t('form.process_create.success_description'),
        type: 'success',
        duration: 4000,
      })

      methods.reset(defaultProcessValues)

      clearPublishedDraftId(processId)

      navigate(generatePath(Routes.dashboard.process, { id: processId }))
    } catch (error) {
      console.error('Error creating election:', error)
      // The draft is still a draft: let it keep auto-saving while the user fixes
      // whatever went wrong.
      skipSave(false)

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

    trackEvent({
      name: AnalyticsEvents.ProcessCreationFailed,
      props: {
        failed_fields: Object.keys(errors).join(','),
        sidebar_errors: hasSidebarErrors,
      },
    })

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
                {/* Both writes need the owner org address; keep them disabled until it resolves. */}
                <Button
                  type='submit'
                  alignSelf='flex-end'
                  loading={methods.formState.isSubmitting}
                  disabled={!organization?.address}
                >
                  <Trans i18nKey='process.create.action.publish'>Publish</Trans>
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleManualSave}
                  loading={isSaving}
                  disabled={!organization?.address}
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

import {
  Box,
  Button,
  ButtonGroup,
  FieldRoot as FormControl,
  FieldErrorText as FormErrorMessage,
  HStack,
  Icon,
  IconButton,
  Input,
  Progress,
  Spacer,
  VStack,
} from '@chakra-ui/react'
import { useQueryClient } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import { useCallback, useState } from 'react'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'
import { Trans, useTranslation } from 'react-i18next'
import { LuRotateCcw, LuSettings } from 'react-icons/lu'
import { generatePath, useLocation, useNavigate, useParams } from 'react-router'
import { useAnalytics } from '~components/AnalyticsProvider'
import { useSubscription } from '~components/Auth/Subscription'
import { DashboardContents } from '~components/Dashboard/Contents'
import { useSidebarVisibility } from '~components/Dashboard/SidebarContext'
import Editor from '~components/Editor'
import { useToast } from '~components/Toast'
import { SubscriptionPermission } from '~constants'
import { QueryKeys } from '~queries/keys'
import { Routes } from '~routes'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { AnalyticsEvents } from '~utils/analytics'
import { defaultProcessValues, Process } from './common'
import { isDraftLimitError } from './draft-limit'
import { formSnapshot } from './draft-snapshot'
import { useStoredDraftId } from './draft-storage'
import { LiveStreamingInput } from './LiveStreamingInput'
import { Questions } from './MainContent'
import { useDraft } from './queries'
import { buildCensusSpec, useFormToVotingProcessRequest } from './request'
import { CreateSidebar } from './Sidebar'
import { LeaveConfirmationModal, useConfirmOnNavigate } from './useConfirmOnNavigate'
import { useFormDraftSaver } from './useFormDraftSaver'

type VoteEditorFormProps = {
  /** The draft being edited, when it already exists */
  draftId: string | null
  /** The values as last saved: what "unsaved changes" are measured against */
  saved: Process
  /** The values the form opens with */
  initial: Process
}

const VoteEditorForm = ({ draftId, saved, initial }: VoteEditorFormProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const navigate = useNavigate()
  const location = useLocation()
  const { showSidebar, toggleSidebar, openSidebar } = useSidebarVisibility()
  const methods = useForm<Process>({ defaultValues: initial })
  const values = useWatch({ control: methods.control }) as Process
  // What was last written to the server. RHF's own dirty flag never clears after a save, which
  // kept autosaving and asking "leave without saving?" for work that was already saved.
  const [savedSnapshot, setSavedSnapshot] = useState(() => formSnapshot(saved))
  const unsaved = formSnapshot(values) !== savedSnapshot
  const onSaved = useCallback((sent: Process) => setSavedSnapshot(formSnapshot(sent)), [])
  const [currentDraftId, setCurrentDraftId] = useState(draftId)
  const [isLeaveConfirmationOpen, setLeaveConfirmationOpen] = useState(false)
  const [resetRequested, setResetRequested] = useState(false)
  const openConfirmationModal = () => setLeaveConfirmationOpen(true)
  const { organization } = useOrganization()
  const { client: apiClient } = useApiClient()
  // Draft ids are stored scoped to the acting organization so switching orgs never
  // resumes (and tries to update) a draft owned by a different org
  const [, storeDraftId] = useStoredDraftId(organization?.address)
  const queryClient = useQueryClient()
  const { isSubmitting, isSubmitSuccessful } = methods.formState
  const { trackEvent } = useAnalytics()
  const formToVotingProcessRequest = useFormToVotingProcessRequest()
  // Confirm navigation while there are unsaved changes
  const { cancel, proceed, saveCooldown } = useConfirmOnNavigate({
    isDirty: unsaved,
    isSubmitting,
    isSubmitSuccessful,
    onOpen: openConfirmationModal,
    onClose: () => setLeaveConfirmationOpen(false),
  })
  // A draft created here gets its id into the URL, so a reload reopens it. The navigation is
  // flagged as the editor's own: it neither remounts the editor nor asks to save first.
  const rememberDraft = useCallback(
    (id: string | null) => {
      storeDraftId(id)
      if (!id) return
      setCurrentDraftId(id)
      navigate({ search: `?draftId=${id}` }, { replace: true, state: { editorNav: true } })
    },
    [storeDraftId, navigate]
  )
  const { saveDraft, isSaving, skipSave, writeDraft, clearPublishedDraftId } = useFormDraftSaver(
    unsaved,
    methods.getValues,
    currentDraftId,
    rememberDraft,
    saveCooldown,
    onSaved
  )
  const { permission } = useSubscription()

  // Starting over is a new editing session: the page remounts the editor on a fresh navigation
  const resetForm = () => {
    skipSave(true)
    storeDraftId(null)
    navigate(location.pathname, { replace: true, state: { fresh: true } })
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
      if (result === 'untitled') {
        methods.setFocus('title')
        toast({
          title: t('process.create.save_draft_untitled', { defaultValue: 'Name your vote to save it as a draft' }),
          type: 'info',
          duration: 4000,
        })
      }
    } catch (error) {
      showDraftSaveError(error)
    }
  }

  const discardAndLeave = () => {
    try {
      // Only wipe the form and forget the draft id once the navigation is really
      // released; a no-op `proceed()` leaves the user here with their work intact.
      if (!proceed()) return
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
          anonymous: !!form.anonymousVoting,
          question_count: form.questions?.length ?? 0,
          from_draft: !!draftId,
        },
      })

      toast({
        title: t('form.process_create.success_title'),
        description: t('form.process_create.success_description'),
        type: 'success',
        duration: 4000,
      })

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
              {currentDraftId && (
                <Box px={3} py={1} borderRadius='full' bg='bg.muted' fontSize='sm'>
                  <Trans i18nKey='process.create.status.draft'>Draft</Trans>
                </Box>
              )}
              <Spacer />
              <ButtonGroup size='sm'>
                {unsaved && (
                  <IconButton
                    onClick={() => {
                      setResetRequested(true)
                      openConfirmationModal()
                    }}
                    variant='outline'
                    aria-label={t('dashboard.actions.reset_form', {
                      defaultValue: 'Reset form',
                    })}
                  >
                    <Icon as={LuRotateCcw} />
                  </IconButton>
                )}
                {/* data-testid: icon-only, so its only other handle is a
                    translated aria-label — and below `md` the e2e suite must
                    open this drawer before it can reach any setting. */}
                <IconButton
                  data-testid='wizard-settings-toggle'
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
              <FormControl invalid={!!methods.formState.errors.title}>
                <Input
                  variant='borderless'
                  placeholder={t('process.create.description.title', {
                    defaultValue: 'Voting Process Title',
                  })}
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
                    onChange={field.onChange}
                    variant='borderless'
                    placeholder={t('process.create.description.placeholder', 'Add a description...')}
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
        onCancel={() => {
          setResetRequested(false)
          setLeaveConfirmationOpen(false)
          cancel()
        }}
        onLeave={discardAndLeave}
        onSaveAndLeave={handleSaveAndLeave}
        onResetSamePath={() => {
          setLeaveConfirmationOpen(false)
          cancel()
          resetForm()
        }}
        // Only the reset button asks to start over: following a link to another vote remounts the
        // editor, so that is leaving like any other
        isSamePath={resetRequested}
        canSave={!!currentDraftId || !!values.title?.trim()}
      />
    </FormProvider>
  )
}

const Loading = () => (
  <Progress.Root size='xs' value={null}>
    <Progress.Track>
      <Progress.Range />
    </Progress.Track>
  </Progress.Root>
)

/**
 * One editing session. A draft is read once, when the session opens: drafts saved while editing
 * are never read back into the form, which used to overwrite whatever was typed meanwhile.
 */
export const VoteEditor = ({ draftId }: { draftId: string | null }) => {
  const { groupId } = useParams()
  const { data: draft, isFetchedAfterMount, isError } = useDraft(draftId)

  if (draftId && !isFetchedAfterMount && !isError) return <Loading />

  const saved = draft ?? { ...defaultProcessValues, groupId: groupId ?? '' }
  // A group picked from the groups board wins over the one the draft had
  const initial = groupId ? { ...saved, groupId } : saved

  return <VoteEditorForm draftId={draft ? draftId : null} saved={saved} initial={initial} />
}

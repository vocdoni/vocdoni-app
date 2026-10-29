import {
  AspectRatio,
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  IconButton,
  IconProps,
  Input,
  Link,
  Progress,
  SimpleGrid,
  TabsContent,
  TabsContentGroup,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
  TooltipContent,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
  useBreakpointValue,
  useClipboard,
  useRecipe,
  VStack,
  type HTMLChakraProps,
} from '@chakra-ui/react'
import {
  ElectionDescription,
  ElectionQuestions,
  ElectionResults,
  ElectionStatusBadge,
  ElectionTitle,
  useElection,
} from '@vocdoni/react-components'
import { hasResults, isLive, isSecretUntilTheEnd, processVoteCount } from '@vocdoni/api-client'
import { tryInferQuestionBallotType } from '@vocdoni/ballot'
import { useDateFns } from '~i18n/use-date-fns'
import { useAppEnv } from '~src/app-env'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'
import { forwardRef, ReactNode, useEffect, useRef } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  CalendarIcon,
  ClockIcon,
  CloseIcon,
  CopyIcon,
  DeleteIcon,
  ExternalLinkIcon,
  InfoIcon,
  PauseIcon,
  ResumeIcon,
  RetryIcon,
  SearchIcon,
  SettingsIcon,
  StopIcon,
  UnlinkIcon,
  UsersIcon,
  ViewIcon,
  VoteIcon,
} from '~theme/icons'
import ReactPlayer from 'react-player'
import { generatePath, matchPath, useLocation, useNavigate } from 'react-router'
import { ActionCancel, ActionContinue, ActionEnd, ActionPause, ActionsProvider } from '~components/Actions'
import {
  DashboardBox,
  DashboardContents,
  Heading,
  Sidebar,
  SidebarContents,
  SidebarSubtitle,
  SidebarTitle,
} from '~components/Dashboard/Contents'
import { SidebarVisibilityProvider, useSidebarVisibility } from '~components/Dashboard/SidebarContext'
import { ErrorBoundary } from '~components/Layout/ErrorBoundary'
import { StatusBadge, type StatusBadgeProps } from '~components/ui/StatusBadge'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { useCensusSize } from '~queries/census'
import { useProcessEarlyEndDate } from '~queries/process-end-date'
import { Routes } from '~src/router/routes'
import { getPublicProcessPath } from '~src/ssr/public-pages'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import type { StatusTone } from '~theme/status'
import { useAnonymityLabels } from '../anonymityLabels'
import { useResultTypeLabel } from '../resultTypeLabels'
import { VotingReportPdfButton } from '../VotingReportPdf/VotingReportPdfButton'
import { CensusSearch } from './CensusSearch'

export type ProcessViewTab = 'questions' | 'results'

export const getProcessViewTabFromPath = (pathname: string): ProcessViewTab =>
  matchPath(Routes.dashboard.processResults, pathname) ? 'results' : 'questions'

export const getProcessViewPathForTab = (id: string, tab: ProcessViewTab): string =>
  generatePath(tab === 'results' ? Routes.dashboard.processResults : Routes.dashboard.process, { id })

type ElectionVideoProps = HTMLChakraProps<'div'>

export const ElectionVideo = forwardRef<HTMLDivElement, ElectionVideoProps>((props, ref) => {
  const { election } = useElection()
  const { ...rest } = props
  const recipe = useRecipe({ key: 'ElectionVideo' })
  const styles = recipe()

  if (!election) return null

  const { streamUri } = election

  if (!streamUri) return null

  return (
    <Box ref={ref} css={styles} {...rest}>
      <AspectRatio ratio={16 / 9} width='100%' height='100%'>
        <ReactPlayer src={streamUri} width='100%' controls height='100%' />
      </AspectRatio>
    </Box>
  )
})

export const ProcessView = () => (
  <SidebarVisibilityProvider>
    <ProcessViewContent />
  </SidebarVisibilityProvider>
)

const ProcessViewContent = () => {
  const { t } = useTranslation()
  const { format: formatDate } = useDateFns()
  const { showSidebar, toggleSidebar } = useSidebarVisibility()
  const { election, results, status } = useElection()
  const { size: censusSize } = useCensusSize()
  const { data: earlyEndDate } = useProcessEarlyEndDate(election)
  const id = election?.id ?? ''
  const location = useLocation()
  const navigate = useNavigate()
  const tabValue = getProcessViewTabFromPath(location.pathname)
  const showResultsTab = !!election && status !== 'CANCELED'
  const shouldOpenResultsByDefault = !!election && hasResults(election)
  const hasResolvedInitialTabRef = useRef(false)
  const resolvedInitialTabElectionIdRef = useRef<string | null>(null)

  const publicLanguage = usePublicLanguage()
  const votingLink = `${document.location.origin}${getPublicProcessPath({ id, language: publicLanguage })}`
  const { copy } = useClipboard({ value: votingLink })

  useEffect(() => {
    if (resolvedInitialTabElectionIdRef.current !== id) {
      resolvedInitialTabElectionIdRef.current = id
      hasResolvedInitialTabRef.current = false
    }

    if (hasResolvedInitialTabRef.current) return
    if (!election) return

    hasResolvedInitialTabRef.current = true

    if (!shouldOpenResultsByDefault) return
    if (!matchPath(Routes.dashboard.process, location.pathname)) return

    navigate(getProcessViewPathForTab(id, 'results'), { replace: true })
  }, [shouldOpenResultsByDefault, navigate, id, location.pathname, election])

  useEffect(() => {
    if (tabValue === 'results' && !showResultsTab) {
      navigate(getProcessViewPathForTab(id, 'questions'), { replace: true })
    }
  }, [tabValue, showResultsTab, navigate, id])

  // Election-level participation BI, captured admin-side only (voters are never tracked)
  const trackedResultsElectionRef = useRef<string | null>(null)
  useEffect(() => {
    if (tabValue !== 'results' || !showResultsTab || trackedResultsElectionRef.current === id) return
    if (!election?.published) return
    trackedResultsElectionRef.current = id
    const voteCount = processVoteCount(results)
    trackAnalyticsEvent({
      name: AnalyticsEvents.ProcessResultsViewed,
      props: {
        election_id: id,
        status: status ?? 'unknown',
        vote_count: voteCount,
        census_size: censusSize,
        turnout_pct: censusSize ? Math.round((voteCount / censusSize) * 100) : 0,
      },
    })
  }, [tabValue, showResultsTab, id, election, results, status, censusSize])

  // The questions and results render through the ballot type, which cannot be inferred for some
  // legacy processes: such a section degrades on its own instead of taking the page down.
  const sectionFallback = (
    <Text color='fg.muted'>{t('error.loading_section', { defaultValue: 'This section could not be loaded' })}</Text>
  )

  return (
    <Box position='relative' w='full' minH='100dvh' overflow='hidden'>
      <DashboardContents display='flex' flexDirection='row' position='relative'>
        {/* Main content area */}
        <Box
          flex={1}
          minW={0}
          marginRight={showSidebar ? { base: 0, md: 'sidebar' } : 0}
          transition='margin-right {durations.slow}'
          display='flex'
          flexDirection='column'
          gap={8}
          paddingRight={4}
          paddingBottom={4}
        >
          {/* Title, schedule, and description */}
          <HStack justifyContent={'space-between'}>
            <ElectionStatusBadge />
            <IconButton
              aria-label={t('dashboard.actions.toggle_sidebar', { defaultValue: 'Toggle sidebar' })}
              variant='outline'
              onClick={toggleSidebar}
            >
              <Icon as={SettingsIcon} />
            </IconButton>
          </HStack>

          <Box as='header'>
            <ElectionTitle size='page' />
            <ElectionVideo mb='3' maxW='4xl' />
            <ElectionDescription color='fg.muted' />
          </Box>

          {/* Schedule */}
          <DashboardBox
            display='flex'
            flexDirection='column'
            flexWrap={'wrap'}
            justifyContent={'space-between'}
            gap={4}
          >
            <Heading>
              <Icon as={CalendarIcon} />
              <Trans i18nKey='calendar.title'>Schedule</Trans>
            </Heading>
            <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
              <SettingsField
                icon={CalendarIcon}
                text={t('start_date', 'Start date')}
                subtext={
                  election && formatDate(election.startDate, t('dashboard.process_view.date_format', 'MMMM do, y'))
                }
              />
              <SettingsField
                icon={ClockIcon}
                text={t('start_time', 'Start time')}
                subtext={election && formatDate(election.startDate, t('dashboard.process_view.time_format', 'p'))}
              />
              {/* One end, not two: a process stopped ahead of schedule keeps its configured `endDate`,
                  so showing that would state a moment voting did not actually stop at. `earlyEndDate`
                  is null whenever the process ran its course, which falls back to the configured one.
                  The PDF certifies both dates instead — there the schedule is part of the record. */}
              <SettingsField
                icon={CalendarIcon}
                text={t('end_date', 'End date')}
                subtext={
                  election &&
                  formatDate(earlyEndDate ?? election.endDate, t('dashboard.process_view.date_format', 'MMMM do, y'))
                }
              />
              <SettingsField
                icon={ClockIcon}
                text={t('end_time', 'End time')}
                subtext={
                  election && formatDate(earlyEndDate ?? election.endDate, t('dashboard.process_view.time_format', 'p'))
                }
              />
            </SimpleGrid>
          </DashboardBox>

          {/* Voting link */}

          <DashboardBox>
            <Box>
              <Heading>
                <Icon as={ExternalLinkIcon} />
                <Trans i18nKey='voting_link.title'>Voting Link</Trans>
              </Heading>
              <Text color='fg.muted' fontSize='sm'>
                <Trans i18nKey='voting_link.description'>
                  Share this link with your voters to participate in the voting process
                </Trans>
              </Text>
            </Box>

            <Flex justifyContent='space-between' gap={2} wrap='wrap'>
              <Input readOnly value={votingLink} flex='1 1 18rem' minW={0} />
              <IconButton variant='outline' onClick={copy} title={t('copy.copy', 'Copy')} aria-label={t('copy.copy')}>
                <Icon as={CopyIcon} />
              </IconButton>
              <IconButton asChild variant='outline' title={t('preview', 'Preview')} aria-label={t('preview')}>
                <Link href={votingLink} target='_blank' rel='noopener noreferrer'>
                  <Icon as={ViewIcon} />
                </Link>
              </IconButton>
            </Flex>
          </DashboardBox>

          {/* Questions & Results */}
          <DashboardBox>
            <Heading as='h4' alignContent='center' justifyContent='space-between'>
              <Trans i18nKey='questions_and_results'>Questions and results</Trans>
              <ResultsStateBadge />
            </Heading>
            <TabsRoot
              fitted
              value={tabValue}
              onValueChange={({ value }) => {
                const nextTab = value as ProcessViewTab
                if (nextTab === 'results' && !showResultsTab) return

                const nextPath = getProcessViewPathForTab(id, nextTab)
                if (nextPath !== location.pathname) navigate(nextPath)
              }}
              w='full'
            >
              <TabsList w='full'>
                <TabsTrigger value='questions'>{t('process.questions')}</TabsTrigger>
                {showResultsTab && <TabsTrigger value='results'>{t('process.results')}</TabsTrigger>}
              </TabsList>
              <TabsContentGroup mt={6}>
                <TabsContent value='questions' p={0}>
                  <Box p={6} border='1px solid' borderColor='border' borderRadius='md'>
                    <ErrorBoundary fallback={sectionFallback} resetKeys={[election]}>
                      <ElectionQuestions />
                    </ErrorBoundary>
                  </Box>
                </TabsContent>
                {showResultsTab && (
                  <TabsContent value='results' p={0}>
                    <Box p={6} border='1px solid' borderColor='border' borderRadius='md'>
                      <ErrorBoundary fallback={sectionFallback} resetKeys={[election, results]}>
                        <ElectionResults />
                      </ErrorBoundary>
                    </Box>
                  </TabsContent>
                )}
              </TabsContentGroup>
            </TabsRoot>
          </DashboardBox>
        </Box>
      </DashboardContents>

      <ProcessViewSidebar />
    </Box>
  )
}

const ResultsStateBadge = (props: Omit<StatusBadgeProps, 'tone'>) => {
  const { election } = useElection()
  const { t } = useTranslation()

  if (!election) return null

  if (isLive(election) || hasResults(election)) {
    let tone: StatusTone = 'info'
    let text = t('results_state.live_results', 'Live results')
    let tooltip = t(
      'results_state.live_results_tooltip',
      'This voting process shows live results. However, it is still in progress, so the results may change before the vote ends.'
    )
    if (isLive(election) && isSecretUntilTheEnd(election)) {
      tone = 'warning'
      text = t('results_state.secret_until_end', 'Awaiting results')
      tooltip = t(
        'results_state.secret_until_end_tooltip',
        'Results are hidden and will only be available once voting ends'
      )
    }
    if (hasResults(election)) {
      tone = 'success'
      text = t('results_state.results_available', 'Results available')
      tooltip = null
    }
    const badge = (
      <StatusBadge tone={tone} endElement={tooltip ? <Icon as={InfoIcon} /> : undefined} {...props}>
        {text}
      </StatusBadge>
    )

    if (!tooltip) return badge

    return (
      <TooltipRoot positioning={{ placement: 'top' }}>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipPositioner>
          <TooltipContent>{tooltip}</TooltipContent>
        </TooltipPositioner>
      </TooltipRoot>
    )
  }

  return null
}

const ProcessViewSidebar = () => {
  const { election, results, status } = useElection()
  const { t } = useTranslation()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  const explorerUrl = getVocdoniClientConfig(VOCDONI_ENVIRONMENT).explorerUrl ?? 'https://explorer.vote'
  // The hook's `participation`/census size fall back to `maxCensusSize` for CSP elections, which is the
  // allowed-voters cap rather than the real census size. Recompute both from the actual census size.
  const { size: censusSize } = useCensusSize()
  const voteCount = processVoteCount(results)
  const participation = censusSize > 0 ? Math.round((voteCount / censusSize) * 1e4) / 100 : 0
  const isMobile = useBreakpointValue({ base: true, md: false })
  const { showSidebar, closeSidebar } = useSidebarVisibility()
  const firstQuestion = election?.questions[0]
  const resultTypeLabel = useResultTypeLabel(firstQuestion ? tryInferQuestionBallotType(firstQuestion) : undefined, '')
  const { short: anonymityLabel, mechanismDescription: anonymityMechanism } = useAnonymityLabels(
    election?.census?.anonymous
  )
  // The explorer only knows on-chain (Vochain) ids; each question is its own on-chain election
  const explorerProcessId = firstQuestion?.upstreamId

  return (
    <Sidebar show={showSidebar}>
      <SidebarContents borderBottom='1px solid' borderColor='border'>
        <SidebarTitle>
          <Trans i18nKey='vote_information'>Vote information</Trans>
        </SidebarTitle>
        {isMobile && (
          <IconButton
            aria-label={t('drawer.close', { defaultValue: 'Close drawer' })}
            variant='ghost'
            size='sm'
            position='absolute'
            top={2}
            right={2}
            onClick={closeSidebar}
          >
            <Icon as={CloseIcon} />
          </IconButton>
        )}
      </SidebarContents>
      <SidebarContents flex='1' overflowY='auto'>
        <VStack align='stretch'>
          <SidebarSubtitle>
            <Trans i18nKey='control_panel'>Control panel</Trans>
          </SidebarSubtitle>
          <ActionsProvider>
            {election && isLive(election) && (
              <ActionPause variant='outline' aria-label={t('process_actions.pause', { defaultValue: 'Pause' })}>
                <ControlIcon as={PauseIcon} color='status.warning.fg' />
                <Text as='span' flex={1} textAlign='left' fontSize='sm'>
                  <Trans i18nKey='pause_vote'>Pause vote</Trans>
                </Text>
              </ActionPause>
            )}
            {election && status === 'PAUSED' && (
              <ActionContinue
                variant='outline'
                aria-label={t('process_actions.continue', { defaultValue: 'Continue' })}
              >
                <ControlIcon as={ResumeIcon} color='status.success.fg' />
                <Text as='span' flex={1} textAlign='left' fontSize='sm'>
                  <Trans i18nKey='resume_vote'>Resume</Trans>
                </Text>
              </ActionContinue>
            )}
            <ActionEnd variant='outline' aria-label={t('process_actions.end', { defaultValue: 'End' })}>
              <ControlIcon as={StopIcon} color='destructive.fg' />
              <Text as='span' flex={1} textAlign='left' fontSize='sm'>
                <Trans i18nKey='end_vote'>End vote</Trans>
              </Text>
            </ActionEnd>
            <ActionCancel variant='outline' aria-label={t('process_actions.cancel', { defaultValue: 'Cancel' })}>
              <ControlIcon as={DeleteIcon} color='destructive.fg' />
              <Text as='span' flex={1} textAlign='left' fontSize='sm'>
                <Trans i18nKey='cancel_vote'>Cancel vote</Trans>
              </Text>
            </ActionCancel>
          </ActionsProvider>
          <SidebarSubtitle>
            <Trans i18nKey='voting_status'>Voting status</Trans>
          </SidebarSubtitle>
          {/* Total Votes Submitted */}
          <DashboardBox display='flex' flexDir='column' gap={3} alignContent='start'>
            <Box display='flex' justifyContent='space-between' w='full'>
              <Box display='flex' gap={2} alignItems='center'>
                <Icon as={VoteIcon} />
                <Text>
                  <Trans i18nKey='total_votes'>Total votes</Trans>
                </Text>
              </Box>
              <Text fontWeight='bold'>{voteCount}</Text>
            </Box>
            <Box pb={6} borderBottom='1px solid' borderColor='border'>
              <Box display='flex' w='full' justifyContent='space-between' alignItems='center' fontSize='xs' mb={1}>
                <Box>
                  <Trans i18nKey='turnout'>Turnout</Trans>
                </Box>
                <Box>{participation}%</Box>
              </Box>
              <Progress.Root colorPalette='gray' w='full' value={participation}>
                <Progress.Track>
                  <Progress.Range />
                </Progress.Track>
              </Progress.Root>
            </Box>
            <Box display='flex' justifyContent='space-between' fontSize='sm'>
              <Text display='flex' gap={2} alignItems='center' fontSize='inherit'>
                <Icon as={UsersIcon} />
                <Trans i18nKey='census_size'>Census size</Trans>
              </Text>
              <Text fontSize='inherit'>{censusSize || ''}</Text>
            </Box>
          </DashboardBox>

          {/* Census voter lookup */}
          <CensusSearch />

          {/* Voting settings */}
          <SidebarSubtitle>
            <Trans i18nKey='voting_settings'>Voting settings</Trans>
          </SidebarSubtitle>
          <SettingsField
            icon={VoteIcon}
            text={t('results_type.title', 'Results type')}
            subtext={resultTypeLabel || undefined}
          />
          <SettingsField
            icon={ViewIcon}
            text={t('result_visibility', 'Results visibility')}
            subtext={
              election
                ? isSecretUntilTheEnd(election)
                  ? t('results_state.hidden_until_end', 'Hidden until the end')
                  : t('results_state.live_results', 'Live results')
                : undefined
            }
          />
          <SettingsField
            icon={UnlinkIcon}
            text={t('voter_anonymity', 'Voter anonymity')}
            subtext={election ? anonymityLabel : undefined}
            tooltip={election ? anonymityMechanism : undefined}
          />
          <SettingsField
            icon={RetryIcon}
            text={t('vote_overwrite', 'Vote overwrite')}
            subtext={
              election
                ? firstQuestion?.ballotProtocol?.maxVoteOverwrites
                  ? t('results_state.enabled', 'Enabled')
                  : t('results_state.not_enabled', 'Not enabled')
                : undefined
            }
          />

          {/* Additional actions */}
          <SidebarSubtitle>
            <Trans i18nKey='additional_actions'>Additional actions</Trans>
          </SidebarSubtitle>
          {explorerProcessId && (
            <Button asChild variant='outline' colorPalette='gray' w='full' size='sm' justifyContent='start'>
              <Link href={`${explorerUrl}/process/${explorerProcessId}`} target='_blank' rel='noopener noreferrer'>
                <HStack gap={2}>
                  <Icon as={SearchIcon} />
                  <Text as='span'>
                    <Trans i18nKey='view_in_explorer'>View in explorer</Trans>
                  </Text>
                </HStack>
              </Link>
            </Button>
          )}
          <VotingReportPdfButton election={election} />
        </VStack>
      </SidebarContents>
    </Sidebar>
  )
}

const SettingsField = ({
  subtext,
  icon,
  text,
  tooltip,
}: {
  subtext?: string
  icon: typeof CalendarIcon
  text: ReactNode
  /** Explains the value in more words than `subtext` has room for — it is `nowrap`. */
  tooltip?: string
}) => {
  const label = (
    <Text fontSize='sm' fontWeight='bold'>
      {text}
      {tooltip && <Icon as={InfoIcon} ms={1} />}
    </Text>
  )

  return (
    <Box display='flex' gap={2} flex='1 1 0' minW={0} alignItems='center'>
      <Box
        color='fg.muted'
        bg='bg.muted'
        display='flex'
        alignItems='center'
        justifyContent='center'
        h='full'
        p={2}
        borderRadius='md'
      >
        <Icon as={icon} boxSize='icon.md' />
      </Box>
      <Box flex='1 1 0' minW={0} display='flex' flexDirection='column'>
        {tooltip ? (
          <TooltipRoot positioning={{ placement: 'top' }}>
            <TooltipTrigger asChild>{label}</TooltipTrigger>
            <TooltipPositioner>
              <TooltipContent>{tooltip}</TooltipContent>
            </TooltipPositioner>
          </TooltipRoot>
        ) : (
          label
        )}
        <Text whiteSpace='nowrap' color='fg.muted' fontSize='sm'>
          {subtext}
        </Text>
      </Box>
    </Box>
  )
}

const ControlIcon = forwardRef<SVGSVGElement, IconProps>((props, ref) => (
  <Icon mr={3} boxSize='icon.sm' ref={ref} {...props} />
))

import { AspectRatio, Box, Button, Flex, HStack, Icon, Link, Text } from '@chakra-ui/react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ElectionProvider,
  ElectionStatusBadge,
  ElectionTitle,
  useElection,
  useOrganization,
} from '@vocdoni/react-components'
import { processVoteCount } from '@vocdoni/api-client'
import { EmptyState } from '~components/ui/EmptyState'
import { ListLoader } from '~components/ui/Loader'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { useAuth } from '~components/Auth/useAuth'
import { useDateFns } from '~i18n/use-date-fns'
import { Trans, useTranslation } from 'react-i18next'
import { AddIcon, GoToIcon, UsersIcon, VoteIcon } from '~theme/icons'
import ReactPlayer from 'react-player'
import { generatePath, Link as ReactRouterLink } from 'react-router'
import { useSubscription } from '~components/Auth/Subscription'
import { DashboardBox, Heading, SubHeading } from '~components/Dashboard/Contents'
import { ListStateAlert } from '~components/Feedback/ListStateAlert'
import { WhatsAppButton } from '~components/Layout/WhatsappButton'
import { isPlanNamed, PlanName } from '~constants'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { Routes } from '~routes'
import { useAppEnv } from '~src/app-env'
import { useProfile } from '~src/queries/account'
import { paginatedElectionsQuery } from '~src/queries/organization'
import { UsageLimits } from './UsageLimits'

const OrganizationDashboard = () => {
  const { t } = useTranslation()
  const { organization } = useOrganization()

  return (
    <>
      <Heading>{t('dashboard.welcome.title', { defaultValue: 'Dashboard' })}</Heading>
      <SubHeading>
        {t('dashboard.welcome.subtitle', {
          defaultValue: "Here's an overview of your organization's voting activities",
        })}
      </SubHeading>
      <Tutorial />
      <Flex flexDirection={{ base: 'column', lg: 'row' }} gap={6} mb={6} alignItems='stretch'>
        <UsageLimits flex='1 1 60%' />
        {organization && <QuickActions flex='1 1 40%' />}
      </Flex>
      <OrganizationProcesses />
    </>
  )
}

const Tutorial = () => {
  const { t } = useTranslation()
  const { data: profile, isLoading } = useProfile()
  const { subscription, loading } = useSubscription()
  const videoTutorials = useAppEnv().VIDEO_TUTORIAL ?? { en: '' }
  const language = usePublicLanguage()
  const videoTutorialSrc = videoTutorials[language] ?? videoTutorials.en

  if (!videoTutorialSrc) {
    return null
  }

  return (
    <DashboardBox size='md' mb={6} display='flex' gap={10} position='relative' flexDirection='row'>
      <Box flex='1 1 60%'>
        <Text fontWeight='bold' mb={2} size='2xl'>
          {t('dashboard.welcome.hello', {
            name: profile?.firstName,
            defaultValue: 'Welcome to Vocdoni, {{name}}!',
          })}
        </Text>
        {loading || isLoading ? (
          <ListLoader mb={4} />
        ) : !subscription ? (
          <Text color='fg.muted' mb={4}>
            {t('dashboard.welcome.no_subscription', {
              defaultValue: 'No subscription available. Please create an organization to activate your plan.',
            })}
          </Text>
        ) : (
          subscription &&
          isPlanNamed(subscription.plan, PlanName.Free) && (
            <Text color='fg.muted' mb={4}>
              <Trans i18nKey='plan.free'>
                <strong>You're on the Free Plan</strong>, which already lets you launch votes. If you need more
                features, higher limits or specific options, explore the paid plans and try them for free.
              </Trans>
            </Text>
          )
        )}
        <Text color='fg.muted' mb={4}>
          <Trans i18nKey='plan.encouragement'>
            Launching a vote is simple, and participants can join from anywhere. Strong guarantees at a lower cost have
            made Vocdoni a trusted choice for hundreds of municipalities, associations, political parties and companies.
          </Trans>
        </Text>
        <Text color='fg.muted' mb={4}>
          {t('plan.special_needs', {
            defaultValue: 'Need help or something specific? Schedule a call.',
          })}
        </Text>
        <Flex gap={3} flexDirection={{ base: 'column', sm: 'row' }}>
          <Button asChild>
            <ReactRouterLink to={generatePath(Routes.processes.create)}>
              <HStack gap={2}>
                <Icon as={AddIcon} />
                <Text as='span'>
                  <Trans i18nKey='new_voting'>New vote</Trans>
                </Text>
              </HStack>
            </ReactRouterLink>
          </Button>
          <WhatsAppButton />
        </Flex>
      </Box>
      <Flex display={{ base: 'none', lg: 'flex' }} flex='1 1 33%' flexDirection='column'>
        <Text fontSize='lg' fontWeight='bold' textAlign='center' mb={2}>
          {t('dashboard.welcome.how_first_vote', {
            defaultValue: 'How to create your first vote',
          })}
        </Text>
        <AspectRatio ratio={16 / 9}>
          <ReactPlayer src={videoTutorialSrc} style={{ width: '100%', height: 'auto', aspectRatio: '16/9' }} />
        </AspectRatio>
      </Flex>
    </DashboardBox>
  )
}

const OrganizationProcesses = () => {
  const { t } = useTranslation()

  return (
    <Flex flexDirection={{ base: 'column', md: 'row' }} gap={4}>
      <DashboardBox size='md' minH='324px' flex='1 1 66%'>
        <Box mb={4}>
          <Text fontWeight='bold' mb={1.5} size='2xl'>
            {t('dashboard.welcome.recent_voting_title', { defaultValue: 'Recent voting processes' })}
          </Text>
          <Text color='fg.muted' fontSize='sm'>
            {t('dashboard.welcome.recent_voting_description', {
              defaultValue: "Your organization's latest voting activities",
            })}
          </Text>
        </Box>
        <Flex flexDirection='column' flex='1'>
          <Processes />
        </Flex>
      </DashboardBox>
    </Flex>
  )
}

const Processes = () => {
  const { t } = useTranslation()
  const { client } = useApiClient()
  const { organization } = useOrganization()
  const { currentAddress } = useAuth()
  const queryClient = useQueryClient()

  const { queryKey, queryFn } = paginatedElectionsQuery(currentAddress, client, {}, queryClient)

  const {
    data: elections,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey,
    queryFn,
    enabled: !!organization,
  })

  if (isLoading) {
    return <ListLoader />
  }

  // Checked before the error state on purpose: with no organization this query never ran, and
  // any error on its cache entry belongs to something else. Reporting it would replace the only
  // way forward — the button that creates the missing organization.
  if (!organization) {
    return (
      <EmptyState
        size='lg'
        flexGrow={1}
        title={t('dashboard.welcome.no_organization', { defaultValue: 'No organization found' })}
      >
        <Button asChild colorPalette='gray' variant='outline'>
          <ReactRouterLink to={generatePath(Routes.dashboard.organizationCreate)}>
            {t('dashboard.welcome.create_first_organization', {
              defaultValue: 'Create your first organization',
            })}
          </ReactRouterLink>
        </Button>
      </EmptyState>
    )
  }

  if (isError) {
    return (
      <Flex flexGrow={1} flexDir='column' justify='center' align='center' gap={4}>
        <ListStateAlert
          show
          status='error'
          title={t('dashboard.welcome.error_loading_processes', {
            defaultValue: 'Error loading voting processes',
          })}
          description={error instanceof Error ? error.message : undefined}
        />
      </Flex>
    )
  }

  if (!elections?.processes?.length) {
    return (
      <EmptyState
        size='lg'
        flexGrow={1}
        title={t('dashboard.welcome.empty', {
          defaultValue: 'No voting processes found',
        })}
        description={t('dashboard.welcome.empty_description', {
          defaultValue: 'Create your first vote to get started.',
        })}
      >
        <Button asChild colorPalette='gray' variant='outline'>
          <ReactRouterLink to={generatePath(Routes.processes.create)}>
            {t('dashboard.welcome.create_first_vote', {
              defaultValue: 'Create your first vote',
            })}
          </ReactRouterLink>
        </Button>
      </EmptyState>
    )
  }

  return (
    <Flex flexDir='column' gap={4} flex='1'>
      {elections.processes.map((election) => (
        <ElectionProvider id={election.id} key={election.id}>
          <RecentProcess />
        </ElectionProvider>
      ))}
      <Flex justify='flex-end' mt={4}>
        <Link asChild display='inline-flex' alignItems='center' gap={3} size='sm' tone='quiet' emphasis='medium'>
          <ReactRouterLink to={generatePath(Routes.dashboard.processes.base)}>
            {t('actions.create_first_vote', {
              defaultValue: 'View all processes',
            })}
            <Icon as={GoToIcon} />
          </ReactRouterLink>
        </Link>
      </Flex>
    </Flex>
  )
}

const RecentProcess = () => {
  const { t } = useTranslation()
  const { format } = useDateFns()
  const { election, results } = useElection()

  if (!election) return null

  return (
    <Flex align='center'>
      <Box flex='1' minW={0} mr={4}>
        <Link asChild emphasis='strong' display='block'>
          <ReactRouterLink to={generatePath(Routes.dashboard.process, { id: election.id })}>
            <ElectionTitle size='row' />
          </ReactRouterLink>
        </Link>
        <Text fontSize='sm' color='fg.muted' truncate>
          {t('election.ends_on', {
            defaultValue: 'Ends on {{date}}',
            date: format(election.endDate, t('organization.date_format')),
          })}
        </Text>
      </Box>
      <Flex align='center' gap={2} flexShrink={0}>
        <ElectionStatusBadge />
        <Text fontWeight='bold' fontSize={{ base: 'sm', md: 'md' }} whiteSpace='nowrap'>
          {t('election.total_votes', { defaultValue: '{{totalVotes}} votes', totalVotes: processVoteCount(results) })}
        </Text>
      </Flex>
    </Flex>
  )
}

const QuickActions = (props: React.ComponentProps<typeof DashboardBox>) => {
  const { t } = useTranslation()
  return (
    <DashboardBox size='md' flex='1 1 33%' justifyContent='normal' gap={0} {...props}>
      <Text fontWeight='bold' mb={1.5} size='2xl'>
        {t('dashboard.welcome.quick_actions', {
          defaultValue: 'Quick actions',
        })}
      </Text>
      <Text color='fg.muted' fontSize='sm' mb={6}>
        {t('dashboard.welcome.common_tasks_actions', {
          defaultValue: 'Common tasks and actions',
        })}
      </Text>
      <Flex flexDirection='column' gap={4} minW={0}>
        <Button asChild colorPalette='gray' variant='outline' justifyContent='start' minW={0}>
          <ReactRouterLink to={generatePath(Routes.processes.create)}>
            <HStack gap={2} minW={0}>
              <Icon as={AddIcon} flexShrink={0} />
              <Text as='span' truncate>
                {t('actions.create_new_vote', {
                  defaultValue: 'Create new vote',
                })}
              </Text>
            </HStack>
          </ReactRouterLink>
        </Button>
        <Button asChild colorPalette='gray' variant='outline' justifyContent='start' minW={0}>
          <ReactRouterLink to={generatePath(Routes.dashboard.processes.base)}>
            <HStack gap={2} minW={0}>
              <Icon as={VoteIcon} flexShrink={0} />
              <Text as='span' truncate>
                {t('actions.view_active_votes', {
                  defaultValue: 'View active votes',
                })}
              </Text>
            </HStack>
          </ReactRouterLink>
        </Button>
        <Button asChild colorPalette='gray' variant='outline' justifyContent='start' minW={0}>
          <ReactRouterLink to={generatePath(Routes.dashboard.settings.base)}>
            <HStack gap={2} minW={0}>
              <Icon as={UsersIcon} flexShrink={0} />
              <Text as='span' truncate>
                {t('actions.manage_team', {
                  defaultValue: 'Manage team',
                })}
              </Text>
            </HStack>
          </ReactRouterLink>
        </Button>
      </Flex>
    </DashboardBox>
  )
}

export default OrganizationDashboard

import {
  Accordion,
  AspectRatio,
  Box,
  Button,
  Checkbox,
  CloseButton,
  Flex,
  HStack,
  Icon,
  IconButton,
  Link,
  Progress,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { ElectionProvider, ElectionStatusBadge, ElectionTitle, useOrganization } from '@vocdoni/react-components'
import { PublishedElection } from '@vocdoni/sdk'
import { useApiClient } from '~src/providers/ApiClientProvider'
import { useAuth } from '~components/Auth/useAuth'
import { format } from 'date-fns'
import { Trans, useTranslation } from 'react-i18next'
import { LuArrowUpRight, LuCheck, LuPlus, LuUsers, LuVote } from 'react-icons/lu'
import ReactPlayer from 'react-player'
import { generatePath, Link as ReactRouterLink, useNavigate } from 'react-router-dom'
import { useSubscription } from '~components/Auth/Subscription'
import { DashboardBookerModalButton } from '~components/Dashboard/Booker'
import { DashboardBox, Heading, SubHeading } from '~components/Dashboard/Contents'
import { ListStateAlert } from '~components/Feedback/ListStateAlert'
import InvertedAccordionIcon from '~components/Layout/InvertedAccordionIcon'
import { WhatsAppButton } from '~components/Layout/WhatsappButton'
import { isPlanNamed, PlanName } from '~constants'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { Routes } from '~routes'
import { useAppEnv } from '~src/app-env'
import { useProfile } from '~src/queries/account'
import { CheckboxTypes, paginatedElectionsQuery, useOrganizationSetup } from '~src/queries/organization'
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
      <Setup />
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
    <DashboardBox p={6} mb={6} display='flex' gap={10} position='relative' flexDirection='row'>
      <Box flex='1 1 60%'>
        <Text fontWeight='bold' mb={2} size='2xl'>
          {t('dashboard.welcome.hello', {
            name: profile?.firstName,
            defaultValue: 'Welcome to Vocdoni, {{name}}!',
          })}
        </Text>
        {loading || isLoading ? (
          <Progress.Root value={null} mb={4}>
            <Progress.Track>
              <Progress.Range />
            </Progress.Track>
          </Progress.Root>
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
                <Icon as={LuPlus} />
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

const Setup = () => {
  const { t } = useTranslation()
  const { open: isOpen, onClose } = useDisclosure({ defaultOpen: true })
  const { checklist, progress, isStepsAccordionOpen } = useOrganizationSetup()
  const navigate = useNavigate()

  return (
    isStepsAccordionOpen &&
    isOpen && (
      <Box
        position='fixed'
        bottom={6}
        right={6}
        p={0}
        w='xs'
        borderRadius='2xl'
        boxShadow='xl'
        zIndex='overlay'
        border='1px solid'
        borderColor='border'
        bgColor='bg.panel'
      >
        <Accordion.Root defaultValue={['setup']} collapsible border='none'>
          <Accordion.Item value='setup' border='none' alignItems='center'>
            <Accordion.ItemTrigger as='div' px={4} gap={0} justifyContent='space-between'>
              <Flex gap={2} alignItems='center'>
                <Icon as={LuCheck} boxSize={5} />
                <Text fontWeight='bold'>
                  {t('setup.title', {
                    defaultValue: 'Complete your setup',
                  })}
                </Text>
              </Flex>
              <Flex justifySelf='end'>
                <Accordion.ItemIndicator asChild>
                  <IconButton variant='unstyled' colorPalette='gray' aria-label={t('setup.toggle_panel')} size='xs'>
                    <InvertedAccordionIcon />
                  </IconButton>
                </Accordion.ItemIndicator>
                <CloseButton onClick={onClose} size='xs' />
              </Flex>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent>
              <Accordion.ItemBody p={0}>
                <Flex flexDirection='column' px={4} py={2}>
                  <Flex justify='space-between' align='center'>
                    <Text fontSize='xs'>{t('setup.progress', { defaultValue: 'Your progress' })}</Text>
                    <Text fontSize='xs'>{Math.round(progress)}%</Text>
                  </Flex>
                  <Progress.Root value={progress} colorPalette='gray' size='sm' borderRadius='md'>
                    <Progress.Track borderRadius='0'>
                      <Progress.Range />
                    </Progress.Track>
                  </Progress.Root>
                </Flex>
                <Stack gap={3} direction='column' p={3} pt={2}>
                  {checklist.map((checkbox) => {
                    const type = checkbox.type || CheckboxTypes.route
                    if (type === CheckboxTypes.modal) {
                      return (
                        <DashboardBookerModalButton
                          key={checkbox.id}
                          trigger={
                            <Box w='full'>
                              <Checkbox.Root colorPalette='gray' checked={checkbox.completed} size='sm' p={2}>
                                <Checkbox.HiddenInput />
                                <Checkbox.Control />
                                <Checkbox.Label>
                                  <HStack ml={1} gap={2} align='center'>
                                    <Icon as={checkbox.icon} boxSize={4} />
                                    <Text fontSize='sm'>{checkbox.label}</Text>
                                  </HStack>
                                </Checkbox.Label>
                              </Checkbox.Root>
                            </Box>
                          }
                        />
                      )
                    }
                    return (
                      <Checkbox.Root
                        key={checkbox.id}
                        colorPalette='gray'
                        checked={checkbox.completed}
                        size='sm'
                        p={2}
                        onClick={() => navigate(checkbox.to)}
                      >
                        <Checkbox.HiddenInput />
                        <Checkbox.Control />
                        <Checkbox.Label>
                          <HStack ml={1} gap={2} align='center'>
                            <Icon as={checkbox.icon} boxSize={4} />
                            <Text fontSize='sm'>{checkbox.label}</Text>
                          </HStack>
                        </Checkbox.Label>
                      </Checkbox.Root>
                    )
                  })}
                </Stack>
              </Accordion.ItemBody>
            </Accordion.ItemContent>
          </Accordion.Item>
        </Accordion.Root>
      </Box>
    )
  )
}

const OrganizationProcesses = () => {
  const { t } = useTranslation()

  return (
    <Flex flexDirection={{ base: 'column', md: 'row' }} gap={4}>
      <DashboardBox p={6} minH='324px' flex='1 1 66%'>
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

  const { queryKey, queryFn } = paginatedElectionsQuery(currentAddress, client, {})

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
    return (
      <Progress.Root value={null}>
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>
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

  if (!organization) {
    return (
      <Flex flexGrow={1} flexDir='column' justify='center' align='center' gap={4}>
        <Text color='texts.subtle'>
          {t('dashboard.welcome.no_organization', { defaultValue: 'No organization found' })}
        </Text>
        <Button asChild colorPalette='gray' variant='outline'>
          <ReactRouterLink to={generatePath(Routes.dashboard.organizationCreate)}>
            {t('dashboard.welcome.create_first_organization', {
              defaultValue: 'Create your first organization',
            })}
          </ReactRouterLink>
        </Button>
      </Flex>
    )
  }

  if (!elections?.elections?.length) {
    return (
      <Flex flexGrow={1} flexDir='column' justify='center' align='center' gap={4}>
        <ListStateAlert
          show
          status='info'
          title={t('dashboard.welcome.empty', {
            defaultValue: 'No voting processes found',
          })}
          description={t('dashboard.welcome.empty_description', {
            defaultValue: 'Create your first vote to get started.',
          })}
        />
        <Button asChild colorPalette='gray' variant='outline'>
          <ReactRouterLink to={generatePath(Routes.processes.create)}>
            {t('dashboard.welcome.create_first_vote', {
              defaultValue: 'Create your first vote',
            })}
          </ReactRouterLink>
        </Button>
      </Flex>
    )
  }

  return (
    <Flex flexDir='column' gap={4} flex='1'>
      {elections.elections.map((election) => {
        if (!(election instanceof PublishedElection)) return null

        return (
          <ElectionProvider id={election.id} key={election.id}>
            <Flex align='center'>
              <Box flex='1' minW={0} mr={4}>
                <Link asChild variant='unstyled' fontWeight='500' display='block'>
                  <ReactRouterLink to={generatePath(Routes.dashboard.process, { id: election.id })}>
                    <ElectionTitle mb={0} fontSize='md' textAlign='left' fontWeight='500' truncate />
                  </ReactRouterLink>
                </Link>
                <Text fontSize='sm' color='texts.subtle' truncate>
                  {t('election.ends_on', {
                    defaultValue: 'Ends on {{date}}',
                    date: format(election.endDate, t('organization.date_format')),
                  })}
                </Text>
              </Box>
              <Flex align='center' gap={2} flexShrink={0}>
                <ElectionStatusBadge />
                <Text fontWeight='bold' fontSize={{ base: 'sm', md: 'md' }} whiteSpace='nowrap'>
                  {t('election.total_votes', { defaultValue: '{{totalVotes}} votes', totalVotes: election.voteCount })}
                </Text>
              </Flex>
            </Flex>
          </ElectionProvider>
        )
      })}
      <Flex justify='flex-end' mt={4}>
        <Link
          asChild
          display='inline-flex'
          alignItems='center'
          gap={3}
          fontSize='sm'
          color='fg'
          fontWeight='medium'
          textDecoration='none'
          _hover={{
            textDecoration: 'underline',
            color: 'fg',
          }}
        >
          <ReactRouterLink to={generatePath(Routes.dashboard.processes.base)}>
            {t('actions.create_first_vote', {
              defaultValue: 'View all processes',
            })}
            <Icon as={LuArrowUpRight} boxSize={4} />
          </ReactRouterLink>
        </Link>
      </Flex>
    </Flex>
  )
}

const QuickActions = (props: React.ComponentProps<typeof DashboardBox>) => {
  const { t } = useTranslation()
  return (
    <DashboardBox p={6} flex='1 1 33%' justifyContent='normal' gap={0} {...props}>
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
        <Button asChild colorPalette='gray' variant='outline' justifyContent='start' fontWeight='bold' minW={0}>
          <ReactRouterLink to={generatePath(Routes.processes.create)}>
            <HStack gap={2} minW={0}>
              <Icon as={LuPlus} flexShrink={0} />
              <Text as='span' truncate>
                {t('actions.create_new_vote', {
                  defaultValue: 'Create new vote',
                })}
              </Text>
            </HStack>
          </ReactRouterLink>
        </Button>
        <Button asChild colorPalette='gray' variant='outline' justifyContent='start' fontWeight='bold' minW={0}>
          <ReactRouterLink to={generatePath(Routes.dashboard.processes.base)}>
            <HStack gap={2} minW={0}>
              <Icon as={LuVote} flexShrink={0} />
              <Text as='span' truncate>
                {t('actions.view_active_votes', {
                  defaultValue: 'View active votes',
                })}
              </Text>
            </HStack>
          </ReactRouterLink>
        </Button>
        <Button asChild colorPalette='gray' variant='outline' justifyContent='start' fontWeight='bold' minW={0}>
          <ReactRouterLink to={generatePath(Routes.dashboard.settings.base)}>
            <HStack gap={2} minW={0}>
              <Icon as={LuUsers} flexShrink={0} />
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

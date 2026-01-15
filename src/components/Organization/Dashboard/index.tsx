import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  AspectRatio,
  Box,
  Button,
  Checkbox,
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
import { ElectionStatusBadge, ElectionTitle } from '@vocdoni/chakra-components'
import { ElectionProvider, useClient, useOrganization } from '@vocdoni/react-providers'
import { PublishedElection } from '@vocdoni/sdk'
import { format } from 'date-fns'
import { Trans, useTranslation } from 'react-i18next'
import { LuArrowUpRight, LuCheck, LuPlus, LuUsers, LuVote, LuX } from 'react-icons/lu'
import ReactPlayer from 'react-player'
import { generatePath, Link as ReactRouterLink } from 'react-router-dom'
import { useSubscription } from '~components/Auth/Subscription'
import { WhatsAppButton } from '~components/shared/Layout/WhatsappButton'
import { PlanId } from '~constants'
import { Routes } from '~routes'
import { DashboardBookerModalButton } from '~shared/Dashboard/Booker'
import { DashboardBox, Heading, SubHeading } from '~shared/Dashboard/Contents'
import InvertedAccordionIcon from '~shared/Layout/InvertedAccordionIcon'
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
        <Box flex='1 1 60%'>
          <UsageLimits />
        </Box>
        {organization && (
          <Box flex='1 1 40%'>
            <QuickActions />
          </Box>
        )}
      </Flex>
      <OrganizationProcesses />
      <Setup />
    </>
  )
}

const Tutorial = () => {
  const { t, i18n } = useTranslation()
  const { data: profile, isLoading } = useProfile()
  const { subscription, loading } = useSubscription()
  const videoTutorials = import.meta.env.VIDEO_TUTORIAL
  const language = i18n.resolvedLanguage || i18n.language || 'en'
  const videoTutorialSrc = videoTutorials[language] ?? videoTutorials.en

  return (
    <DashboardBox p={6} mb={12} display='flex' gap={10} position='relative' flexDirection='row'>
      <Box flex='1 1 60%'>
        <Text fontWeight='bold' mb={2} size='2xl'>
          {t('dashboard.welcome.hello', {
            name: profile?.firstName,
            defaultValue: 'Welcome to Vocdoni, {{name}}!',
          })}
        </Text>
        {loading || isLoading ? (
          <Progress isIndeterminate mb={4} />
        ) : !subscription ? (
          <Text color='gray.500' mb={4}>
            {t('dashboard.welcome.no_subscription', {
              defaultValue: 'No subscription available. Please create an organization to activate your plan.',
            })}
          </Text>
        ) : (
          subscription &&
          subscription.plan.id === PlanId.Free && (
            <Text color='gray.500' mb={4}>
              <Trans i18nKey='plan.free'>
                <strong>You're on the Free Plan</strong>, which already lets you launch votes. If you need more
                features, higher limits or specific options, explore the paid plans and try them for free.
              </Trans>
            </Text>
          )
        )}
        <Text color='gray.500' mb={4}>
          <Trans i18nKey='plan.encouragement'>
            Launching a vote is simple, and participants can join from anywhere. Strong guarantees at a lower cost have
            made Vocdoni a trusted choice for hundreds of municipalities, associations, political parties and companies.
          </Trans>
        </Text>
        <Text color='gray.500' mb={4}>
          {t('plan.special_needs', {
            defaultValue: 'Need help or something specific? Schedule a call.',
          })}
        </Text>
        <Flex gap={3} flexDirection={{ base: 'column', sm: 'row' }}>
          <Button as={ReactRouterLink} to={generatePath(Routes.processes.create)} leftIcon={<Icon as={LuPlus} />}>
            <Trans i18nKey='new_voting'>New vote</Trans>
          </Button>
          <WhatsAppButton />
        </Flex>
      </Box>
      <Flex display={{ base: 'none', lg: 'flex' }} flex='1 1 33%' flexDirection='column'>
        <Text size='lg' fontWeight='bold' textAlign='center' mb={2}>
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
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true })
  const { checklist, progress, isStepsAccordionOpen } = useOrganizationSetup()

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
        _light={{ borderColor: 'gray.200', bgColor: 'white' }}
        _dark={{ borderColor: 'black.700', bgColor: 'black.650' }}
      >
        <Accordion defaultIndex={0} allowToggle border='none'>
          <AccordionItem border='none' alignItems='center'>
            <Flex px={4} py={3}>
              <Flex flex='1' align='center'>
                <Icon as={LuCheck} mr={2} boxSize={5} />
                <Text fontWeight='bold'>
                  {t('setup.title', {
                    defaultValue: 'Complete your setup',
                  })}
                </Text>
              </Flex>
              <Flex>
                <AccordionButton
                  p={0}
                  as={IconButton}
                  variant='ghost'
                  h='28px'
                  minW='28px'
                  colorScheme='gray'
                  icon={<Icon as={InvertedAccordionIcon} />}
                ></AccordionButton>
                <IconButton
                  aria-label={t('common.close', { defaultValue: 'Close' })}
                  icon={<Icon as={LuX} />}
                  h='28px'
                  minW='28px'
                  variant='ghost'
                  colorScheme='gray'
                  onClick={onClose}
                />
              </Flex>
            </Flex>
            <AccordionPanel p={0}>
              <Flex flexDirection='column' px={4} py={2}>
                <Flex justify='space-between' align='center'>
                  <Text fontSize='xs'>{t('setup.progress', { defaultValue: 'Your progress' })}</Text>
                  <Text fontSize='xs'>{Math.round(progress)}%</Text>
                </Flex>
                <Progress
                  value={progress}
                  colorScheme='gray'
                  size='sm'
                  borderRadius='md'
                  sx={{
                    '& > [role="progressbar"]': {
                      borderRadius: '0',
                    },
                  }}
                />
              </Flex>
              <Stack spacing={3} direction='column' p={3} pt={2}>
                {checklist.map((checkbox) => {
                  const type = checkbox.type || CheckboxTypes.route
                  if (type === CheckboxTypes.modal) {
                    return (
                      <Checkbox key={checkbox.id} colorScheme='gray' isChecked={checkbox.completed} size='sm' p={2}>
                        <DashboardBookerModalButton
                          variant='unstyled'
                          ml={1}
                          height='auto'
                          display='flex'
                          fontWeight='normal'
                        >
                          {checkbox.label}
                        </DashboardBookerModalButton>
                      </Checkbox>
                    )
                  }
                  return (
                    <Checkbox
                      key={checkbox.id}
                      as={ReactRouterLink}
                      to={checkbox.to}
                      colorScheme='gray'
                      isChecked={checkbox.completed}
                      size='sm'
                      p={2}
                    >
                      <HStack ml={1} spacing={2} align='center'>
                        <Icon as={checkbox.icon} boxSize={4} />
                        <Text size='sm'>{checkbox.label}</Text>
                      </HStack>
                    </Checkbox>
                  )
                })}
              </Stack>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </Box>
    )
  )
}

const OrganizationProcesses = () => {
  const { t } = useTranslation()

  return (
    <Flex flexDirection={{ base: 'column', md: 'row' }} gap={4}>
      <DashboardBox p={6} minH='324px' flex='1 1 66%' display='flex' flexWrap='unset'>
        <Box mb={4}>
          <Text fontWeight='bold' mb={1.5} fontSize='2xl'>
            {t('dashboard.welcome.recent_voting_title', { defaultValue: 'Recent Voting Processes' })}
          </Text>
          <Text color='gray.500' fontSize='sm'>
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
  const { client, account } = useClient()
  const { organization } = useOrganization()

  const { queryKey, queryFn } = paginatedElectionsQuery(account, client, {})

  const {
    data: elections,
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn,
    enabled: !!organization,
  })

  if (isLoading) {
    return <Progress isIndeterminate />
  }

  if (isError) {
    return (
      <Flex flexGrow={1} flexDir='column' justify='center' align='center' gap={4}>
        <Text color='texts.subtle'>
          {t('dashboard.welcome.error_loading_processes', {
            defaultValue: 'Error loading voting processes',
          })}
        </Text>
      </Flex>
    )
  }

  if (!organization) {
    return (
      <Flex flexGrow={1} flexDir='column' justify='center' align='center' gap={4}>
        <Text color='texts.subtle'>
          {t('dashboard.welcome.no_organization', { defaultValue: 'No organization found' })}
        </Text>
        <Button
          as={ReactRouterLink}
          to={generatePath(Routes.dashboard.organizationCreate)}
          colorScheme='gray'
          variant='outline'
        >
          {t('dashboard.welcome.create_first_organization', {
            defaultValue: 'Create your first organization',
          })}
        </Button>
      </Flex>
    )
  }

  if (!elections?.elections?.length) {
    return (
      <Flex flexGrow={1} flexDir='column' justify='center' align='center' gap={4}>
        <Text color='gray.500'>
          {t('dashboard.welcome.empty', {
            defaultValue: 'No voting processes found',
          })}
        </Text>
        <Button as={ReactRouterLink} to={generatePath(Routes.processes.create)} colorScheme='gray' variant='outline'>
          {t('dashboard.welcome.create_first_vote', {
            defaultValue: 'Create your first vote',
          })}
        </Button>
      </Flex>
    )
  }

  return (
    <Flex flexDir='column' gap={4} flex='1'>
      {elections.elections.map((election) => {
        if (!(election instanceof PublishedElection)) return null

        return (
          <ElectionProvider election={election} id={election.id} key={election.id}>
            <Flex align='center'>
              <Box flex='1' minW={0} mr={4}>
                <Link
                  as={ReactRouterLink}
                  to={generatePath(Routes.dashboard.process, { id: election.id })}
                  _hover={{ textDecoration: 'underline' }}
                  fontWeight='500'
                  display='block'
                >
                  <ElectionTitle mb={0} fontSize='md' textAlign='left' fontWeight='500' isTruncated />
                </Link>
                <Text fontSize='sm' color='texts.subtle' isTruncated>
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
          as={ReactRouterLink}
          to={generatePath(Routes.dashboard.processes.base)}
          display='inline-flex'
          alignItems='center'
          gap={3}
          fontSize='sm'
          color='black'
          fontWeight='medium'
          textDecoration='none'
          _hover={{
            textDecoration: 'underline',
            color: 'black',
          }}
        >
          {t('actions.create_first_vote', {
            defaultValue: 'View all processes',
          })}
          <Icon as={LuArrowUpRight} boxSize={4} />
        </Link>
      </Flex>
    </Flex>
  )
}

const QuickActions = () => {
  const { t } = useTranslation()
  return (
    <DashboardBox p={6} flex='1 1 33%' justifyContent='normal' gap={0}>
      <Text fontWeight='bold' mb={1.5} size='2xl'>
        {t('dashboard.welcome.quick_actions', {
          defaultValue: 'Quick Actions',
        })}
      </Text>
      <Text color='gray.500' size='sm' mb={6}>
        {t('dashboard.welcome.common_tasks_actions', {
          defaultValue: 'Common tasks and actions',
        })}
      </Text>
      <Flex flexDirection='column' gap={4}>
        <Button
          as={ReactRouterLink}
          to={generatePath(Routes.processes.create)}
          colorScheme='gray'
          variant='outline'
          justifyContent='start'
          leftIcon={<Icon as={LuPlus} mr={2} />}
          fontWeight='bold'
        >
          {t('actions.create_new_vote', {
            defaultValue: 'Create new vote',
          })}
        </Button>
        <Button
          as={ReactRouterLink}
          to={generatePath(Routes.dashboard.processes.base)}
          colorScheme='gray'
          variant='outline'
          justifyContent='start'
          leftIcon={<Icon as={LuVote} mr={2} />}
          fontWeight='bold'
        >
          {t('actions.view_active_votes', {
            defaultValue: 'View active votes',
          })}
        </Button>
        <Button
          as={ReactRouterLink}
          to={generatePath(Routes.dashboard.settings.base)}
          colorScheme='gray'
          variant='outline'
          justifyContent='start'
          leftIcon={<Icon as={LuUsers} mr={2} />}
          fontWeight='bold'
        >
          {t('actions.manage_team', {
            defaultValue: 'Manage team',
          })}
        </Button>
      </Flex>
    </DashboardBox>
  )
}

export default OrganizationDashboard

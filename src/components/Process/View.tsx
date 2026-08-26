import {
  Box,
  BoxProps,
  Button,
  Dialog,
  Flex,
  Grid,
  GridItem,
  Icon,
  Link,
  Portal,
  Spinner,
  TabsContent,
  TabsContentGroup,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
  VStack,
} from '@chakra-ui/react'
import { ElectionQuestions, ElectionResults, useElection, useOrganization } from '@vocdoni/react-components'
import { hasResults } from '@vocdoni/api-client'
import { inferQuestionBallotType } from '@vocdoni/ballot'
import { useAppEnv } from '~src/app-env'
import { getVocdoniClientConfig } from '~src/providers/vocdoni-client-config'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { RiBarChartBoxLine, RiErrorWarningLine } from 'react-icons/ri'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { useCensusSize } from '~queries/census'
import { getPublicProcessSummaryPath } from '~src/ssr/public-pages'
import { useAuth } from '~components/Auth/useAuth'
import { sameAddress } from '~utils/address'
import { BallotBoxAnimated } from '../Layout/BallotBoxAnimated'
import { ManageProcessLink } from './ManageProcessLink'
import ProcessAside, { VoteButton } from './Aside'
import { CreatedBy } from './CreatedBy'
import { ElectionVideo } from './Dashboard/ProcessView'
import { ProcessDate } from './Date'
import Header from './Header'
import { useVotingMethodLabel } from './resultTypeLabels'

type ProcessInfoCardProps = {
  label: string
  description?: ReactNode
} & BoxProps

export const ProcessInfoCard = ({ label, description, ...props }: ProcessInfoCardProps) => {
  return (
    <Box {...props}>
      <Text fontWeight='bold' mb={1}>
        {label}
      </Text>
      {typeof description === 'string' ? (
        <Text color='texts.subtle' fontSize='sm'>
          {description}
        </Text>
      ) : (
        description
      )}
    </Box>
  )
}

const VotingMethod = () => {
  const { t } = useTranslation()
  const { election } = useElection()
  const isWeighted = election?.census?.weighted ?? false
  const firstQuestion = election?.questions[0]
  const ballotType = firstQuestion ? inferQuestionBallotType(firstQuestion) : undefined
  const votingMethod = useVotingMethodLabel(ballotType, {
    weighted: isWeighted,
    defaultValue: t('process.voting_method.unknown', { defaultValue: 'Unknown' }),
  })

  if (!election) return null

  return <>{votingMethod}</>
}

const ProcessInfoPanel = () => {
  const { t } = useTranslation()
  const language = usePublicLanguage()
  const { election, status } = useElection()
  const { organization, loading } = useOrganization()
  const { currentAddress } = useAuth()
  const { size: censusSize } = useCensusSize()

  if (!election) return null

  const showOrgInformation = loading || !!organization?.name?.default

  return (
    <Flex
      border='1px solid'
      borderColor='table.border'
      borderRadius='md'
      p={4}
      flexDirection='column'
      flexWrap='wrap'
      gap={4}
      h='fit-content'
    >
      <Box flexDir='row' display='flex' justifyContent='space-between' w={{ xl: 'full' }}>
        {status !== 'CANCELED' ? (
          <ProcessDate />
        ) : (
          <Text color='process.canceled' fontWeight='bold'>
            {t('process.status.canceled')}
          </Text>
        )}
        <ManageProcessLink />
      </Box>
      {/* The v2 process model carries no anonymous/electionType flag, so the
          "anonymous process" info card is gone with the legacy model. */}
      <ProcessInfoCard
        label={t('process.census')}
        description={
          <Text color='texts.subtle' fontSize='sm'>
            {t('process.people_in_census', { count: censusSize })}
          </Text>
        }
      />
      <ProcessInfoCard
        label={t('process.voting_type', { defaultValue: 'Voting method' })}
        description={
          <Text size='sm' color='texts.subtle'>
            <VotingMethod />
          </Text>
        }
      />
      {showOrgInformation && <ProcessInfoCard label={t('process.created_by')} description={<CreatedBy />} />}
      {status === 'PAUSED' && !sameAddress(election?.orgAddress, currentAddress) && (
        <Flex
          color='process.paused'
          _dark={{ color: 'white' }}
          gap={2}
          alignItems='center'
          border='1px solid'
          borderColor='process.paused'
          borderRadius='lg'
          p={2}
        >
          <Icon as={RiErrorWarningLine} />
          <ProcessInfoCard label={t('process.status.paused')} description={t('process.status.paused_description')} />
        </Flex>
      )}
      <Button asChild variant='outline' size='sm' alignSelf='start'>
        {/* Plain anchor (not a router Link): the public process view renders without a router context. */}
        <a href={getPublicProcessSummaryPath({ id: election.id, language })}>
          <Icon as={RiBarChartBoxLine} />
          {t('process.summary.view_summary')}
        </a>
      </Button>
    </Flex>
  )
}

export const ProcessView = () => {
  const { t } = useTranslation()
  const { election, hasVoted, status } = useElection()
  // No CSP session guard needed in v2: process auth tokens live in memory, scoped
  // to their ElectionProvider, so a stale session from another election can't leak in.
  const videoRef = useRef<HTMLDivElement>(null)
  const electionRef = useRef<HTMLDivElement>(null)
  const [tabValue, setTabValue] = useState<'questions' | 'results'>('questions')
  const [formErrors, setFormErrors] = useState<any>(null)

  const setQuestionsTab = () => setTabValue('questions')

  // If the election is finished, show the results tab
  useEffect(() => {
    if (election && hasResults(election)) {
      setTabValue('results')
    }
  }, [election])

  // Move the focus of the screen to the first unanswered question
  useEffect(() => {
    if (!formErrors) return

    // We gather all the inputs
    const inputs = electionRef?.current?.getElementsByTagName('input')

    if (inputs) {
      const inputsArray = Array.from(inputs)

      // The formErrors object has keys that represent the error names, so we filter the inputsArray with the names of the inputs
      const inputsError = inputsArray.filter((el) => el.name === Object.keys(formErrors)[0])

      // We get the last input which is the closest to the error message
      const lastInputError = inputsError[inputsError.length - 1]

      if (!lastInputError) return

      // Once we have the first input, we calculate the new position
      const newPosition = window.scrollY + lastInputError.getBoundingClientRect().top - 200

      // We move the focus to the corresponding height
      window.scrollTo({
        top: newPosition,
        behavior: 'smooth',
      })
    }
  }, [formErrors])

  // If the user has voted, move the focus to the top of the election
  useEffect(() => {
    if (hasVoted) {
      electionRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [hasVoted])

  return (
    <Grid
      templateColumns={{ base: '1fr', xl: 'minmax(0,1fr) var(--chakra-sizes-voting-sidebar)' }}
      gap={10}
      alignItems='start'
      mx='auto'
      minW={{ base: 'full', xl: 'voting.contents.min' }}
      maxW='voting.contents.max'
    >
      <GridItem>
        <Flex direction='column' gap={4}>
          <Header />

          <ElectionVideo ref={videoRef} />

          <TabsRoot
            fitted
            order={{ base: 2, xl: 1 }}
            value={tabValue}
            onValueChange={({ value }) => setTabValue(value as 'questions' | 'results')}
            flex={{ xl: '0 0 75%' }}
            w='full'
          >
            <TabsList w='full'>
              <TabsTrigger value='questions'>{t('process.questions')}</TabsTrigger>
              {election && status !== 'CANCELED' && <TabsTrigger value='results'>{t('process.results')}</TabsTrigger>}
            </TabsList>
            <TabsContentGroup mt={6}>
              <TabsContent value='questions' p={0}>
                <Box
                  ref={electionRef}
                  p={6}
                  mt={6}
                  border='1px solid'
                  borderColor='table.border'
                  borderRadius='md'
                  scrollMarginTop='70px'
                  // Ballot content must never appear in analytics/session replays,
                  // even when an org admin previews the process from the dashboard
                  className='ph-no-capture'
                >
                  <ElectionQuestions
                    onInvalid={(args) => {
                      setFormErrors(args)
                    }}
                  />
                </Box>
                <Box position='sticky' bottom={0} left={0} pb={1} pt={1}>
                  <VoteButton setQuestionsTab={setQuestionsTab} />
                </Box>
              </TabsContent>
              {election && status !== 'CANCELED' && (
                <TabsContent value='results' p={0}>
                  <Box p={6} border='1px solid' borderColor='table.border' borderRadius='md'>
                    <ElectionResults />
                  </Box>
                </TabsContent>
              )}
            </TabsContentGroup>
          </TabsRoot>
        </Flex>
      </GridItem>
      <GridItem display='grid' gap={6}>
        <ProcessInfoPanel />
        <ProcessAside />
      </GridItem>
      <VotingVoteModal />
      <SuccessVoteModal />
    </Grid>
  )
}

const SuccessVoteModal = () => {
  const { t } = useTranslation()
  const [isOpen, setOpen] = useState(false)
  const { election, hasVoted, voteId } = useElection()
  const { VOCDONI_ENVIRONMENT } = useAppEnv()
  const explorerUrl = getVocdoniClientConfig(VOCDONI_ENVIRONMENT).explorerUrl ?? 'https://explorer.vote'
  const prevHasVotedRef = useRef(false)

  useEffect(() => {
    if (hasVoted && !prevHasVotedRef.current) {
      setOpen(true)
    }
    prevHasVotedRef.current = hasVoted
  }, [hasVoted])

  if (!election || !hasVoted) return null

  const verify = voteId ? `${explorerUrl}/verify/${voteId}` : explorerUrl

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => setOpen(open)}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          {/* Contains the vote verification link (vote id) — never capture it */}
          {/* data-testid: this modal is the confirmation the e2e voting flow
              asserts on, and its only other handle is a translated title. */}
          <Dialog.Content className='ph-no-capture' data-testid='vote-success-modal'>
            <Dialog.CloseTrigger />
            <Dialog.Header display='flex' flexDirection='column'>
              <Dialog.Title>{t('process.success_modal.title')}</Dialog.Title>
              <BallotBoxAnimated alignSelf='center' />
            </Dialog.Header>
            <Dialog.Body>
              <Trans
                i18nKey='process.success_modal.text'
                components={{
                  verify: <Link href={verify} target='_blank' />,
                  p: <Text mb={2} />,
                }}
              />
            </Dialog.Body>

            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button>{t('process.success_modal.btn')}</Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  )
}

/**
 * Overlay covering the whole vote submission. Every question of the process is
 * its own on-chain election, so a multi-question vote confirms one question at a
 * time even though the envelopes are relayed as a single batch — show that
 * progress rather than an opaque spinner.
 *
 * It also owns the failure state: the vote is submitted by the SDK's question
 * form, so a failure would otherwise surface nowhere at all. The batch is
 * accepted or rejected as a unit, so a rejected relay means nothing was cast and
 * the voter can simply vote again; only a chain-level failure can leave some
 * questions cast, and voting again then sends just the remaining ones.
 */
export const VotingVoteModal = () => {
  const { t } = useTranslation()
  const { election, voting, voteStatus } = useElection()
  const [dismissedFailure, setDismissedFailure] = useState(false)

  const statuses = Object.values(voteStatus)
  const total = election?.questions.length ?? 0
  const confirmed = statuses.filter((questionStatus) => questionStatus === 'confirmed').length
  const failed = statuses.some((questionStatus) => questionStatus === 'failed')
  const showFailure = !voting && failed && !dismissedFailure

  // A new attempt clears the previous failure.
  useEffect(() => {
    if (voting) setDismissedFailure(false)
  }, [voting])

  return (
    <Dialog.Root
      open={voting || showFailure}
      onOpenChange={({ open }) => {
        if (!open) setDismissedFailure(true)
      }}
      closeOnEscape={showFailure}
      closeOnInteractOutside={showFailure}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Body>
            {showFailure ? (
              <>
                <Text textAlign='center' fontWeight='bold' mb={2}>
                  {t('process.vote_failed.title', { defaultValue: 'Your vote could not be cast' })}
                </Text>
                <Text textAlign='center'>
                  {confirmed > 0
                    ? t('process.vote_failed.partial', {
                        defaultValue: 'Some answers were not registered. Vote again to send the remaining ones.',
                      })
                    : t('process.vote_failed.none', {
                        defaultValue: 'No answer was registered. Please try again.',
                      })}
                </Text>
              </>
            ) : (
              <>
                <VStack>
                  <Spinner color='process.spinner' mb={5} w={10} h={10} />
                </VStack>
                <Text textAlign='center'>{t('process.voting')}</Text>
                {/* A single-question process would only ever read "0 of 1". */}
                {total > 1 && (
                  <Text textAlign='center' fontSize='sm' color='texts.subtle' mt={2}>
                    {t('process.voting_progress', {
                      defaultValue: '{{confirmed}} of {{total}} questions confirmed',
                      confirmed,
                      total,
                    })}
                  </Text>
                )}
              </>
            )}
          </Dialog.Body>
          {showFailure && (
            <Dialog.Footer>
              <Button onClick={() => setDismissedFailure(true)}>
                {t('process.vote_failed.close', { defaultValue: 'Close' })}
              </Button>
            </Dialog.Footer>
          )}
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

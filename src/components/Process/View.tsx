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
  TabsContent,
  TabsContentGroup,
  TabsList,
  TabsRoot,
  TabsTrigger,
  Text,
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
          <Dialog.Content>
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

// VotingVoteModal: the v2 ElectionContextValue exposes loading as a flat boolean,
// not as { voting: boolean }. The voting-in-progress overlay is owned by the
// voting flow components (Aside/VoteButton) which are deferred to a later refactor.
const VotingVoteModal = () => null

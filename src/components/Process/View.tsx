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
  TooltipContent,
  TooltipPositioner,
  TooltipRoot,
  TooltipTrigger,
  VStack,
} from '@chakra-ui/react'
import {
  ElectionQuestions,
  ElectionResults,
  environment,
  useClient,
  useElection,
  useOrganization,
} from '@vocdoni/react-components'
import { ElectionStatus, PublishedElection } from '@vocdoni/sdk'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { RiBarChartBoxLine, RiErrorWarningLine } from 'react-icons/ri'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { useCensusSize } from '~queries/census'
import { getPublicProcessSummaryPath } from '~src/ssr/public-pages'
import { BallotBoxAnimated } from '../Layout/BallotBoxAnimated'
import { ActionsMenu } from './ActionsMenu'
import ProcessAside, { VoteButton } from './Aside'
import { useCspSessionGuard } from './CSP/use-csp-session-guard'
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
  const { election, isWeighted } = useElection()

  if (!election) return null
  if (!(election instanceof PublishedElection)) return null

  const votingMethod = useVotingMethodLabel(election.resultsType?.name, {
    weighted: isWeighted,
    defaultValue: t('process.voting_method.unknown', { defaultValue: 'Unknown' }),
  })

  return <>{votingMethod}</>
}

const ProcessInfoPanel = () => {
  const { t } = useTranslation()
  const language = usePublicLanguage()
  const { election } = useElection()
  const { organization, loaded } = useOrganization()
  const { account } = useClient()
  // For CSP elections the actual census size comes from the bundle, not from `maxCensusSize`
  // (which only caps how many voters may vote). See useCensusSize.
  const { size: censusSize } = useCensusSize()

  if (!(election instanceof PublishedElection)) return null

  const showOrgInformation = !loaded || (loaded && organization?.account?.name)
  const showTotalCensusSize = censusSize > 0 && !!election?.maxCensusSize && election.maxCensusSize < censusSize

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
        {election?.status !== ElectionStatus.CANCELED ? (
          <ProcessDate />
        ) : (
          <Text color='process.canceled' fontWeight='bold'>
            {t('process.status.canceled')}
          </Text>
        )}
        <ActionsMenu />
      </Box>
      {election?.electionType.anonymous && (
        <ProcessInfoCard label={t('process.is_anonymous.title')} description={t('process.is_anonymous.description')} />
      )}
      <ProcessInfoCard
        label={t('process.census')}
        description={
          showTotalCensusSize ? (
            <TooltipRoot positioning={{ placement: 'top' }}>
              <TooltipTrigger asChild>
                <Text>
                  {t('process.total_census_size', {
                    censusSize,
                    maxCensusSize: election?.maxCensusSize,
                  })}
                </Text>
              </TooltipTrigger>
              <TooltipPositioner>
                <TooltipContent>
                  {t('process.total_census_size_tooltip', {
                    censusSize,
                    maxCensusSize: election?.maxCensusSize,
                    percent:
                      censusSize && election?.maxCensusSize
                        ? Math.round((election?.maxCensusSize / censusSize) * 100)
                        : 0,
                  })}
                </TooltipContent>
              </TooltipPositioner>
            </TooltipRoot>
          ) : (
            <Text color='texts.subtle' fontSize='sm'>
              {t('process.people_in_census', { count: censusSize })}
            </Text>
          )
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
      {election?.status === ElectionStatus.PAUSED && election?.organizationId !== account?.address && (
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
  const { election, voted, isAbleToVote } = useElection()
  // Close ineligible CSP sessions so the UI offers "Identify" instead of "Logout".
  useCspSessionGuard()
  const videoRef = useRef<HTMLDivElement>(null)
  const electionRef = useRef<HTMLDivElement>(null)
  const [tabValue, setTabValue] = useState<'questions' | 'results'>('questions')
  const [formErrors, setFormErrors] = useState<any>(null)

  const setQuestionsTab = () => setTabValue('questions')

  // If the election is finished, show the results tab
  useEffect(() => {
    if (election instanceof PublishedElection && election?.status === ElectionStatus.RESULTS) {
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
    if (voted) {
      electionRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [voted])

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
              {election instanceof PublishedElection && election?.status !== ElectionStatus.CANCELED && (
                <TabsTrigger value='results'>{t('process.results')}</TabsTrigger>
              )}
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
              {election instanceof PublishedElection && election?.status !== ElectionStatus.CANCELED && (
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
  const { votesLeft, election, voted } = useElection()
  const { env } = useClient()

  const [vLeft, setVLeft] = useState<number>(0)

  useEffect(() => {
    if (!vLeft && votesLeft >= 0) {
      setVLeft(votesLeft)
    }

    if (vLeft && votesLeft < vLeft) {
      setVLeft(votesLeft)
      setOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [votesLeft, vLeft])

  if (!election || !voted || !(election instanceof PublishedElection)) return null

  const verify = environment.verifyVote(env, voted)

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

const VotingVoteModal = () => {
  const { t } = useTranslation()
  const {
    loading: { voting },
  } = useElection()

  return (
    <Dialog.Root open={voting} onOpenChange={() => {}} closeOnEscape={false} closeOnInteractOutside={false}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Body>
            <VStack>
              <Spinner color='process.spinner' mb={5} w={10} h={10} />
            </VStack>
            <Text textAlign='center'>{t('process.voting')}</Text>
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

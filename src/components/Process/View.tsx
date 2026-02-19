import {
  Box,
  BoxProps,
  Button,
  Dialog,
  Flex,
  Grid,
  GridItem,
  Icon,
  Image,
  Link,
  List,
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
import { useClient, useElection, useOrganization } from '@vocdoni/react-providers'
import { CensusType, ElectionStatus, PublishedElection } from '@vocdoni/sdk'
import { ReactNode, useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { RiErrorWarningLine } from 'react-icons/ri'
import { FacebookShare, RedditShare, TelegramShare, TwitterShare } from '~components/Share'
import { ElectionQuestions, ElectionResults, environment } from '~components/vocdoni-ui'
import { ActionsMenu } from './ActionsMenu'
import ProcessAside, { VoteButton } from './Aside'
import { ConfirmVoteModal } from './ConfirmVoteModal'
import { CreatedBy } from './CreatedBy'
import { ElectionVideo } from './Dashboard/ProcessView'
import { ProcessDate } from './Date'
import Header from './Header'
import { useVotingMethodLabel } from './resultTypeLabels'
import successImg from '/assets/spreadsheet-success-modal.jpg'

type CensusInfo = { size: number; weight: bigint; type: CensusType }

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

  if (!election) return null
  if (!(election instanceof PublishedElection)) return null

  const isWeighted = Number(election?.census.weight) !== election?.census.size
  const votingMethod = useVotingMethodLabel(election.resultsType?.name, {
    weighted: isWeighted,
    defaultValue: t('process.voting_method.unknown', { defaultValue: 'Unknown' }),
  })

  return <>{votingMethod}</>
}

const ProcessInfoPanel = () => {
  const { t } = useTranslation()
  const { election } = useElection()
  const { organization, loaded } = useOrganization()
  const { account, client } = useClient()
  const [censusInfo, setCensusInfo] = useState<CensusInfo>()

  // Get the census info to show the total size if the maxCensusSize is less than the total size
  useEffect(() => {
    ;(async () => {
      try {
        if (!client || !(election instanceof PublishedElection) || !election?.census?.censusId) return
        const censusInfo: CensusInfo = await client.fetchCensusInfo(election.census.censusId)
        setCensusInfo(censusInfo)
      } catch (e) {
        // If the census info is not available, just ignore it
        setCensusInfo(undefined)
      }
    })()
  }, [election, client])

  if (!(election instanceof PublishedElection)) return null

  const showOrgInformation = !loaded || (loaded && organization?.account?.name)
  const showTotalCensusSize = censusInfo?.size && election?.maxCensusSize && election.maxCensusSize < censusInfo.size

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
                    censusSize: censusInfo?.size,
                    maxCensusSize: election?.maxCensusSize,
                  })}
                </Text>
              </TooltipTrigger>
              <TooltipPositioner>
                <TooltipContent bg='primary.600' color='white'>
                  {t('process.total_census_size_tooltip', {
                    censusSize: censusInfo?.size,
                    maxCensusSize: election?.maxCensusSize,
                    percent:
                      censusInfo?.size && election?.maxCensusSize
                        ? Math.round((election?.maxCensusSize / censusInfo?.size) * 100)
                        : 0,
                  })}
                </TooltipContent>
              </TooltipPositioner>
            </TooltipRoot>
          ) : (
            <Text color='texts.subtle' fontSize='sm'>
              {t('process.people_in_census', { count: election?.maxCensusSize })}
            </Text>
          )
        }
      />
      <ProcessInfoCard
        label={t('process.voting_type', { defaultValue: 'Voting method' })}
        description={<VotingMethod />}
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
    </Flex>
  )
}

export const ProcessView = () => {
  const { t } = useTranslation()
  const { election, voted } = useElection()
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
      templateColumns={{ base: '1fr', xl: 'minmax(0,1fr) 360px' }}
      gap={10}
      alignItems='start'
      mx='auto'
      maxW='voting-page'
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
                    confirmContents={(election, answers) => <ConfirmVoteModal election={election} answers={answers} />}
                  />
                </Box>
                <Box position='sticky' bottom={0} left={0} pb={1} pt={1} display={{ base: 'none', xl: 'block' }}>
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
  const url = encodeURIComponent(document.location.href)
  const caption = t('process.share_caption', { title: election?.title.default })

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => setOpen(open)}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <Dialog.Title>{t('process.success_modal.title')}</Dialog.Title>
            <Image src={successImg} borderRadius='lg' mt={3} />
          </Dialog.Header>
          <Dialog.Body>
            <Trans
              i18nKey='process.success_modal.text'
              components={{
                verify: <Link href={verify} target='_blank' />,
                p: <Text mb={2} />,
              }}
            />
            <List.Root listStyleType='none' display='flex' justifyContent='center' gap={6} mt={6} mb={2} ml={0}>
              <List.Item>
                <TwitterShare url={url} caption={caption} />
              </List.Item>
              <List.Item>
                <FacebookShare url={url} caption={caption} />
              </List.Item>
              <List.Item>
                <TelegramShare url={url} caption={caption} />
              </List.Item>
              <List.Item>
                <RedditShare url={url} caption={caption} />
              </List.Item>
            </List.Root>
          </Dialog.Body>

          <Dialog.Footer>
            <Dialog.ActionTrigger asChild>
              <Button>{t('process.success_modal.btn')}</Button>
            </Dialog.ActionTrigger>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
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

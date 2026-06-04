import { Button, Flex, Link, Text } from '@chakra-ui/react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import {
  VoteButton as CVoteButton,
  environment,
  SpreadsheetAccess,
  useClient,
  useElection,
  VoteWeight,
} from '@vocdoni/react-components'
import { CensusType, dotobject, ElectionStatus, formatUnits, InvalidElection, PublishedElection } from '@vocdoni/sdk'
import { TFunction } from 'i18next'
import { Trans, useTranslation } from 'react-i18next'
import { Link as ReactRouterLink } from 'react-router-dom'
import { CensusMeta, CensusTypes } from './Census/CensusType'
import { CspAuth } from './CSP/CSPAuthModal'
import LogoutButton from './LogoutButton'
import { ElectionLike } from './VotingReportPdf/VotingReportPdfButton'

const results = (result: number, decimals?: number) =>
  decimals ? parseInt(formatUnits(BigInt(result), decimals), 10) : result

const ProcessAside = () => {
  const { t } = useTranslation()
  const {
    election,
    connected,
    isInCensus,
    voted,
    votesLeft,
    loading: { voting, census: loadingCensus },
    loaded: { census: loadedCensus },
  } = useElection()
  const { env } = useClient()

  if (election instanceof InvalidElection) return null

  const census: CensusMeta = dotobject(election?.meta || {}, 'census')
  const isWalletCensus = !['spreadsheet', 'csp'].includes(census?.type)
  const syncingCensus = connected && isWalletCensus && !isInCensus && (loadingCensus || !loadedCensus)

  const renderVoteMenu =
    voted ||
    (voting && election?.electionType.anonymous) ||
    (hasOverwriteEnabled(election) && isInCensus && votesLeft > 0 && voted)

  const showVoters =
    election?.status !== ElectionStatus.CANCELED &&
    election?.status !== ElectionStatus.UPCOMING &&
    !(election?.electionType.anonymous && voting) &&
    !import.meta.env.HIDE_VOTER_COUNT
  const showVotes =
    !election?.electionType.secretUntilTheEnd &&
    election?.status !== ElectionStatus.UPCOMING &&
    !import.meta.env.HIDE_VOTER_COUNT

  let votes = 0
  if (election && showVotes && election?.questions.length) {
    const decimals = (election.meta as any)?.token?.decimals || 0
    // It just has to check the first question to get the total of votes.
    const question = election?.questions[0]
    const totalsAbstain = 'numAbstains' in question ? Number(question.numAbstains) : 0
    votes = question.choices.reduce((acc, curr) => acc + Number(curr.results), totalsAbstain)
    votes = results(votes, decimals)
  }

  const votersCount = election?.voteCount

  return (
    <Flex direction='column' border='1px solid' borderRadius='lg' borderColor='table.border' p={4} gap={2}>
      <Flex
        flexDirection='column'
        gap={5}
        flexWrap='wrap'
        border='1px solid'
        borderRadius='lg'
        borderColor='table.border'
        p={4}
      >
        <Text textAlign='center' fontSize='xl' textTransform='uppercase'>
          {election?.electionType.anonymous && voting
            ? t('aside.submitting')
            : getStatusText(t, election?.status).toUpperCase()}
        </Text>

        {showVoters && !showVotes && (
          <Flex direction={'row'} justifyContent='center' alignItems='center' gap={2}>
            <Trans
              i18nKey='aside.votes'
              components={{
                span: <Text as='span' fontWeight='bold' fontSize='3xl' lineHeight={1} />,
                text: <Text fontSize='xl' lineHeight={1.3} />,
              }}
              count={votersCount}
            />
          </Flex>
        )}

        {showVotes && (
          <Flex direction='column' justifyContent='center' alignItems='center' gap={2}>
            <Flex direction={'row'} justifyContent='center' alignItems='center' gap={2}>
              <Trans
                i18nKey='aside.votes_weight'
                components={{
                  span: <Text as='span' fontWeight='bold' fontSize='3xl' lineHeight={1} />,
                  text: <Text fontSize='xl' lineHeight={1.3} />,
                }}
                count={votes}
              />
            </Flex>
            {showVoters && votersCount !== votes && (
              <Flex direction={'row'} justifyContent='center' alignItems='center'>
                {'('}
                <Trans
                  i18nKey='aside.votes'
                  components={{
                    span: <Text as='span' fontWeight='bold' fontSize='md' lineHeight={1} mr={2} />,
                    text: <Text fontSize='md' lineHeight={1.3} />,
                  }}
                  count={election?.voteCount}
                />
                {')'}
              </Flex>
            )}
          </Flex>
        )}
      </Flex>
      {connected ? <LogoutButton /> : <CensusConnectButton />}
      {connected && isWalletCensus && !isInCensus && !syncingCensus && (
        <Text textAlign='center' fontSize='sm'>
          {t('aside.is_not_in_census')}
        </Text>
      )}

      {/* Vote menu: verify vote, votes left, voting anonymous advice... */}
      {renderVoteMenu && (
        <Flex flexDirection='column' alignItems='center' gap={3} w='full'>
          {voted !== null && voted.length > 0 && (
            <Text
              fontWeight='extrabold'
              fontSize='sm'
              css={{
                color: 'green.500',
                _dark: { color: 'green.300' },
              }}
              textAlign='center'
            >
              {t('aside.has_already_voted').toString()}
            </Text>
          )}
          {voting && election?.electionType.anonymous && (
            <Text fontSize='sm' textAlign='center' whiteSpace='pre-line'>
              {t('aside.voting_anonymous_advice')}
            </Text>
          )}
          {hasOverwriteEnabled(election) && isInCensus && votesLeft > 0 && voted && (
            <Text fontSize='sm' color='texts.subtle' textAlign='center'>
              {t('aside.overwrite_votes_left', { count: votesLeft })}
            </Text>
          )}
          {voted !== null && voted.length > 0 && (
            <Link css={{ _hover: { textDecoration: 'underline' } }} asChild whiteSpace='nowrap'>
              <ReactRouterLink to={environment.verifyVote(env, voted)} target='_blank'>
                {t('aside.verify_vote_on_explorer')}
              </ReactRouterLink>
            </Link>
          )}
        </Flex>
      )}
    </Flex>
  )
}

export const CensusConnectButton = () => {
  const { t } = useTranslation()

  const { election, connected } = useElection()
  const { openConnectModal } = useConnectModal()

  if (election instanceof InvalidElection || election?.status === ElectionStatus.CANCELED) {
    return null
  }

  const census: CensusMeta = dotobject(election?.meta || {}, 'census')
  const isCSP = election.census.type === CensusType.CSP
  const isSpreadsheet = census?.type === CensusTypes.Spreadsheet

  return (
    <>
      {!isCSP && !isSpreadsheet && !connected && (
        <Button onClick={openConnectModal} w='full'>
          {t('menu.connect').toString()}
        </Button>
      )}
      {isCSP && !connected && <CspAuth />}
      {isSpreadsheet && !connected && <SpreadsheetAccess />}
    </>
  )
}

export const VoteButton = ({ setQuestionsTab, ...props }: { setQuestionsTab: () => void }) => {
  const {
    election,
    connected,
    isWeighted,
    isAbleToVote,
    isInCensus,
    loading: { census: loadingCensus },
    loaded: { census: loadedCensus },
  } = useElection()

  if (election instanceof InvalidElection || election?.status === ElectionStatus.CANCELED) {
    return null
  }

  const census: CensusMeta = dotobject(election?.meta || {}, 'census')
  const isWalletCensus = !['spreadsheet', 'csp'].includes(census?.type)
  const syncingCensus = connected && isWalletCensus && !isInCensus && (loadingCensus || !loadedCensus)
  const hideVote = connected && !syncingCensus && !isAbleToVote

  if (hideVote) {
    return null
  }

  return (
    <Flex
      direction={'column'}
      justifyContent='center'
      alignItems='center'
      background='transparent'
      py={3}
      px={{ base: 3, lg: 0 }}
      gap={3}
      {...props}
    >
      {!connected ? (
        <CensusConnectButton />
      ) : (
        <>
          <CVoteButton
            w='100%'
            fontSize='lg'
            height='50px'
            onClick={setQuestionsTab}
            disabled={syncingCensus}
            css={{
              '&::disabled': {
                opacity: '0.8',
              },
            }}
          />
          {isWeighted && <VoteWeight />}
        </>
      )}
    </Flex>
  )
}

const hasOverwriteEnabled = (election?: ElectionLike): boolean =>
  typeof election !== 'undefined' &&
  election instanceof PublishedElection &&
  typeof election.voteType.maxVoteOverwrites !== 'undefined' &&
  election.voteType.maxVoteOverwrites > 0

const getStatusText = (t: TFunction<string, string>, electionStatus: ElectionStatus | undefined) => {
  switch (electionStatus) {
    case ElectionStatus.UPCOMING:
      return t('process.status.upcoming')
    case ElectionStatus.PAUSED:
    case ElectionStatus.ONGOING:
      return t('process.status.active')
    case ElectionStatus.ENDED:
    case ElectionStatus.CANCELED:
    case ElectionStatus.RESULTS:
      return t('process.status.ended')
    default:
      return t('process.status.unknown')
  }
}

export default ProcessAside

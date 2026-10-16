import { Flex, Spinner, Text } from '@chakra-ui/react'
import { VoteButton as CVoteButton, useElection, VoteWeight } from '@vocdoni/react-components'
import { isSecretUntilTheEnd, processVoteCount } from '@vocdoni/api-client'
import type { QuestionStatus } from '@vocdoni/api-types'
import { TFunction } from 'i18next'
import { Trans, useTranslation } from 'react-i18next'
import { useAppEnv } from '~src/app-env'
import { CspAuth } from './CSP/CSPAuthModal'
import LogoutButton from './LogoutButton'
import { useMetadataVerificationContext } from './MetadataVerification/context'

const ProcessAside = () => {
  const { t } = useTranslation()
  const { election, status, results, connected, isInCensus, hasVoted, voteId } = useElection()
  const appEnv = useAppEnv()

  if (!election) return null

  // The v2 context has no per-question "votes left to overwrite" counter and its
  // vote() skips questions already marked as voted regardless of overwrite settings,
  // so the previous "you can still correct your vote N times" messaging can't be
  // reproduced honestly here; it's dropped until the voting flow gets its own v2
  // refactor (see the matching note on `VotingVoteModal` in Process/View.tsx).
  const renderVoteMenu = hasVoted

  const showVoters = status !== 'CANCELED' && status !== 'UPCOMING' && !appEnv.HIDE_VOTER_COUNT
  const showVotes = !isSecretUntilTheEnd(election) && status !== 'UPCOMING' && !appEnv.HIDE_VOTER_COUNT

  const votes = processVoteCount(results)

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
          {getStatusText(t, status).toUpperCase()}
        </Text>

        {/* data-testid on both branches: the count is interpolated into a
            pluralized <Trans>, so the e2e suite has no way to read it without
            depending on the translated sentence around it. Exactly one of the
            two renders at a time, so the id stays unique. */}
        {showVoters && !showVotes && (
          <Flex direction={'row'} justifyContent='center' alignItems='center' gap={2} data-testid='process-vote-count'>
            <Trans
              i18nKey='aside.votes'
              components={{
                span: <Text as='span' fontWeight='bold' fontSize='3xl' lineHeight={1} />,
                text: <Text fontSize='xl' lineHeight={1.3} />,
              }}
              count={votes}
            />
          </Flex>
        )}

        {showVotes && (
          <Flex direction='column' justifyContent='center' alignItems='center' gap={2} data-testid='process-vote-count'>
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
          </Flex>
        )}
      </Flex>
      {connected ? <LogoutButton /> : <CensusConnectButton />}
      {/* The v2 context doesn't expose a separate "membership check in flight" loading
          flag (unlike the old loading.census/loaded.census pair), so this may flash
          briefly right after connecting, before isInCensus resolves. */}
      {connected && !isInCensus && (
        <Text textAlign='center' fontSize='sm'>
          {t('aside.is_not_in_census')}
        </Text>
      )}

      {/* The explorer verify links live on the Voted notice (one per question,
          each with its own vote id) — the aside only confirms the vote landed. */}
      {renderVoteMenu && (
        <Flex flexDirection='column' alignItems='center' gap={3} w='full'>
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
          {/* The vote id was only ever shown at cast time: an anonymous census
              keeps no link between the voter and the vote, so there is nothing
              to look up on a later visit. Say that instead of leaving the
              voter hunting for a receipt that cannot come back — but only once
              the id is actually gone: right after casting it is still on
              screen, in the Voted notice. */}
          {election.census?.anonymous && !voteId && (
            <Text fontSize='xs' color='texts.subtle' textAlign='center'>
              {t('aside.anonymous_receipt_gone', {
                defaultValue: 'Your receipt was shown when you voted and cannot be retrieved.',
              })}
            </Text>
          )}
        </Flex>
      )}
    </Flex>
  )
}

export const CensusConnectButton = () => {
  const { election, status, connected } = useElection()

  if (!election || status === 'CANCELED' || connected) {
    return null
  }

  // Every v2 census is member/CSP-backed (see CensusSpec's doc comment in
  // @vocdoni/api-types), so identifying against the process CSP (auth0/auth1)
  // is the only way into a voting session — the legacy wallet-connect entry
  // point is gone with the remote-signer model.
  return <CspAuth />
}

/**
 * Why the vote cannot be cast yet, from the ballot verification: the chain cannot tell what
 * the voter was shown, so a ballot that does not match what the organizer committed is
 * refused here, and the vote waits while the check runs rather than going out unverified.
 */
const VoteGateNotice = ({ gate }: { gate: 'pending' | 'blocked' }) => {
  const { t } = useTranslation()

  if (gate === 'pending') {
    return (
      <Flex alignItems='center' gap={2} fontSize='sm' color='texts.subtle' role='status'>
        <Spinner size='xs' />
        <Text>{t('process.vote_gate.pending', { defaultValue: 'Checking the ballot content before you vote…' })}</Text>
      </Flex>
    )
  }

  return (
    <Text fontSize='sm' color='red.500' textAlign='center' role='alert'>
      {t('process.vote_gate.blocked', {
        defaultValue:
          "The ballot content doesn't match what the organizer committed, so the vote can't be cast. Try again later or contact the organizer.",
      })}
    </Text>
  )
}

export const VoteButton = ({ setQuestionsTab, ...props }: { setQuestionsTab: () => void }) => {
  const { election, status, connected, isAbleToVote } = useElection()
  const gate = useMetadataVerificationContext()?.gate ?? 'allowed'

  if (!election || status === 'CANCELED') {
    return null
  }

  const isWeighted = election.census?.weighted === true
  // isAbleToVote already folds in connected/isInCensus/hasVoted, so a connected
  // voter who can't vote (not a member, or already voted) hides the button outright
  // rather than showing it disabled — the v2 context has no separate "still
  // checking membership" flag to keep it visible-but-disabled during that window.
  const hideVote = connected && !isAbleToVote

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
          <CVoteButton w='100%' fontSize='lg' height='50px' onClick={setQuestionsTab} disabled={gate !== 'allowed'} />
          {gate !== 'allowed' && <VoteGateNotice gate={gate} />}
          {isWeighted && <VoteWeight />}
        </>
      )}
    </Flex>
  )
}

const getStatusText = (t: TFunction<string, string>, status: QuestionStatus | null) => {
  switch (status) {
    case 'UPCOMING':
      return t('process.status.upcoming')
    case 'PAUSED':
    case 'ONGOING':
      return t('process.status.active')
    case 'ENDED':
    case 'CANCELED':
    case 'RESULTS':
      return t('process.status.ended')
    default:
      return t('process.status.unknown')
  }
}

export default ProcessAside

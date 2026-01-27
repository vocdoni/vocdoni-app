import { Button, Text } from '@chakra-ui/react'
import { useClient, useElection } from '@vocdoni/react-providers'
import { ElectionStatus, InvalidElection } from '@vocdoni/sdk'
import { useState } from 'react'

export const VoteButton = (props: React.ComponentProps<typeof Button>) => {
  const { connected } = useClient()
  const {
    client,
    connected: elConnected,
    loading: { voting },
    ConnectButton,
    isAbleToVote,
    election,
    voted,
    localize,
    sik: { signature },
    sikSignature,
  } = useElection()
  const [loading, setLoading] = useState(false)

  if (!election || election instanceof InvalidElection) {
    return null
  }

  const isDisabled = !client.wallet || !isAbleToVote || election.status !== ElectionStatus.ONGOING

  if (!connected && !elConnected && ConnectButton) {
    return <ConnectButton />
  }

  const button = {
    type: 'submit' as const,
    ...props,
    form: `election-questions-${election.id}`,
    disabled: isDisabled,
    loading: voting,
    children: voted && isAbleToVote ? localize('vote.button_update') : localize('vote.button'),
  }

  if (connected && election.electionType.anonymous && !signature) {
    button.loading = loading
    button.type = 'button'
    button.disabled = !client.wallet || !isAbleToVote
    button.children = localize('vote.sign')
    button.onClick = async () => {
      setLoading(true)
      try {
        sikSignature(await client.anonymousService.signSIKPayload(client.wallet))
      } finally {
        setLoading(false)
      }
    }
  }

  if ([ElectionStatus.ENDED, ElectionStatus.RESULTS].includes(election.status) && !voted && signature) {
    return <Text>{localize('errors.not_voted_in_ended_election')}</Text>
  }

  return <Button {...button} />
}

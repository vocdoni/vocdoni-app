import { Button, Text } from '@chakra-ui/react'
import { useClient, useElection } from '@vocdoni/react-providers'
import { ElectionStatus, InvalidElection } from '@vocdoni/sdk'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

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
    sik: { signature },
    sikSignature,
  } = useElection()
  const { t } = useTranslation()
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
    children: voted && isAbleToVote ? t('vote.button_update') : t('vote.button'),
  }

  if (connected && election.electionType.anonymous && !signature) {
    button.loading = loading
    button.type = 'button'
    button.disabled = !client.wallet || !isAbleToVote
    button.children = t('vote.sign')
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
    return (
      <Text>
        {t('errors.not_voted_in_ended_election', {
          defaultValue: 'You signed but did not vote in this ended election.',
        })}
      </Text>
    )
  }

  return <Button {...button} />
}

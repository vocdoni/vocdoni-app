import { Tag, type TagProps } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-providers'
import { ElectionStatus, InvalidElection, PublishedElection } from '@vocdoni/sdk'

export const ElectionStatusBadge = (props: TagProps) => {
  const { election, localize } = useElection()
  if (!election) return null
  let { colorScheme } = props
  if (!colorScheme) {
    colorScheme = 'green'
    if (election instanceof PublishedElection && [ElectionStatus.PAUSED, ElectionStatus.ENDED].includes(election.status)) {
      colorScheme = 'yellow'
    }
    if (election instanceof InvalidElection || [ElectionStatus.CANCELED, ElectionStatus.PROCESS_UNKNOWN].includes(election.status)) {
      colorScheme = 'red'
    }
  }
  const label =
    election instanceof PublishedElection && election.status
      ? localize(`statuses.${election.status.toLowerCase()}`)
      : localize('statuses.invalid')
  return (
    <Tag colorScheme={colorScheme} {...props}>
      {label}
    </Tag>
  )
}

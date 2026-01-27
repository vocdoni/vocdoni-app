import { TagLabel, TagRoot, type TagRootProps } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-providers'
import { ElectionStatus, InvalidElection, PublishedElection } from '@vocdoni/sdk'

export const ElectionStatusBadge = (props: TagRootProps) => {
  const { election, localize } = useElection()
  if (!election) return null
  let { colorPalette } = props
  if (!colorPalette) {
    colorPalette = 'green'
    if (
      election instanceof PublishedElection &&
      [ElectionStatus.PAUSED, ElectionStatus.ENDED].includes(election.status)
    ) {
      colorPalette = 'yellow'
    }
    if (
      election instanceof InvalidElection ||
      [ElectionStatus.CANCELED, ElectionStatus.PROCESS_UNKNOWN].includes(election.status)
    ) {
      colorPalette = 'red'
    }
  }
  const label =
    election instanceof PublishedElection && election.status
      ? localize(`statuses.${election.status.toLowerCase()}`)
      : localize('statuses.invalid')
  return (
    <TagRoot colorPalette={colorPalette} {...props}>
      <TagLabel>{label}</TagLabel>
    </TagRoot>
  )
}

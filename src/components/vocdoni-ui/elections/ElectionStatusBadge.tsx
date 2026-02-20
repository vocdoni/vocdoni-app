import { Tag, type TagRootProps } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-providers'
import { ElectionStatus, InvalidElection, PublishedElection } from '@vocdoni/sdk'
import { useTranslation } from 'react-i18next'

export const ElectionStatusBadge = (props: TagRootProps) => {
  const { election } = useElection()
  const { t } = useTranslation()
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
      ? t(`statuses.${election.status.toLowerCase()}`)
      : t('statuses.invalid')
  return (
    <Tag.Root colorPalette={colorPalette} variant='subtle' {...props}>
      <Tag.Label>{label}</Tag.Label>
    </Tag.Root>
  )
}

// Translation keys for extraction:
// t('statuses.canceled', 'Canceled')
// t('statuses.ended', 'Ended')
// t('statuses.invalid', 'Invalid')
// t('statuses.ongoing', 'Ongoing')
// t('statuses.paused', 'Paused')
// t('statuses.results', 'Results')
// t('statuses.upcoming', 'Upcoming')
// t('statuses.process_unknown', 'Unknown')

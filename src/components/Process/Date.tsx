import { Text } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { isUpcoming } from '@vocdoni/api-client'
import { useTranslation } from 'react-i18next'
import { ProcessInfoCard } from './View'

const getStatusLabel = (t: ReturnType<typeof useTranslation>['t'], status: string | null, upcoming: boolean) => {
  if (upcoming) return t('process.date.starts')
  switch (status) {
    case 'ENDED':
    case 'RESULTS':
      return t('process.date.ended')
    case 'CANCELED':
      return t('process.status.canceled')
    default:
      return t('process.date.ends')
  }
}

export const ProcessDate = () => {
  const { election, status } = useElection()
  const { t } = useTranslation()

  if (!election || !election?.startDate) return null
  if (status === 'CANCELED') return null

  const startDate = new Date(election.startDate)
  const endDate = new Date(election.endDate)
  const upcoming = isUpcoming(election)
  const target = upcoming ? startDate : endDate
  const statusText = getStatusLabel(t, status, upcoming)

  return (
    <ProcessInfoCard
      title={t('process.date.relative', { date: target })}
      label={statusText}
      description={t('process.date.relative', { date: target })}
    />
  )
}

export const ProcessDateInline = () => {
  const { election, status } = useElection()
  const { t } = useTranslation()

  if (!election || !election?.startDate) return null

  const startDate = new Date(election.startDate)
  const endDate = new Date(election.endDate)
  const upcoming = isUpcoming(election)
  const target = upcoming ? startDate : endDate
  const statusLabel = getStatusLabel(t, status, upcoming)

  return (
    <Text>
      {t('process.date.relative_inline', {
        status: statusLabel,
        date: target,
      })}
    </Text>
  )
}

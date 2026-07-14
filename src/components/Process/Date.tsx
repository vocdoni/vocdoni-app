import { Text } from '@chakra-ui/react'
import { useElection } from '@vocdoni/react-components'
import { isUpcoming } from '@vocdoni/api-client'
import { useTranslation } from 'react-i18next'
import { ProcessInfoCard } from './View'

const getStatusLabel = (t: ReturnType<typeof useTranslation>['t'], status: string, upcoming: boolean) => {
  if (upcoming) return t('process.date.starts')
  switch (status) {
    case 'ENDED':
      return t('process.date.ended')
    case 'CANCELED':
      return t('process.status.canceled')
    default:
      return t('process.date.ends')
  }
}

export const ProcessDate = () => {
  const { election } = useElection()
  const { t } = useTranslation()

  if (!election || !election?.startDate) return null
  if (election.status === 'CANCELED') return null

  const startDate = new Date(election.startDate)
  const endDate = new Date(election.endDate)
  const upcoming = isUpcoming(election)
  const target = upcoming ? startDate : endDate
  const statusText = getStatusLabel(t, election.status, upcoming)

  return (
    <ProcessInfoCard
      title={t('process.date.relative', { date: target })}
      label={statusText}
      description={t('process.date.relative', { date: target })}
    />
  )
}

export const ProcessDateInline = () => {
  const { election } = useElection()
  const { t } = useTranslation()

  if (!election || !election?.startDate) return null

  const startDate = new Date(election.startDate)
  const endDate = new Date(election.endDate)
  const upcoming = isUpcoming(election)
  const target = upcoming ? startDate : endDate
  const status = getStatusLabel(t, election.status, upcoming)

  return (
    <Text>
      {t('process.date.relative_inline', {
        status,
        date: target,
      })}
    </Text>
  )
}

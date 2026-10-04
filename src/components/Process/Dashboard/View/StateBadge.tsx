import { Badge, Box } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import type { ProcessState } from '../../processState'

export const StateBadge = ({ state, size = 'md' }: { state?: ProcessState; size?: 'sm' | 'md' }) => {
  const { t } = useTranslation()
  if (!state) return null

  const config: Record<ProcessState, { palette: string; label: string }> = {
    live: { palette: 'green', label: t('process_view.state.live', { defaultValue: 'Live' }) },
    paused: { palette: 'orange', label: t('process_view.state.paused', { defaultValue: 'Paused' }) },
    scheduled: { palette: 'blue', label: t('process_view.state.scheduled', { defaultValue: 'Scheduled' }) },
    ended: { palette: 'gray', label: t('process_view.state.ended', { defaultValue: 'Closed' }) },
    canceled: { palette: 'gray', label: t('process_view.state.canceled', { defaultValue: 'Canceled' }) },
  }
  const { palette, label } = config[state]

  return (
    <Badge colorPalette={palette} size={size} flexShrink={0}>
      {state === 'live' && <Box as='span' boxSize={1.5} borderRadius='full' bg='currentColor' />}
      {label}
    </Badge>
  )
}

import { Badge } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { StateBadge } from '~components/Process/Dashboard/View/StateBadge'
import type { VoteState } from './model'

/** A vote's state as a badge, drafts included. */
export const VoteStateBadge = ({ state, size = 'md' }: { state?: VoteState; size?: 'sm' | 'md' }) => {
  const { t } = useTranslation()
  if (state === 'draft')
    return (
      <Badge colorPalette='gray' variant='outline' size={size} flexShrink={0}>
        {t('censuses.state.draft', { defaultValue: 'Draft' })}
      </Badge>
    )
  return <StateBadge state={state} size={size} />
}

import { useTranslation } from 'react-i18next'
import { StateBadge, StatusPill } from '~components/Process/Dashboard/View/StateBadge'
import type { VoteState } from './model'

/** A vote's state as a badge, drafts included. */
export const VoteStateBadge = ({ state, size = 'md' }: { state?: VoteState; size?: 'sm' | 'md' }) => {
  const { t } = useTranslation()
  if (state === 'draft')
    return <StatusPill tone='gray' label={t('censuses.state.draft', { defaultValue: 'Draft' })} size={size} />
  return <StateBadge state={state} size={size} />
}

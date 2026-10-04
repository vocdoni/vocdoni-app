import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { Banner } from '~components/ui/Banner'
import type { AffectedVote, AffectedVoteState } from '~src/queries/affectedVotes'
import { untitledVote } from './labels'

export const voteStateLabel = (t: TFunction, state: AffectedVoteState) => {
  switch (state) {
    case 'live':
      return t('censuses.vote_state.live', { defaultValue: 'live' })
    case 'scheduled':
      return t('censuses.vote_state.scheduled', { defaultValue: 'scheduled' })
    case 'draft':
      return t('censuses.vote_state.draft', { defaultValue: 'draft' })
    case 'closed':
      return t('censuses.vote_state.closed', { defaultValue: 'closed' })
  }
}

/** "'Assemblea' (live), 'Junta 2025' (closed) and 2 more", in the admin's language. */
export const formatVoteList = (t: TFunction, language: string | undefined, votes: AffectedVote[], max = 3) => {
  const names = votes.slice(0, max).map((vote) =>
    t('censuses.vote_with_state', {
      defaultValue: "'{{title}}' ({{state}})",
      title: vote.title || untitledVote(t, vote.state === 'draft'),
      state: voteStateLabel(t, vote.state),
    })
  )
  const rest = votes.length - names.length
  if (rest > 0) names.push(t('censuses.more_votes', { count: rest, defaultValue: '{{count}} more' }))
  try {
    return new Intl.ListFormat(language, { type: 'conjunction' }).format(names)
  } catch {
    return names.join(', ')
  }
}

/** Shown wherever a saved census that votes use is about to change: it changes who can vote in them. */
export const UsedByWarning = ({ votes }: { votes: AffectedVote[] }) => {
  const { t, i18n } = useTranslation()
  if (!votes.length) return null
  return (
    <Banner status='warning'>
      {t('censuses.used_by_warning', {
        defaultValue: 'This also changes who can vote in {{votes}}.',
        votes: formatVoteList(t, i18n.resolvedLanguage, votes),
      })}
    </Banner>
  )
}

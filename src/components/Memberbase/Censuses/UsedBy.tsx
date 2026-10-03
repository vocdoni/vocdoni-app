import { Badge, Flex, Link, Stack, Text } from '@chakra-ui/react'
import type { TFunction } from 'i18next'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink } from 'react-router'
import { Banner } from '~components/ui/Banner'
import { SectionCard } from '~components/ui/SectionCard'
import { Routes } from '~routes'
import { useDateFns } from '~i18n/use-date-fns'
import type { AffectedVote, AffectedVoteState, CopyingVote } from '~src/queries/affectedVotes'
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

const BADGE_PALETTE: Record<AffectedVoteState, string> = {
  live: 'green',
  scheduled: 'blue',
  draft: 'gray',
  closed: 'gray',
}

/** The votes whose census is this saved census. */
export const UsedByCard = ({ votes }: { votes: AffectedVote[] }) => {
  const { t } = useTranslation()

  return (
    <SectionCard title={t('census_detail.used_by.title', { defaultValue: 'Used by' })}>
      {votes.length ? (
        <Stack as='ul' gap={2} listStyleType='none' m={0} p={0}>
          {votes.map((vote) => (
            <Flex as='li' key={vote.id} justify='space-between' align='center' gap={2}>
              <Link asChild fontSize='sm' truncate minW={0}>
                <RouterLink to={generatePath(Routes.dashboard.memberbase.voteCensus, { processId: vote.id })}>
                  {vote.title || untitledVote(t, vote.state === 'draft')}
                </RouterLink>
              </Link>
              <Badge colorPalette={BADGE_PALETTE[vote.state]} variant={vote.state === 'draft' ? 'outline' : 'subtle'}>
                {voteStateLabel(t, vote.state)}
              </Badge>
            </Flex>
          ))}
        </Stack>
      ) : (
        <Text fontSize='sm' color='fg.muted'>
          {t('census_detail.used_by.none', { defaultValue: 'No vote uses it yet.' })}
        </Text>
      )}
    </SectionCard>
  )
}

/**
 * The votes that copied this saved census into a census of their own. Listed so nobody edits it
 * thinking the change reaches them: it doesn't.
 */
export const CopiedIntoCard = ({ votes }: { votes: CopyingVote[] }) => {
  const { t } = useTranslation()
  const { format } = useDateFns()
  if (!votes.length) return null

  return (
    <SectionCard title={t('census_detail.copied_into.title', { defaultValue: 'Copied into' })}>
      <Stack gap={2}>
        <Stack as='ul' gap={2} listStyleType='none' m={0} p={0}>
          {votes.map((vote) => (
            <Flex as='li' key={vote.id} justify='space-between' align='center' gap={2}>
              <Stack gap={0} minW={0}>
                <Link asChild fontSize='sm' truncate minW={0}>
                  <RouterLink to={generatePath(Routes.dashboard.memberbase.voteCensus, { processId: vote.id })}>
                    {vote.title || untitledVote(t, vote.state === 'draft')}
                  </RouterLink>
                </Link>
                {vote.copiedAt && (
                  <Text fontSize='xs' color='fg.muted'>
                    {t('census_detail.copied_into.on', {
                      defaultValue: 'Copied on {{date}}',
                      date: format(vote.copiedAt, 'd MMM'),
                    })}
                  </Text>
                )}
              </Stack>
              <Badge colorPalette={BADGE_PALETTE[vote.state]} variant={vote.state === 'draft' ? 'outline' : 'subtle'}>
                {voteStateLabel(t, vote.state)}
              </Badge>
            </Flex>
          ))}
        </Stack>
        <Text fontSize='xs' color='fg.muted'>
          {t('census_detail.copied_into.note', {
            defaultValue: "These votes have their own copy. Changes here don't reach them.",
          })}
        </Text>
      </Stack>
    </SectionCard>
  )
}

/** Above a saved census while a live or scheduled vote has a copy of it: a wrong edit hurts most then. */
export const CopiedIntoRunningBanner = ({ votes }: { votes: CopyingVote[] }) => {
  const { t } = useTranslation()
  const running = votes.filter((vote) => vote.state === 'live' || vote.state === 'scheduled')
  if (!running.length) return null
  return (
    <Banner status='warning'>
      {t('census_detail.copied_into.running', {
        count: running.length,
        defaultValue_one: "A live or scheduled vote uses a copy of this census. Changes here don't reach it.",
        defaultValue_other:
          "{{count}} live or scheduled votes use a copy of this census. Changes here don't reach them.",
      })}
    </Banner>
  )
}

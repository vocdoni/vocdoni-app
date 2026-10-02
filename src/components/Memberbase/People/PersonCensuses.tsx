import { Badge, Flex, Link, Skeleton, Stack, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { generatePath, Link as RouterLink } from 'react-router'
import { Routes } from '~routes'
import { VoteStateBadge } from '../Censuses/CensusRow'
import { untitledVote } from '../Censuses/labels'
import type { usePersonCensuses } from './usePersonCensuses'

type PersonCensusesProps = { censuses: ReturnType<typeof usePersonCensuses> }

/**
 * "In censuses": the live, scheduled and draft votes a person can vote in, and the saved censuses that
 * hold them, each a link to that census. Closed votes aren't listed.
 */
export const PersonCensuses = ({ censuses }: PersonCensusesProps) => {
  const { t } = useTranslation()
  const { items, isLoading, phoneOnly, unchecked } = censuses

  return (
    <Stack gap={2} as='section' aria-labelledby='person-censuses-title'>
      <Text id='person-censuses-title' as='h3' fontSize='sm' fontWeight='bolder'>
        {t('members.person.censuses.title', { defaultValue: 'In censuses' })}
      </Text>
      {isLoading ? (
        <Stack gap={2} aria-busy>
          <Skeleton h={5} />
          <Skeleton h={5} w='70%' />
        </Stack>
      ) : items.length ? (
        <Stack gap={1.5} as='ul' listStyleType='none' m={0} p={0}>
          {items.map((item) => (
            <Flex as='li' key={`${item.kind}-${item.id}`} align='center' justify='space-between' gap={2}>
              <Link asChild fontSize='sm' minW={0}>
                <RouterLink
                  to={
                    item.kind === 'vote'
                      ? generatePath(Routes.dashboard.memberbase.voteCensus, { processId: item.id })
                      : generatePath(Routes.dashboard.memberbase.census, { groupId: item.id })
                  }
                >
                  <Text as='span' truncate>
                    {item.title || (item.kind === 'vote' ? untitledVote(t, item.state === 'draft') : '')}
                  </Text>
                </RouterLink>
              </Link>
              {item.kind === 'vote' ? (
                <VoteStateBadge state={item.state} size='sm' />
              ) : (
                <Badge colorPalette='gray' variant='subtle' size='sm' flexShrink={0}>
                  {t('members.person.censuses.saved', { defaultValue: 'Saved census' })}
                </Badge>
              )}
            </Flex>
          ))}
        </Stack>
      ) : (
        <Text fontSize='sm' color='fg.muted'>
          {t('members.person.censuses.none', { defaultValue: "Not in any vote's census or saved census yet." })}
        </Text>
      )}
      {!isLoading && phoneOnly && (
        <Text fontSize='xs' color='fg.muted'>
          {t('members.person.censuses.phone_only', {
            defaultValue: "Can't check live votes for people with only a phone.",
          })}
        </Text>
      )}
      {!isLoading && unchecked.length > 0 && (
        <Text fontSize='xs' color='fg.muted'>
          {t('members.person.censuses.unchecked', {
            count: unchecked.length,
            defaultValue_one: "Can't check 1 live vote: it signs in with details this person doesn't have.",
            defaultValue_other: "Can't check {{count}} live votes: they sign in with details this person doesn't have.",
          })}
        </Text>
      )}
    </Stack>
  )
}

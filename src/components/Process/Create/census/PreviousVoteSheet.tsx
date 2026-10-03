import { Box, Button, Flex, Skeleton, Stack, Text } from '@chakra-ui/react'
import type { VotingProcessResponse } from '@vocdoni/api-types'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { VoteStateBadge } from '~components/Memberbase/Censuses/CensusRow'
import { censusSourceLabel, untitledVote, votersUnit } from '~components/Memberbase/Censuses/labels'
import { type CensusSource, censusSourceOf, voteStateOf } from '~components/Memberbase/Censuses/model'
import { useAllVotes } from '~components/Memberbase/Censuses/useCensusIndex'
import { processTitle } from '~components/Process/List/organize'
import { Sheet } from '~components/ui/Sheet'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import type { Group } from '~src/queries/groups'
import type { VoteGroupMarker } from '~src/queries/voteGroups'

/** What choosing a previous vote does with its census. */
export type PreviousChoice =
  /** It followed Everyone (or was frozen from it): this one follows Everyone too */
  | { kind: 'everyone' }
  /** It has a group to copy */
  | { kind: 'copy'; groupId: string; name: string }

/** What "Same as a previous vote" can do with a vote's census, or `null` when there's nothing to copy. */
export const previousChoiceOf = (source: CensusSource, name: string): PreviousChoice | null => {
  switch (source.kind) {
    case 'everyone':
    case 'snapshot':
      return { kind: 'everyone' }
    case 'copy':
    case 'test':
      return { kind: 'copy', groupId: source.groupId, name }
    case 'saved':
      return { kind: 'copy', groupId: source.group.id, name }
    default:
      return null
  }
}

type PreviousVoteSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** The vote being edited, left out of the list */
  draftId: string | null
  everyoneId?: string
  groups: Group[]
  markers: Map<string, VoteGroupMarker>
  onPick: (choice: PreviousChoice) => void
  busy: boolean
}

/**
 * "Same as a previous vote": the organization's votes and drafts with how many can vote in each and
 * where their people come from. A vote whose people were picked one by one, with no list behind
 * them, can't be copied and says why.
 */
export const PreviousVoteSheet = ({
  open,
  onOpenChange,
  draftId,
  everyoneId,
  groups,
  markers,
  onPick,
  busy,
}: PreviousVoteSheetProps) => {
  const { t, i18n } = useTranslation()
  const language = usePublicLanguage()
  const votes = useAllVotes({ enabled: open })
  const groupsById = useMemo(() => new Map(groups.map((group) => [group.id, group])), [groups])

  const rows = useMemo(() => {
    const titles = new Map(votes.all.map((vote) => [vote.id, processTitle(vote, language)]))
    const voteTitle = (processId: string) => titles.get(processId)
    return votes.all
      .filter((vote) => vote.id !== draftId)
      .map((vote: VotingProcessResponse) => {
        const source = censusSourceOf(vote, { everyoneId, markers, groupsById, voteTitle })
        const name = processTitle(vote, language) || untitledVote(t, !vote.published)
        return { vote, name, source, state: voteStateOf(vote), choice: previousChoiceOf(source, name) }
      })
  }, [votes.all, draftId, everyoneId, markers, groupsById, language, t])

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : !busy && onOpenChange(false))}
      title={t('process_create.census.previous.title', { defaultValue: 'Same as a previous vote' })}
    >
      <Stack gap={3}>
        <Text fontSize='sm' color='fg.muted'>
          {t('process_create.census.previous.hint', {
            defaultValue: 'This vote gets its own copy of the people who could vote in it.',
          })}
        </Text>
        {votes.isLoading ? (
          <Stack gap={2}>
            <Skeleton h={14} />
            <Skeleton h={14} />
          </Stack>
        ) : rows.length === 0 ? (
          <Text fontSize='sm' color='fg.muted' py={4} textAlign='center'>
            {t('process_create.census.previous.none', { defaultValue: 'There are no other votes yet.' })}
          </Text>
        ) : (
          <Stack as='ul' gap={2} listStyleType='none' m={0} p={0}>
            {rows.map(({ vote, name, source, state, choice }) => {
              const size = vote.census?.size
              return (
                <Box as='li' key={vote.id}>
                  <Button
                    variant='outline'
                    colorPalette='gray'
                    w='full'
                    h='auto'
                    py={2.5}
                    px={3}
                    justifyContent='flex-start'
                    textAlign='start'
                    whiteSpace='normal'
                    fontWeight='normal'
                    disabled={!choice || busy}
                    onClick={() => choice && onPick(choice)}
                  >
                    <Stack gap={0.5} flex='1' minW={0}>
                      <Flex align='center' gap={2} minW={0} wrap='wrap'>
                        <Text fontSize='sm' fontWeight='bolder' truncate>
                          {name}
                        </Text>
                        <VoteStateBadge state={state} size='sm' />
                      </Flex>
                      <Text fontSize='xs' color='fg.muted'>
                        {[
                          typeof size === 'number' &&
                            `${size.toLocaleString(i18n.resolvedLanguage)} ${votersUnit(t, size)}`,
                          censusSourceLabel(t, source),
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </Text>
                      {!choice && (
                        <Text fontSize='xs' color='fg.muted'>
                          {t('process_create.census.previous.no_list', {
                            defaultValue: "Its people were picked one by one, so there's no list to copy.",
                          })}
                        </Text>
                      )}
                    </Stack>
                  </Button>
                </Box>
              )
            })}
          </Stack>
        )}
      </Stack>
    </Sheet>
  )
}

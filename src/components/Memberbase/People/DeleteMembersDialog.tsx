import { Field, Input, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { ConfirmDialog } from '~components/ui/ConfirmDialog'
import { type AffectedVote, useAffectedVotes } from '~src/queries/affectedVotes'
import { getSignedMemberIds, useDeleteMembers } from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { memberDisplayName } from './display'
import type { SelectedMember } from './useSelection'

/** How many votes the copy names before "and N more". */
const NAMED_VOTES = 3

/** From this many people, deleting asks to type the number first */
export const TYPED_DELETE_THRESHOLD = 100

/** "Type 1,742 to confirm", accepting the number with or without separators. */
const TypeToConfirm = ({
  count,
  value,
  onChange,
}: {
  count: number
  value: string
  onChange: (value: string) => void
}) => {
  const { t } = useTranslation()
  return (
    <Field.Root>
      <Field.Label fontSize='sm'>
        {t('members.delete.type_count', { defaultValue: 'Type {{number}} to confirm', number: String(count) })}
      </Field.Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode='numeric'
        autoComplete='off'
        fontSize={{ base: 'md', md: 'sm' }}
      />
    </Field.Root>
  )
}

const typedMatches = (typed: string, count: number) => count > 0 && typed.replace(/\D/g, '') === String(count)

/**
 * "This also removes them from: Assemblea General 2026 (live) · Eleccions Junta 2025 (closed) and
 * any other census they're in."
 */
export const AffectedVotesText = ({ votes }: { votes: AffectedVote[] }) => {
  const { t } = useTranslation()
  const stateLabel: Record<AffectedVote['state'], string> = {
    live: t('members.delete.state_live', { defaultValue: 'live' }),
    scheduled: t('members.delete.state_scheduled', { defaultValue: 'scheduled' }),
    draft: t('members.delete.state_draft', { defaultValue: 'draft' }),
    closed: t('members.delete.state_closed', { defaultValue: 'closed' }),
  }

  if (!votes.length)
    return (
      <Text fontSize='sm'>
        {t('members.delete.no_votes', { defaultValue: "They're also removed from any census they're in." })}
      </Text>
    )

  const named = votes
    .slice(0, NAMED_VOTES)
    .map((vote) =>
      t('members.delete.vote_with_state', {
        defaultValue: '{{title}} ({{state}})',
        title: vote.title || t('members.delete.untitled_vote', { defaultValue: 'Untitled vote' }),
        state: stateLabel[vote.state],
      })
    )
    .join(' · ')
  const more = votes.length - NAMED_VOTES

  return (
    <Text fontSize='sm'>
      {more > 0
        ? t('members.delete.affected_votes_more', {
            defaultValue_one: "This also removes them from: {{votes}}, one more vote and any other census they're in.",
            defaultValue_other:
              "This also removes them from: {{votes}}, {{count}} more votes and any other census they're in.",
            votes: named,
            count: more,
          })
        : t('members.delete.affected_votes', {
            defaultValue: "This also removes them from: {{votes}} and any other census they're in.",
            votes: named,
          })}
    </Text>
  )
}

const CantUndo = () => {
  const { t } = useTranslation()
  return (
    <Text fontSize='sm' color='fg.muted'>
      {t('members.delete.cant_undo', { defaultValue: "This can't be undone." })}
    </Text>
  )
}

type DeleteMembersDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: SelectedMember[]
  /** A row or the drawer (single), or the selection */
  scope: 'single' | 'selection'
  onDeleted?: (ids: string[]) => void
}

/**
 * Confirms deleting people from the member list, naming the votes it reaches. The backend deletes
 * all or nobody: when someone has already started voting in a live vote it refuses (409), and the
 * dialog offers to delete the others.
 */
export const DeleteMembersDialog = ({ open, onOpenChange, members, scope, onDeleted }: DeleteMembersDialogProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const deleteMembers = useDeleteMembers()
  const { votes } = useAffectedVotes()
  const [signedIds, setSignedIds] = useState<string[] | null>(null)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    if (open) return
    setSignedIds(null)
    setTyped('')
  }, [open])

  const signed = signedIds ? members.filter((member) => signedIds.includes(member.id)) : []
  const others = signedIds ? members.filter((member) => !signedIds.includes(member.id)) : members
  const count = others.length

  const run = async (targets: SelectedMember[]) => {
    const ids = targets.map((member) => member.id)
    try {
      await deleteMembers.mutateAsync({ ids })
      trackAnalyticsEvent({ name: AnalyticsEvents.MembersDeleted, props: { count: ids.length, scope, blocked: false } })
      toast({
        title: t('members.delete.done', {
          defaultValue_one: 'Deleted from members',
          defaultValue_other: '{{count}} people deleted from members',
          count: ids.length,
        }),
        type: 'success',
        duration: 3000,
        isClosable: true,
      })
      onOpenChange(false)
      onDeleted?.(ids)
    } catch (error) {
      const blocked = getSignedMemberIds(error)
      if (blocked) {
        trackAnalyticsEvent({ name: AnalyticsEvents.MembersDeleted, props: { count: 0, scope, blocked: true } })
        setSignedIds(blocked)
        return
      }
      toast({
        title: t('members.delete.error', { defaultValue: 'Nobody was deleted' }),
        description: error instanceof Error ? error.message : undefined,
        type: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  if (signedIds) {
    const firstName = signed[0] ? memberDisplayName(signed[0]) : ''
    return (
      <ConfirmDialog
        open={open}
        onOpenChange={({ open: next }) => onOpenChange(next)}
        title={t('members.delete.blocked_title', { defaultValue: 'Nobody was deleted' })}
        confirmText={
          count
            ? t('members.delete.delete_others', {
                defaultValue_one: 'Delete the other one',
                defaultValue_other: 'Delete the other {{count}}',
                count,
              })
            : t('close', { defaultValue: 'Close' })
        }
        destructive={count > 0}
        loading={deleteMembers.isPending}
        onConfirm={() => (count ? run(others) : onOpenChange(false))}
      >
        {/* ph-no-capture: member names */}
        <Text fontSize='sm' className='ph-no-capture'>
          {signed.length > 1
            ? t('members.delete.blocked_names', {
                defaultValue_one: '{{name}} and one other person have already started voting in a live vote.',
                defaultValue_other: '{{name}} and {{count}} others have already started voting in a live vote.',
                name: firstName,
                count: signed.length - 1,
              })
            : firstName
              ? t('members.delete.blocked_person', {
                  defaultValue: '{{name}} has already started voting in a live vote.',
                  name: firstName,
                })
              : t('members.delete.blocked_someone', {
                  defaultValue_one: 'Someone has already started voting in a live vote.',
                  defaultValue_other: '{{count}} people have already started voting in a live vote.',
                  count: Math.max(1, signedIds.length),
                })}{' '}
          {t('members.delete.blocked_hint', { defaultValue: 'They can be deleted once that vote closes.' })}
        </Text>
      </ConfirmDialog>
    )
  }

  const single = members.length === 1 ? memberDisplayName(members[0]) : ''

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={({ open: next }) => onOpenChange(next)}
      title={
        single ? (
          // ph-no-capture: the member's name
          <span className='ph-no-capture'>
            {t('members.delete.title_person', { defaultValue: 'Delete {{name}} from members?', name: single })}
          </span>
        ) : (
          t('members.delete.title_people', {
            defaultValue_one: 'Delete 1 person from members?',
            defaultValue_other: 'Delete {{count}} people from members?',
            count,
          })
        )
      }
      confirmText={t('members.delete.confirm', {
        defaultValue_one: 'Delete',
        defaultValue_other: 'Delete {{count}}',
        count,
      })}
      loading={deleteMembers.isPending}
      confirmDisabled={count >= TYPED_DELETE_THRESHOLD && !typedMatches(typed, count)}
      onConfirm={() => run(members)}
    >
      <Stack gap={2}>
        <AffectedVotesText votes={votes} />
        <CantUndo />
        {count >= TYPED_DELETE_THRESHOLD && <TypeToConfirm count={count} value={typed} onChange={setTyped} />}
      </Stack>
    </ConfirmDialog>
  )
}

type DeleteAllMembersDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Everyone in the member list, not what the search shows */
  total: number
  onDeleted?: () => void
}

/** Deletes the whole member list. Asks to type the member count, since there's no going back. */
export const DeleteAllMembersDialog = ({ open, onOpenChange, total, onDeleted }: DeleteAllMembersDialogProps) => {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const deleteMembers = useDeleteMembers()
  const { votes } = useAffectedVotes()
  const [typed, setTyped] = useState('')
  const [blocked, setBlocked] = useState<number | null>(null)
  const matches = typedMatches(typed, total)

  useEffect(() => {
    if (open) return
    setTyped('')
    setBlocked(null)
  }, [open])

  const run = async () => {
    try {
      await deleteMembers.mutateAsync({ all: true })
      trackAnalyticsEvent({
        name: AnalyticsEvents.MembersDeleted,
        props: { count: total, scope: 'all', blocked: false },
      })
      toast({
        title: t('members.delete.all_done', { defaultValue: 'All members deleted' }),
        type: 'success',
        duration: 3000,
        isClosable: true,
      })
      onOpenChange(false)
      onDeleted?.()
    } catch (error) {
      const signed = getSignedMemberIds(error)
      if (signed) {
        trackAnalyticsEvent({ name: AnalyticsEvents.MembersDeleted, props: { count: 0, scope: 'all', blocked: true } })
        setBlocked(signed.length)
        return
      }
      toast({
        title: t('members.delete.error', { defaultValue: 'Nobody was deleted' }),
        description: error instanceof Error ? error.message : undefined,
        type: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  if (blocked !== null)
    return (
      <ConfirmDialog
        open={open}
        onOpenChange={({ open: next }) => onOpenChange(next)}
        title={t('members.delete.blocked_title', { defaultValue: 'Nobody was deleted' })}
        confirmText={t('close', { defaultValue: 'Close' })}
        destructive={false}
        onConfirm={() => onOpenChange(false)}
      >
        <Text fontSize='sm'>
          {t('members.delete.blocked_someone', {
            defaultValue_one: 'Someone has already started voting in a live vote.',
            defaultValue_other: '{{count}} people have already started voting in a live vote.',
            count: Math.max(1, blocked),
          })}{' '}
          {t('members.delete.blocked_all_hint', {
            defaultValue: 'Wait until that vote closes, or select the others and delete them.',
          })}
        </Text>
      </ConfirmDialog>
    )

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={({ open: next }) => onOpenChange(next)}
      title={t('members.delete.all_title', {
        defaultValue_one: 'Delete your only member?',
        defaultValue_other: 'Delete all {{formattedCount}} members?',
        count: total,
        formattedCount: total.toLocaleString(i18n.resolvedLanguage),
      })}
      confirmText={t('members.delete.all_confirm', { defaultValue: 'Delete all members' })}
      confirmDisabled={!matches}
      loading={deleteMembers.isPending}
      onConfirm={run}
    >
      <Stack gap={3}>
        <Text fontSize='sm'>
          {t('members.delete.all_description', {
            defaultValue: 'This deletes everyone in your members, whatever your search shows.',
          })}
        </Text>
        <AffectedVotesText votes={votes} />
        <CantUndo />
        <TypeToConfirm count={total} value={typed} onChange={setTyped} />
      </Stack>
    </ConfirmDialog>
  )
}

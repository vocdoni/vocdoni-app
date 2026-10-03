import { useQueryClient } from '@tanstack/react-query'
import type { TFunction } from 'i18next'
import { useCallback, useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { QueryKeys } from '~src/queries/keys'
import { discardVoteGroup, useVoteGroupApi, voteGroupDescription } from '~src/queries/voteGroups'
import { createVoteGroup } from './voteGroup'
import { useOrganization } from '@vocdoni/react-components'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import type { Process } from '../common'
import { useEditor } from '../editor-context'
import { type AttachSource, attachCensus, EmptyCensusError } from './attach'
import { EMAIL_SIGN_IN, hasSignIn } from './useCensusFacts'
import { StaleDraftError } from './voteGroup'

/**
 * What a vote's own census is called among the groups: the vote's name and the day it was made, so
 * the list of groups says which is which ("Assemblea 2026 — 3 Oct 2026").
 */
export const voteGroupTitle = (t: TFunction, vote: string, language?: string, now: Date = new Date()) => {
  let date: string
  try {
    date = new Intl.DateTimeFormat(language, { day: 'numeric', month: 'short', year: 'numeric' }).format(now)
  } catch {
    date = now.toISOString().slice(0, 10)
  }
  return t('process_create.census.group_title_dated', { defaultValue: '{{vote}} — {{date}}', vote, date })
}

/** What Who can vote is busy doing, for the spinner on the right card. */
export type AttachBusy = AttachSource['kind'] | 'everyone' | null

/**
 * Gives the draft its census: a copy of the chosen people (`attach`), or Everyone (`chooseEveryone`).
 * Holds autosave off while it runs, saves the draft first if it doesn't exist yet, and runs one at a
 * time (a second click while one runs is ignored). Sets up email codes when no sign-in is set, so the
 * census is always saved with the draft. Resolves with whether it worked; failures are told in a toast.
 */
export const useCensusAttach = () => {
  const { t, i18n } = useTranslation()
  const toast = useToast()
  const api = useVoteGroupApi()
  const queryClient = useQueryClient()
  const { organization } = useOrganization()
  const { draft } = useEditor()
  const { getValues, setValue, setFocus } = useFormContext<Process>()
  const running = useRef(false)
  const [busy, setBusy] = useState<AttachBusy>(null)

  /**
   * Points the form at a group (with a sign-in if none) and saves the draft, conditionally: a draft
   * changed in another tab isn't written over (it could point at a census deleted since). Puts the
   * form back on failure.
   */
  const repoint = useCallback(
    async (groupId: string) => {
      if (!draft) throw new Error('No draft to save')
      const before = { groupId: getValues('groupId'), census: getValues('census') }
      setValue('groupId', groupId, { shouldDirty: true })
      if (!hasSignIn(before.census)) setValue('census', { ...EMAIL_SIGN_IN }, { shouldDirty: true })
      try {
        await draft.saveWithLatest()
      } catch (error) {
        setValue('groupId', before.groupId, { shouldDirty: true })
        setValue('census', before.census, { shouldDirty: true })
        throw error
      }
    },
    [draft, getValues, setValue]
  )

  const fail = useCallback(
    (error: unknown) => {
      console.error('Could not set who can vote', error)
      toast({
        type: 'error',
        duration: 8000,
        isClosable: true,
        title:
          error instanceof EmptyCensusError
            ? t('process_create.census.error_empty', { defaultValue: 'There is nobody in it to copy' })
            : t('process_create.census.error', { defaultValue: "Who can vote couldn't be changed" }),
        description:
          error instanceof StaleDraftError
            ? t('process_create.census.error_stale', {
                defaultValue: 'This draft was changed somewhere else. Reload the page and try again.',
              })
            : error instanceof EmptyCensusError
              ? undefined
              : t('process_create.census.error_detail', {
                  defaultValue: 'Nothing changed. Try again in a moment.',
                }),
        action:
          error instanceof StaleDraftError
            ? {
                label: t('process_create.census.reload', { defaultValue: 'Reload' }),
                onClick: () => window.location.reload(),
              }
            : undefined,
      })
    },
    [toast, t]
  )

  const run = useCallback(
    async (label: Exclude<AttachBusy, null>, step: (processId: string) => Promise<void>) => {
      if (running.current || !draft || !api) return false
      running.current = true
      setBusy(label)
      const resume = draft.pause()
      try {
        await draft.flush()
        const processId = await draft.ensure()
        if (!processId) {
          toast({
            type: 'info',
            duration: 5000,
            title: t('process_create.census.name_first', {
              defaultValue: 'Name your vote first, so it can have a census of its own',
            }),
          })
          setFocus('title')
          return false
        }
        await step(processId)
        queryClient.invalidateQueries({ queryKey: QueryKeys.election.process(processId) })
        queryClient.invalidateQueries({ queryKey: QueryKeys.organization.drafts(organization?.address) })
        return true
      } catch (error) {
        fail(error)
        return false
      } finally {
        resume()
        running.current = false
        setBusy(null)
      }
    },
    [draft, api, toast, t, setFocus, queryClient, organization?.address, fail]
  )

  /**
   * Copies `source` into a census of this vote's own and points the draft at it. `replacing` is the
   * vote's current own census, deleted once the draft points at the copy.
   */
  const attach = useCallback(
    (source: AttachSource, replacing?: string) =>
      run(source.kind, async (processId) => {
        const vote =
          getValues('title')?.trim() || t('processes.list.untitled_draft', { defaultValue: 'Untitled draft' })
        const { count } = await attachCensus(api!, {
          processId,
          source,
          title: voteGroupTitle(t, vote, i18n.resolvedLanguage),
          description: voteGroupDescription(t, vote),
          repoint,
          replacing,
        })
        trackAnalyticsEvent({
          name: AnalyticsEvents.MemberGroupCreated,
          props: { group_size: count, source: source.kind },
        })
      }),
    [run, getValues, t, i18n.resolvedLanguage, api, repoint]
  )

  /**
   * "Edit this list" on Everyone: the vote gets a census of its own holding every member as of now
   * (made by the API, so there's no limit on how many), test people left out, which can then be
   * edited. From then on new members don't join it by themselves.
   */
  const copyEveryone = useCallback(
    () =>
      run('everyone', async (processId) => {
        const vote =
          getValues('title')?.trim() || t('processes.list.untitled_draft', { defaultValue: 'Untitled draft' })
        const testVote = await api!.testVote()
        const leaveOut = testVote && !testVote.processIds.includes(processId) ? testVote.memberIds : []
        await createVoteGroup(api!, {
          processId,
          kind: 'copy',
          source: 'everyone',
          group: {
            title: voteGroupTitle(t, vote, i18n.resolvedLanguage),
            description: voteGroupDescription(t, vote),
            includeAllMembers: true,
          },
          repoint,
          leaveOut,
        })
        trackAnalyticsEvent({ name: AnalyticsEvents.MemberGroupCreated, props: { group_size: 0, source: 'everyone' } })
      }),
    [run, getValues, t, i18n.resolvedLanguage, api, repoint]
  )

  /**
   * Everyone. Replacing a census of the vote's own saves the draft on Everyone first and only then
   * deletes it; otherwise it's a plain choice, saved with the next autosave.
   */
  const chooseEveryone = useCallback(
    async (everyoneId: string, replacing?: string) => {
      if (!replacing) {
        if (running.current) return false
        setValue('groupId', everyoneId, { shouldDirty: true })
        if (!hasSignIn(getValues('census'))) setValue('census', { ...EMAIL_SIGN_IN }, { shouldDirty: true })
        return true
      }
      return run('everyone', async () => {
        await repoint(everyoneId)
        await discardVoteGroup(api!, replacing)
      })
    },
    [run, repoint, api, setValue, getValues]
  )

  return { attach, chooseEveryone, copyEveryone, busy }
}

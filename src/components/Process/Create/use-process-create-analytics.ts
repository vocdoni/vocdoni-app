import { InfiniteData, useQueryClient } from '@tanstack/react-query'
import { useOrganization } from '@vocdoni/react-components'
import type { CreateVotingProcessRequest } from '@vocdoni/api-types'
import { useCallback, useEffect, useRef } from 'react'
import type { FieldErrors } from 'react-hook-form'
import { useLocation } from 'react-router'
import type { GroupsResponse } from '~queries/groups'
import { QueryKeys } from '~queries/keys'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import {
  getApiErrorProps,
  getDraftAgeDays,
  getDurationDays,
  getFirstErrorPath,
  getQuestionTypes,
  getVoterAuth,
} from './analytics'
import { Process } from './common'
import { getStoredDraftId } from './draft-storage'
import { getProcessCreateSource } from './source'

type Options = {
  /** The `?draftId=` query param: a draft opened explicitly from the drafts list */
  draftId: string | null
  /** The draft the form currently saves to (query param or the resumable stored pointer) */
  effectiveDraftId: string | null
  /** The loaded draft values; `null` when the draft no longer exists */
  formDraft: Process | null | undefined
}

/**
 * The create-vote form's funnel events. One mount of the form is one journey:
 * `process_create_started` opens it, and every submit attempt ends it in either
 * `process_creation_failed` or `process_created`.
 */
export const useProcessCreateAnalytics = ({ draftId, effectiveDraftId, formDraft }: Options) => {
  const { organization } = useOrganization()
  const location = useLocation()
  const queryClient = useQueryClient()
  const startedAtRef = useRef<number | null>(null)
  const startDraftRef = useRef<{ id: string; via: 'link' | 'auto' } | null>(null)
  const resumedRef = useRef(false)
  const attemptRef = useRef(0)
  const failedAttemptsRef = useRef(0)
  const address = organization?.address

  // Waits for the organization: the resumable draft pointer is stored per org,
  // and is read straight from storage because `useStoredDraftId` only catches
  // up with a newly resolved address one render later.
  useEffect(() => {
    if (startedAtRef.current !== null || !address) return
    startedAtRef.current = Date.now()
    const startDraftId = draftId ?? getStoredDraftId(address)
    if (startDraftId) startDraftRef.current = { id: startDraftId, via: draftId ? 'link' : 'auto' }
    trackAnalyticsEvent({
      name: AnalyticsEvents.ProcessCreateStarted,
      props: { source: getProcessCreateSource(location.state), from_draft: !!startDraftId },
    })
  }, [address, draftId, location.state])

  // Only the draft the form was opened with counts as resumed: the first
  // auto-save of a new form creates a draft too, which is then loaded as well.
  useEffect(() => {
    const start = startDraftRef.current
    if (resumedRef.current || !formDraft || !start || effectiveDraftId !== start.id) return
    resumedRef.current = true
    const ageDays = getDraftAgeDays(start.id)
    trackAnalyticsEvent({
      name: AnalyticsEvents.DraftResumed,
      props: { via: start.via, ...(ageDays !== undefined && { age_days: ageDays }) },
    })
    // `address` re-runs this right after the start effect above has recorded the draft
  }, [formDraft, effectiveDraftId, address])

  const trackValidationFailed = useCallback((errors: FieldErrors<Process>, sidebarErrors: boolean) => {
    attemptRef.current += 1
    failedAttemptsRef.current += 1
    trackAnalyticsEvent({
      name: AnalyticsEvents.ProcessCreationFailed,
      props: {
        stage: 'validation',
        failed_fields: Object.keys(errors).join(','),
        sidebar_errors: sidebarErrors,
        first_error_path: getFirstErrorPath(errors) ?? 'unknown',
        attempt: attemptRef.current,
      },
    })
  }, [])

  const trackPublishFailed = useCallback((error: unknown) => {
    attemptRef.current += 1
    failedAttemptsRef.current += 1
    trackAnalyticsEvent({
      name: AnalyticsEvents.ProcessCreationFailed,
      props: {
        stage: 'publish',
        attempt: attemptRef.current,
        error_name: error instanceof Error ? error.name : 'unknown',
        ...getApiErrorProps(error),
      },
    })
  }, [])

  const trackCreated = useCallback(
    (form: Process, request: CreateVotingProcessRequest) => {
      attemptRef.current += 1
      const durationDays = getDurationDays(request)
      // The census is the selected group; its size is only known if the group
      // list the sidebar loaded already holds it.
      const censusSize = queryClient
        .getQueryData<InfiniteData<GroupsResponse>>(QueryKeys.organization.groups(address))
        ?.pages.flatMap((page) => page.groups)
        .find((group) => group.id === form.groupId)?.membersCount
      const startedAt = startedAtRef.current

      trackAnalyticsEvent({
        name: AnalyticsEvents.ProcessCreated,
        props: {
          census_type: form.censusType,
          weighted: !!form.weightedVote,
          anonymous: !!form.anonymousVoting,
          question_count: form.questions?.length ?? 0,
          from_draft: !!effectiveDraftId,
          auto_start: !!form.autoStart,
          question_types: getQuestionTypes(form.questions),
          ...getVoterAuth(form.census),
          ...(durationDays !== undefined && { duration_days: durationDays }),
          ...(censusSize !== undefined && { census_size: censusSize }),
          ...(startedAt !== null && { time_to_publish_s: Math.round((Date.now() - startedAt) / 1000) }),
          failed_attempts: failedAttemptsRef.current,
        },
      })
    },
    [queryClient, address, effectiveDraftId]
  )

  /** The admin walked away from the draft the form was saving to ("leave without saving" or reset). */
  const trackDiscarded = useCallback(
    (method: 'leave' | 'reset') => {
      if (!effectiveDraftId) return
      const ageDays = getDraftAgeDays(effectiveDraftId)
      trackAnalyticsEvent({
        name: AnalyticsEvents.DraftDiscarded,
        props: { method, ...(ageDays !== undefined && { age_days: ageDays }) },
      })
    },
    [effectiveDraftId]
  )

  return { trackValidationFailed, trackPublishFailed, trackCreated, trackDiscarded }
}

import { useEffect } from 'react'
import { useImportJobProgress, useInvalidateMembers } from '~src/queries/members'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'

// Jobs whose outcome was already reported this session: the receipt and the People banner can both
// watch the same job, and a remount must not report it twice
const reported = new Set<string>()

/**
 * Follows a member import job until it ends. When it does, the member lists refresh and the outcome
 * is tracked once.
 */
export const useImportJob = (jobId: string | null) => {
  const query = useImportJobProgress(jobId)
  const invalidateMembers = useInvalidateMembers()
  const { data, isError } = query
  const completed = data?.status === 'completed'
  const failed = isError || data?.status === 'failed'

  useEffect(() => {
    if (!jobId || (!completed && !failed) || reported.has(jobId)) return
    reported.add(jobId)
    if (completed) void invalidateMembers()
    trackAnalyticsEvent({
      name: AnalyticsEvents.MembersImportCompleted,
      props: {
        status: failed ? 'failed' : 'completed',
        added: data?.result?.added ?? 0,
        total: data?.result?.total ?? 0,
        error_count: data?.errors?.length ?? 0,
      },
    })
  }, [jobId, completed, failed, data, invalidateMembers])

  return {
    ...query,
    pending: Boolean(jobId) && !failed && !completed,
    completed,
    failed,
    errors: data?.errors ?? [],
    progress: data?.result?.progress ?? 0,
  }
}

import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'

/** Counts a header action on a vote (pause, resume, end, cancel). */
export const trackProcessAction = (action: string, election: { id?: string } | null | undefined) =>
  trackAnalyticsEvent({
    name: AnalyticsEvents.ProcessAction,
    props: { action, election_id: election?.id ?? 'unknown' },
  })

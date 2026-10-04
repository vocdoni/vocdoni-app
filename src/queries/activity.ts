import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { JobStatusResponse, VotingProcessResponse } from '@vocdoni/api-types'
import { useMemo } from 'react'
import { ApiEndpoints } from '~components/Auth/api'
import { useAuth } from '~components/Auth/useAuth'
import { useAllVotes } from '~components/Memberbase/Censuses/useCensusIndex'
import { processTitle } from '~components/Process/List/organize'
import { usePublicLanguage } from '~i18n/usePublicLanguage'
import { useAppEnv } from '~src/app-env'
import { useApiClient } from '~src/providers/ApiClientProvider'

/**
 * The organization's activity: what changed, when and by whom.
 *
 * Two sources, one shape:
 * - with AppEnv `ACTIVITY_LOG` on, the backend's activity log (`GET /organizations/{address}/activity`,
 *   backend ticket T1), which records every change with its author;
 * - otherwise, events derived from what the API already returns: vote dates and member import jobs.
 *   They carry `source: 'derived'` and no author, and an import is only dated once jobs expose
 *   `createdAt`/`completedAt` (backend ticket T7a).
 */

export type ActivityType =
  | 'member.added'
  | 'member.updated'
  | 'member.deleted'
  | 'import.started'
  | 'import.completed'
  | 'import.failed'
  | 'group.created'
  | 'group.updated'
  | 'group.deleted'
  | 'census.members_added'
  | 'census.members_removed'
  | 'census.frozen'
  | 'process.created'
  | 'process.published'
  | 'process.started'
  | 'process.ended'
  | 'activity.exported'

/** The Activity tab's filters, each a prefix of the event types it covers. */
export type ActivityCategory = 'import' | 'member' | 'census' | 'process'

export const ACTIVITY_CATEGORIES: ActivityCategory[] = ['import', 'member', 'census', 'process']

export const categoryOf = (type: ActivityType): ActivityCategory | 'other' => {
  const prefix = type.split('.')[0]
  if (prefix === 'group') return 'census'
  return (ACTIVITY_CATEGORIES as string[]).includes(prefix) ? (prefix as ActivityCategory) : 'other'
}

export type ActivityActor = { type: 'user' | 'api_key' | 'system'; id?: string; label?: string } | null

export type ActivitySource = 'app' | 'import' | 'api' | 'system' | 'derived'

export type ActivitySubjectType = 'member' | 'group' | 'census' | 'process' | 'import' | 'organization'

/** A changed field. The backend masks values when it writes them (see `formatChange`), or sets `redacted`. */
export type ActivityChange = { field: string; before?: string | null; after?: string | null; redacted?: boolean }

export type ActivityEvent = {
  id: string
  type: ActivityType
  /** ISO date. `null` only for a derived import whose job carries no date yet */
  at: string | null
  actor: ActivityActor
  source: ActivitySource
  subject: { type: ActivitySubjectType; id: string; label: string }
  processIds?: string[]
  /** The change reached a vote that was live at the time */
  live?: boolean
  /** How many records it touched (people added, removed…) */
  count?: number
  changes?: ActivityChange[]
  jobId?: string
  requestId?: string
  /** Derived only: the vote is a test vote */
  test?: boolean
  /** Derived only: an import's numbers. Counts only, never its row errors (they hold emails and phones) */
  import?: { added: number; total: number; problems: number; status: JobStatusResponse['status'] }
}

export type ActivityPage = { events: ActivityEvent[]; pagination?: { totalItems?: number; nextPage?: number | null } }

// --- Derived events -------------------------------------------------------------------------------

const validDate = (value?: string | null) => {
  if (!value) return null
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : new Date(time).toISOString()
}

/** A process as the list returns it, plus the early-end date the backend sends without a type. */
type ProcessWithEnd = VotingProcessResponse & { endedAt?: string }

/**
 * A vote's "started" and "ended", from its dates: the start once it's past, and the end (an early end
 * when there was one, `endedAt`, else the planned `endDate`) once it's past. Drafts have neither.
 */
export const deriveVoteEvents = (
  processes: VotingProcessResponse[],
  { language, testProcessIds = [], now = Date.now() }: { language: string; testProcessIds?: string[]; now?: number }
): ActivityEvent[] =>
  processes.flatMap((process) => {
    if (!process.published) return []
    const label = processTitle(process, language)
    const test = testProcessIds.includes(process.id) || undefined
    const started = validDate(process.startDate)
    const ended = validDate((process as ProcessWithEnd).endedAt) ?? validDate(process.endDate)
    const base = {
      actor: null,
      source: 'derived' as const,
      subject: { type: 'process' as const, id: process.id, label },
      processIds: [process.id],
      test,
    }
    const events: ActivityEvent[] = []
    const hasEnded = !!ended && new Date(ended).getTime() <= now
    if (started && new Date(started).getTime() <= now)
      events.push({ ...base, id: `${process.id}:started`, type: 'process.started', at: started, live: !hasEnded })
    if (hasEnded) events.push({ ...base, id: `${process.id}:ended`, type: 'process.ended', at: ended })
    return events
  })

/** A job as the list returns it, plus the dates T7a adds. Detected per job: older ones may lack them. */
export type DatedJob = JobStatusResponse & { createdAt?: string; completedAt?: string }

export const jobDate = (job: DatedJob) => validDate(job.completedAt) ?? validDate(job.createdAt)

export const hasDatedJobs = (jobs: DatedJob[]) => jobs.some((job) => !!jobDate(job))

const importType = (status: JobStatusResponse['status']): ActivityType =>
  status === 'completed' ? 'import.completed' : status === 'failed' ? 'import.failed' : 'import.started'

/** Member imports, dated when the job says when. Their row errors are counted, never copied. */
export const deriveImportEvents = (jobs: DatedJob[]): ActivityEvent[] =>
  jobs
    .filter((job) => job.type === 'org_members')
    .map((job) => {
      const added = job.result?.added ?? 0
      return {
        id: `job:${job.jobId}`,
        type: importType(job.status),
        at: jobDate(job),
        actor: null,
        source: 'derived',
        subject: { type: 'import', id: job.jobId, label: '' },
        count: added,
        jobId: job.jobId,
        import: { added, total: job.result?.total ?? 0, problems: job.errors?.length ?? 0, status: job.status },
      }
    })

/** Newest first; undated events last, in the order they came. */
export const sortEvents = (events: ActivityEvent[]) =>
  events
    .map((event, index) => ({ event, index }))
    .sort((a, b) => {
      if (a.event.at && b.event.at) return b.event.at.localeCompare(a.event.at) || a.index - b.index
      if (a.event.at) return -1
      if (b.event.at) return 1
      return a.index - b.index
    })
    .map(({ event }) => event)

/** Dated events by local day (`yyyy-mm-dd`), newest day first. Undated events are left out. */
export const groupByDay = (events: ActivityEvent[]) => {
  const days = new Map<string, ActivityEvent[]>()
  for (const event of sortEvents(events)) {
    if (!event.at) continue
    const date = new Date(event.at)
    const key = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
      .map((part) => String(part).padStart(2, '0'))
      .join('-')
    days.set(key, [...(days.get(key) ?? []), event])
  }
  return [...days.entries()].map(([day, items]) => ({ day, date: new Date(items[0].at!), events: items }))
}

// --- Masked changes -------------------------------------------------------------------------------

export type FormattedChange =
  | { field: string; kind: 'values'; before: string | null; after: string | null }
  | { field: string; kind: 'changed' }

const maskEmail = (value: string) => {
  const at = value.lastIndexOf('@')
  if (at < 1) return null
  const local = value.slice(0, at)
  const domain = value.slice(at + 1)
  const dot = domain.lastIndexOf('.')
  if (dot < 1) return null
  return `${local[0]}***${local.length > 1 ? local.at(-1) : ''}@${domain[0]}***${domain.slice(dot)}`
}

const maskPhone = (value: string) => {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 2 ? `***${digits.slice(-2)}` : null
}

const maskNationalId = (value: string) => {
  const chars = value.replace(/[^0-9a-z]/gi, '')
  return chars.length >= 3 ? `***${chars.slice(-3)}` : null
}

const MASKS: Record<string, (value: string) => string | null> = {
  email: maskEmail,
  phone: maskPhone,
  nationalId: maskNationalId,
}

/** Fields that hold nothing personal, shown as they are. */
const PLAIN_FIELDS = new Set(['weight', 'title'])

/**
 * A change, safe to show. Only what the activity contract allows ever reaches the screen, even when
 * the backend sent more: an email as `l***a@d***.org`, a phone's last 2 digits, a national ID's last 3;
 * voting power and names of censuses as they are. Everything else (birth date, password, extra info,
 * names) only says it changed.
 */
export const formatChange = (
  field: string,
  before?: string | null,
  after?: string | null,
  redacted?: boolean
): FormattedChange => {
  if (redacted) return { field, kind: 'changed' }
  if (PLAIN_FIELDS.has(field)) return { field, kind: 'values', before: before || null, after: after || null }
  const mask = MASKS[field]
  if (!mask) return { field, kind: 'changed' }
  const maskedBefore = before ? mask(before) : null
  const maskedAfter = after ? mask(after) : null
  // A value too short to mask would show whole: say it changed instead
  if ((before && !maskedBefore) || (after && !maskedAfter)) return { field, kind: 'changed' }
  return { field, kind: 'values', before: maskedBefore, after: maskedAfter }
}

// --- Hooks ----------------------------------------------------------------------------------------

export type ActivityQuery = {
  category?: ActivityCategory
  subjectType?: ActivitySubjectType
  subjectId?: string
  processId?: string
  page?: number
  limit?: number
  enabled?: boolean
}

export const ACTIVITY_PAGE_SIZE = 50

/** The backend's activity log query string, shared by the list and its export. */
export const activitySearch = (query: Omit<ActivityQuery, 'enabled'>) => {
  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.category) params.set('type', query.category === 'census' ? 'census,group' : query.category)
  if (query.subjectType) params.set('subjectType', query.subjectType)
  if (query.subjectId) params.set('subjectId', query.subjectId)
  if (query.processId) params.set('processId', query.processId)
  return params.toString()
}

const activityPath = (address: string) => ApiEndpoints.OrganizationActivity.replace('{address}', address)

export const activityKeys = {
  all: (address?: string) => ['organizations', 'activity', address ?? null],
  jobs: (address?: string) => ['organizations', 'activity', address ?? null, 'jobs'],
}

/** How many recent imports the Activity tab reads (and checks for dates). */
export const RECENT_JOBS_LIMIT = 20

/**
 * The organization's recent member imports. Needs a Manager/Admin: anyone else gets an error, and
 * nothing is shown. Kept for the session: it also answers whether jobs are dated yet.
 */
export const useRecentImportJobs = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const { client } = useApiClient()
  const { currentAddress } = useAuth()

  return useQuery({
    queryKey: activityKeys.jobs(currentAddress),
    enabled: enabled && !!currentAddress,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () =>
      ((
        await client.jobs.list({
          orgAddress: currentAddress!,
          type: 'org_members',
          page: 1,
          limit: RECENT_JOBS_LIMIT,
        })
      ).jobs ?? []) as DatedJob[],
  })
}

/**
 * Whether the Activity tab has anything real to show: the backend's activity log is on, or jobs come
 * with their dates (T7a). Until one of them, the tab stays hidden.
 */
export const useActivityAvailable = () => {
  const { ACTIVITY_LOG } = useAppEnv()
  const jobs = useRecentImportJobs({ enabled: !ACTIVITY_LOG })
  if (ACTIVITY_LOG) return { available: true, isLoading: false, full: true }
  return { available: !!jobs.data && hasDatedJobs(jobs.data), isLoading: jobs.isLoading, full: false }
}

/** The activity log's page of events, straight from the backend (ACTIVITY_LOG on). */
const useActivityLog = (query: ActivityQuery, enabled: boolean) => {
  const { bearedFetch, currentAddress } = useAuth()
  const { enabled: _enabled, ...params } = query
  const search = activitySearch({ limit: ACTIVITY_PAGE_SIZE, ...params })

  return useQuery({
    queryKey: [...activityKeys.all(currentAddress), search],
    enabled: enabled && !!currentAddress,
    placeholderData: keepPreviousData,
    queryFn: () => bearedFetch<ActivityPage>(`${activityPath(currentAddress!)}?${search}`),
  })
}

/**
 * The organization's activity, newest first, in one shape whatever its source (see the top of this
 * file). Without the activity log, only the organization-wide view has anything (vote dates and
 * imports): a census or a person has no history to derive, so they get nothing.
 */
export const useActivity = (query: ActivityQuery = {}) => {
  const { ACTIVITY_LOG } = useAppEnv()
  const enabled = query.enabled ?? true
  const orgWide = !query.subjectType && !query.subjectId && !query.processId
  const log = useActivityLog(query, enabled && !!ACTIVITY_LOG)
  const derive = enabled && !ACTIVITY_LOG && orgWide
  const votes = useAllVotes({ enabled: derive })
  const jobs = useRecentImportJobs({ enabled: derive })
  const language = usePublicLanguage()

  const derived = useMemo(() => {
    if (!derive) return []
    return sortEvents([...deriveVoteEvents(votes.published, { language }), ...deriveImportEvents(jobs.data ?? [])])
  }, [derive, votes.published, jobs.data, language])

  if (ACTIVITY_LOG)
    return {
      events: log.data?.events ?? [],
      pagination: log.data?.pagination,
      isLoading: log.isLoading,
      isError: log.isError,
      source: 'log' as const,
    }

  return {
    events: derived,
    pagination: undefined,
    isLoading: derive && (votes.isLoading || jobs.isLoading),
    isError: derive && votes.isError,
    source: 'derived' as const,
  }
}

/** Downloads the activity log as CSV (`/activity/export?format=csv`). Needs the activity log on. */
export const useActivityExport = () => {
  const { bearer, currentAddress } = useAuth()
  const { SAAS_URL } = useAppEnv()

  return async (query: Omit<ActivityQuery, 'enabled' | 'page' | 'limit'> = {}) => {
    if (!currentAddress) throw new Error('No organization')
    const search = new URLSearchParams(activitySearch(query))
    search.set('format', 'csv')
    const response = await fetch(`${SAAS_URL}/${activityPath(currentAddress)}/export?${search}`, {
      headers: bearer ? { Authorization: `Bearer ${bearer}` } : undefined,
    })
    if (!response.ok) throw new Error(response.statusText || `HTTP ${response.status}`)
    return response.blob()
  }
}

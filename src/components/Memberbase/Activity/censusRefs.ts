import { useMemo } from 'react'
import { generatePath } from 'react-router'
import type { StatusDotTone } from '~components/Process/Dashboard/View/StateBadge'
import { Routes } from '~routes'
import type { ActivityEvent } from '~src/queries/activity'
import type { VoteGroupMarker } from '~src/queries/voteGroups'
import type { CensusIndex, VoteState } from '../Censuses/model'
import { useCensusIndex } from '../Censuses/useCensusIndex'

/**
 * A census an event belongs to, as the Activity tab names it: a vote's census (named for its vote) or
 * a saved census. `key` is what the census filter keeps in the URL (`?census=vote:<id>`).
 */
export type CensusRef = {
  key: string
  kind: 'vote' | 'saved'
  label: string
  tone: StatusDotTone
  state?: VoteState
  /** Its census page; none once it's gone */
  to?: string
}

/** The URL parameter the census filter lives in, so a census page can link straight to its activity. */
export const CENSUS_PARAM = 'census'

/** The census filter: every census, one of them (its key), or the changes that reach none. */
export type CensusFilter = 'all' | 'none' | string

export const voteKey = (processId: string) => `vote:${processId}`
export const savedKey = (groupId: string) => `saved:${groupId}`

const TONES: Record<VoteState, StatusDotTone> = {
  live: 'green',
  paused: 'orange',
  scheduled: 'blue',
  draft: 'gray',
  ended: 'gray',
  canceled: 'gray',
}

export type CensusDirectory = {
  votes: CensusRef[]
  saved: CensusRef[]
  byKey: Map<string, CensusRef>
  markers: Map<string, VoteGroupMarker>
}

export const buildDirectory = (index: CensusIndex, markers: Map<string, VoteGroupMarker>): CensusDirectory => {
  const { live, scheduled, drafts, closed } = index.votes
  const votes: CensusRef[] = [
    ...live.map((entry) => ({ entry, state: entry.state as VoteState })),
    ...scheduled.map((entry) => ({ entry, state: entry.state as VoteState })),
    ...drafts.map((entry) => ({ entry, state: 'draft' as const })),
    ...closed.map((entry) => ({ entry, state: entry.state as VoteState })),
  ].map(({ entry, state }) => ({
    key: voteKey(entry.process.id),
    kind: 'vote',
    label: entry.title,
    tone: TONES[state],
    state,
    to: generatePath(Routes.dashboard.memberbase.voteCensus, { processId: entry.process.id }),
  }))
  const saved: CensusRef[] = index.saved.map(({ group }) => ({
    key: savedKey(group.id),
    kind: 'saved',
    label: group.title,
    tone: 'gray',
    to: generatePath(Routes.dashboard.memberbase.census, { groupId: group.id }),
  }))
  return { votes, saved, byKey: new Map([...votes, ...saved].map((ref) => [ref.key, ref])), markers }
}

/**
 * The censuses an event reached: the votes it names, and the census it changed. A vote's own census
 * (a group marked for it) is that vote's. A person's edit reaches every census they're in, so it can
 * name several; an import, or an edit to someone in no census, names none.
 */
export const censusesOf = (event: ActivityEvent, directory: CensusDirectory): CensusRef[] => {
  const keys: string[] = (event.processIds ?? []).map(voteKey)
  const { subject } = event
  if (subject.type === 'process') keys.push(voteKey(subject.id))
  if ((subject.type === 'group' || subject.type === 'census') && subject.id) {
    const marker = directory.markers.get(subject.id)
    keys.push(marker ? voteKey(marker.processId) : savedKey(subject.id))
  }
  const refs: CensusRef[] = []
  for (const key of new Set(keys)) {
    const ref = directory.byKey.get(key)
    if (ref) refs.push(ref)
    // A saved census deleted since: still named, with nowhere to go
    else if (key.startsWith('saved:') && subject.label)
      refs.push({ key, kind: 'saved', label: subject.label, tone: 'gray' })
  }
  return refs
}

export const matchesCensus = (event: ActivityEvent, filter: CensusFilter, directory: CensusDirectory) => {
  if (filter === 'all') return true
  const refs = censusesOf(event, directory)
  return filter === 'none' ? !refs.length : refs.some((ref) => ref.key === filter)
}

/** Every census of the organization, for the Activity tab's chips and its census filter. */
export const useCensusDirectory = () => {
  const { index, markers, isLoading } = useCensusIndex()
  const directory = useMemo(() => buildDirectory(index, markers), [index, markers])
  return { directory, isLoading }
}

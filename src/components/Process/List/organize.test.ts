import { makeProcess } from './__fixtures__/processes'
import { organizeProcesses } from './organize'

const live = makeProcess('live', 'Board election 2026', { status: 'ONGOING', end: 1 })
const liveLater = makeProcess('live-later', 'Budget approval', { status: 'ONGOING', end: 6 })
const paused = makeProcess('paused', 'Paused motion', { status: 'PAUSED', end: 2 })
const scheduled = makeProcess('scheduled', 'Statute amendment', { status: 'ONGOING', start: 14, end: 21 })
const ended = makeProcess('ended', 'Delegate election', { status: 'RESULTS', start: -40, end: -25 })
const endedRecent = makeProcess('ended-recent', 'Votació de pressupostos', { status: 'ENDED', start: -10, end: -3 })
const canceled = makeProcess('canceled', 'Extraordinary assembly', { status: 'CANCELED', end: -60 })
const draftOld = makeProcess('draft-old', 'Assembly March', { published: false, updatedAt: '2026-01-01T00:00:00Z' })
const draftNew = makeProcess('draft-new', 'Spring motions', { published: false, updatedAt: '2026-09-26T00:00:00Z' })

const published = [ended, scheduled, liveLater, canceled, live, endedRecent, paused]
const drafts = [draftOld, draftNew]
const ids = (entries: { process: { id: string } }[]) => entries.map((entry) => entry.process.id)

describe('organizeProcesses', () => {
  it('groups votes by where they are in their life', () => {
    const groups = organizeProcesses({ published, drafts, language: 'en' })

    expect(ids(groups.live).sort()).toEqual(['live', 'live-later', 'paused'])
    // Open on chain but not started yet: that's scheduled, not live
    expect(ids(groups.scheduled)).toEqual(['scheduled'])
    expect(ids(groups.closed).sort()).toEqual(['canceled', 'ended', 'ended-recent'])
    expect(ids(groups.drafts).sort()).toEqual(['draft-new', 'draft-old'])
  })

  it('puts what needs attention first by default', () => {
    const groups = organizeProcesses({ published, drafts, language: 'en' })

    // Live: closing soonest first. Closed and drafts: most recent first.
    expect(ids(groups.live)).toEqual(['live', 'paused', 'live-later'])
    expect(ids(groups.closed)).toEqual(['ended-recent', 'ended', 'canceled'])
    expect(ids(groups.drafts)).toEqual(['draft-new', 'draft-old'])
  })

  it('sorts by title when asked', () => {
    const groups = organizeProcesses({ published, drafts, sort: 'title', language: 'en' })

    expect(ids(groups.live)).toEqual(['live', 'live-later', 'paused'])
  })

  it('searches titles ignoring case and accents', () => {
    const groups = organizeProcesses({ published, drafts, query: 'VOTACIO', language: 'ca' })

    expect(ids(groups.closed)).toEqual(['ended-recent'])
    expect(groups.live).toHaveLength(0)
    expect(groups.drafts).toHaveLength(0)
  })

  it('keeps every vote for an empty or blank search', () => {
    const groups = organizeProcesses({ published, drafts, query: '   ', language: 'en' })

    expect(groups.live.length + groups.scheduled.length + groups.closed.length).toBe(published.length)
  })
})

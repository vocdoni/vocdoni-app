import type { RoomFacts, RoomQuestion, VoterScreen, VoterScreenKind } from './voter-flow'
import { isRoomCast, isRoomEligible } from './voter-flow'

// The question-by-question rail and strip (boards V4VoterWideLive / M4VoterLive 0 to 4 and 1b; rulings R6, R7).

/** A question's look in the rail (ui/StepRail state) and which note goes under its title. */
export type RoomRowState = 'pending' | 'now' | 'done' | 'skipped'
export type RoomNote =
  | 'waiting'
  | 'open'
  | 'openVoted'
  | 'openSkipped'
  | 'openLost'
  | 'paused'
  | 'closed'
  | 'closedVoted'
  | 'closedMissed'
  | 'closedLost'
  | 'closedUnknown'
  | 'closedLate'
  | 'canceled'

/** The frames of a question-by-question vote: they carry the strip, the progress line and the rail. */
export const ROOM_SCREENS: ReadonlySet<VoterScreenKind> = new Set<VoterScreenKind>([
  'roomNotStarted',
  'roomOpen',
  'roomQuestion',
  'roomVoted',
  'roomSkipped',
  'roomMissed',
  'roomClosedVoted',
  'roomNone',
])

export const isRoomScreen = (screen: VoterScreen): boolean => ROOM_SCREENS.has(screen.kind)

const CLOSED = new Set(['closed', 'notOpened', 'canceled'])
const isClosed = (question: RoomQuestion) => CLOSED.has(question.state)

/**
 * One question's row: to open, open ("Oberta ara", or "No l'has votada" once skipped), cast and open ("Has votat.
 * Esperant que es tanqui."), closed and cast ("Tancada", a tick), closed and not cast ("Tancada. No l'has votada.", the
 * quiet ring). A held (paused) question stays current; a canceled one is quiet. Only a vote the chain holds (or the CSP
 * authorised, anonymous) gets the tick: a lost one says it was not recorded, one of unknown outcome that it could not
 * be confirmed (gate-3 F2, F3).
 */
export const roomRowOf = (question: RoomQuestion, skipped: boolean): { state: RoomRowState; note: RoomNote } => {
  switch (question.state) {
    case 'open':
      if (question.cast === 'lost') return { state: 'now', note: 'openLost' }
      if (isRoomCast(question)) return { state: 'done', note: 'openVoted' }
      return { state: 'now', note: skipped ? 'openSkipped' : 'open' }
    case 'paused':
      return { state: 'now', note: 'paused' }
    case 'closed':
      if (question.cast === 'lost') return { state: 'skipped', note: 'closedLost' }
      if (question.cast === 'unknown') return { state: 'skipped', note: 'closedUnknown' }
      if (question.cast === 'late') return { state: 'skipped', note: 'closedLate' }
      if (!isRoomCast(question)) return { state: 'skipped', note: 'closedMissed' }
      // "Tancada. Has votat." when the voter is shown the result and their vote is on chain.
      return { state: 'done', note: question.showsResult && question.cast === 'recorded' ? 'closedVoted' : 'closed' }
    case 'notOpened':
      // A question the vote ended before it ever opened: closed but never available to vote.
      return { state: 'pending', note: 'closed' }
    case 'canceled':
      return { state: 'pending', note: 'canceled' }
    default:
      return { state: 'pending', note: 'waiting' }
  }
}

/** From this many questions the rail folds (board 1b is drawn with 20; plan Q5). */
const ROOM_RAIL_FOLD_FROM = 9
/** The questions shown after the open one (or the next to open) before the rest fold. */
const ROOM_RAIL_AHEAD = 3

export type RoomRailEntry =
  | { kind: 'row'; index: number; state: RoomRowState; note: RoomNote }
  /** "Preguntes 1 a 12. Tancades." (1-based numbers). */
  | { kind: 'closed'; from: number; to: number }
  /** "+4", "4 preguntes més. De la 17 a la 20." (1-based numbers). */
  | { kind: 'more'; from: number; to: number; count: number }

export type RoomRailExpanded = { closed: boolean; more: boolean }

// The open (or held) question, else the next to open, else past the end.
const anchorOf = (questions: readonly RoomQuestion[]): number => {
  const open = questions.findIndex((question) => question.state === 'open' || question.state === 'paused')
  if (open !== -1) return open
  const next = questions.findIndex((question) => question.state === 'toOpen')
  return next === -1 ? questions.length : next
}

/**
 * The rail's entries. A long agenda folds the closed run before the anchor into one row, keeps the anchor and the
 * three next, and folds the rest into a last row; each fold opens on its own ("Mostra-les"). A group folds only when it
 * would hide two rows or more.
 */
export const roomRail = (room: RoomFacts, skipped: readonly string[], expanded: RoomRailExpanded): RoomRailEntry[] => {
  const { questions } = room
  // A question this voter may not vote has no row, but the others keep their agenda numbers.
  const rows = questions.flatMap((question, index) =>
    isRoomEligible(question)
      ? [{ kind: 'row' as const, index, ...roomRowOf(question, skipped.includes(question.id)) }]
      : []
  )
  if (questions.length < ROOM_RAIL_FOLD_FROM) return rows
  const anchor = anchorOf(questions)
  let closedRun = 0
  while (closedRun < anchor && isClosed(questions[closedRun])) closedRun++
  const foldClosed = !expanded.closed && closedRun >= 2
  const moreFrom = anchor + ROOM_RAIL_AHEAD + 1
  const moreCount = questions.length - moreFrom
  const foldMore = !expanded.more && moreCount >= 2
  const entries: RoomRailEntry[] = foldClosed ? [{ kind: 'closed', from: 1, to: closedRun }] : []
  rows.forEach((row) => {
    if ((foldClosed && row.index < closedRun) || (foldMore && row.index >= moreFrom)) return
    entries.push(row)
  })
  if (foldMore) entries.push({ kind: 'more', from: moreFrom + 1, to: questions.length, count: moreCount })
  return entries
}

export type RoomProgressKind = 'notStarted' | 'open' | 'paused' | 'voted' | 'lost' | 'skipped' | 'none'
/** What the strip says and how far its line goes: `value` of `total` (StepProgress). */
export type RoomProgress = { kind: RoomProgressKind; current: number; closed: number; total: number; value: number }

/**
 * The strip below `lg` (R6, R7): "Encara no s'ha obert cap pregunta" (line empty); the open question's place with
 * "oberta ara", "ja has votat" or "No l'has votada" (line to its end); a lost vote says it was not recorded, never
 * "ja has votat" (gate-3 F2); "Cap pregunta oberta. 3 de 4 tancades" (line to the closed ones). A held question reads
 * its place alone. Null off the room frames.
 */
export const roomProgress = (room: RoomFacts, screen: VoterScreen): RoomProgress | null => {
  // The strip counts the questions this voter may vote, so its places run over those alone (the rail keeps the numbers).
  const votable = room.questions.filter(isRoomEligible)
  const total = votable.length
  const closed = votable.filter(isClosed).length
  const at = (kind: RoomProgressKind, index: number): RoomProgress => {
    const current = votable.indexOf(room.questions[index]) + 1
    return { kind, current, closed, total, value: current }
  }
  switch (screen.kind) {
    case 'roomNotStarted':
      return { kind: 'notStarted', current: 0, closed, total, value: 0 }
    case 'roomOpen':
      return at('open', screen.index)
    case 'roomQuestion':
      return at(screen.paused ? 'paused' : 'open', screen.index)
    case 'roomVoted':
      return at(screen.record === 'lost' ? 'lost' : 'voted', screen.index)
    case 'roomSkipped':
      return at('skipped', screen.index)
    // An open set answered in one form: its place is the set's last question (the line runs to it).
    case 'question':
      return screen.set ? at('open', screen.index) : null
    case 'review':
      return screen.set && screen.index !== undefined ? at('open', screen.index) : null
    case 'roomMissed':
    case 'roomClosedVoted':
    case 'roomNone':
      return { kind: 'none', current: 0, closed, total, value: closed }
    default:
      return null
  }
}

/** The next question to open ("La següent"), or -1. */
export const roomNextIndex = (room: RoomFacts): number =>
  room.questions.findIndex((question) => question.state === 'toOpen')

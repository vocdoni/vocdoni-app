import type { LocalizedInput, VotingProcessResponse, VotingProcessResultsResponse } from '@vocdoni/api-types'
import { tryInferQuestionBallotType } from '@vocdoni/ballot'
import type { TFunction } from 'i18next'
import { resultTypeLabel } from '~components/Process/resultTypeLabels'
import { tallyBase, tallyOf, tallyUnit, type Tally, type TallyUnit } from '~utils/question-tally'
import { isSettledQuestion, questionElectorate } from '~utils/vote-state'

// `useVoteText().text`: a localized title in the reader's language.
type Text = (value: LocalizedInput | undefined) => string

/** Each question with the tally Gestió shows for it: the served one wins over the one the process read carries. */
export const questionTallies = (election: VotingProcessResponse, results?: VotingProcessResultsResponse | null) => {
  const served = new Map((results?.questions ?? []).map((entry) => [entry.questionId, entry]))
  return election.questions.map((question) => {
    const entry = served.get(question.id)
    const merged = entry?.results?.length ? { ...question.results, ...entry } : question.results
    return { question, results: merged, tally: tallyOf(question, merged) }
  })
}

/**
 * Whether the CSV may be downloaded: some question has a tally, and every tally is settled (a close told only by the
 * browser clock is not, so the file would carry a provisional tally with nothing saying so).
 */
export const csvReady = (tallies: ReturnType<typeof questionTallies>): boolean => {
  const withTally = tallies.filter(({ tally }) => tally)
  return withTally.length > 0 && withTally.every(({ question, results }) => isSettledQuestion(question, results))
}

/** The CSV's name from the vote's title: letters (accents kept), figures and dashes, safe on every current system. */
export const resultsFileName = (title: string, id: string): string => {
  const name = title
    .normalize('NFC')
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return `${name || 'results'}-${id}.csv`
}

const unitLabel = (t: TFunction, unit: TallyUnit) => {
  switch (unit) {
    case 'points':
      return t('votes.downloads.csv.unit.points', { defaultValue: 'points' })
    case 'weight':
      return t('votes.downloads.csv.unit.weight', { defaultValue: 'weight' })
    default:
      return t('votes.downloads.csv.unit.votes', { defaultValue: 'votes' })
  }
}

/**
 * The results as one table, a row per option, each carrying its question's context (method, unit, how many answered,
 * census), so a spreadsheet can filter and pivot it. The share is the one the page shows: of the people who answered,
 * or of the total where a figure is not one per voter (points, weights), so a multiple choice can add up to over 100.
 */
export const resultsCsvRows = (
  election: VotingProcessResponse,
  results: VotingProcessResultsResponse | null | undefined,
  t: TFunction,
  text: Text,
  /** Whether the user manages the vote: the census column is left empty for anyone else (see questionElectorate). */
  canManage: boolean
): (string | number)[][] => {
  const weighted = !!election.census?.weighted
  const rows: (string | number)[][] = [
    [
      t('votes.downloads.csv.number', { defaultValue: 'Question number' }),
      t('votes.downloads.csv.question', { defaultValue: 'Question' }),
      t('votes.downloads.csv.method', { defaultValue: 'Method' }),
      t('votes.downloads.csv.option', { defaultValue: 'Option' }),
      t('votes.downloads.csv.result', { defaultValue: 'Result' }),
      t('votes.downloads.csv.unit.header', { defaultValue: 'Unit' }),
      t('votes.downloads.csv.share', { defaultValue: 'Share (%)' }),
      t('votes.downloads.csv.answered', { defaultValue: 'People who answered' }),
      t('votes.downloads.csv.census', { defaultValue: 'Census' }),
    ],
  ]

  questionTallies(election, results).forEach(({ question, results: merged, tally }, index) => {
    if (!tally) return
    const base = tallyBase(tally)
    const method = resultTypeLabel(t, tryInferQuestionBallotType(question))
    const unit = unitLabel(t, tallyUnit(question, weighted))
    const answered = merged?.voteCount ?? ''
    const census = questionElectorate(question, election, canManage) ?? ''
    const optionOf = (entry: Tally) => {
      const choice = question.choices.find((candidate) => candidate.value === entry.value)
      return choice ? text(choice.title) : t('votes.manage.abstention', { defaultValue: 'Abstention' })
    }
    for (const entry of tally) {
      // One decimal, as a number: the file's dialect writes its decimal mark.
      const share = base > 0 ? Math.round((entry.votes / base) * 1000) / 10 : 0
      rows.push([index + 1, text(question.title), method, optionOf(entry), entry.votes, unit, share, answered, census])
    }
  })
  return rows
}

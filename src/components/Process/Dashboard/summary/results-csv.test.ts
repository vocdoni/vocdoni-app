import type { LocalizedInput, VotingProcessResponse, VotingProcessResultsResponse } from '@vocdoni/api-types'
import i18n from 'i18next'
import { csvReady, questionTallies, resultsCsvRows, resultsFileName } from './results-csv'

const t = i18n.getFixedT('en')
const text = (value: LocalizedInput | undefined) =>
  typeof value === 'string' ? value : ((value as { default?: string } | undefined)?.default ?? '')

const PROTOCOL = {
  maxCount: 1,
  maxValue: 1,
  maxVoteOverwrites: 0,
  costExponent: 1,
  uniqueValues: false,
  maxTotalCost: 0,
  costFromWeight: false,
}

const question = (id: string, title: string, voteCount: number, tally?: string[]) => ({
  id,
  title: { default: title },
  choices: [
    { title: { default: 'Yes' }, value: 0 },
    { title: { default: 'No' }, value: 1 },
  ],
  ballotProtocol: PROTOCOL,
  type: 'singlechoice',
  status: 'RESULTS',
  results: { voteCount, ...(tally ? { results: [tally], finalResults: true } : {}) },
})

const process = (questions: unknown[], census: Record<string, unknown> = { size: 8 }) =>
  ({ id: 'p1', title: { default: 'Assembly' }, census, questions }) as unknown as VotingProcessResponse

describe('resultsCsvRows', () => {
  it('writes one row per option with its question, method, unit, share, answered and census', () => {
    const rows = resultsCsvRows(process([question('q1', 'Budget', 5, ['3', '2'])]), null, t, text, true)

    expect(rows).toEqual([
      [
        'Question number',
        'Question',
        'Method',
        'Option',
        'Result',
        'Unit',
        'Share (%)',
        'People who answered',
        'Census',
      ],
      [1, 'Budget', 'Single choice', 'Yes', 3, 'votes', 60, 5, 8],
      [1, 'Budget', 'Single choice', 'No', 2, 'votes', 40, 5, 8],
    ])
  })

  it('numbers the questions as the ballot does and skips one with no tally to read', () => {
    const rows = resultsCsvRows(
      process([question('q1', 'First', 0), question('q2', 'Second', 4, ['1', '3'])]),
      null,
      t,
      text,
      true
    )

    expect(rows.slice(1).map((row) => [row[0], row[1], row[3], row[4]])).toEqual([
      [2, 'Second', 'Yes', 1],
      [2, 'Second', 'No', 3],
    ])
  })

  it('reads the served tally over the one the process carries', () => {
    const served = {
      id: 'p1',
      questions: [{ questionId: 'q1', voteCount: 6, finalResults: true, results: [['4', '2']] }],
    } as unknown as VotingProcessResultsResponse
    const rows = resultsCsvRows(process([question('q1', 'Budget', 5, ['3', '2'])]), served, t, text, true)

    expect(rows.slice(1).map((row) => [row[4], row[6], row[7]])).toEqual([
      [4, 66.7, 6],
      [2, 33.3, 6],
    ])
  })

  it('counts weight, and shares of the total, on a weighted census', () => {
    const rows = resultsCsvRows(
      process([question('q1', 'Budget', 5, ['30', '10'])], { size: 8, weighted: true }),
      null,
      t,
      text,
      true
    )

    expect(rows.slice(1).map((row) => [row[4], row[5], row[6]])).toEqual([
      [30, 'weight', 75],
      [10, 'weight', 25],
    ])
  })

  it('leaves the census empty for someone who cannot manage the vote', () => {
    const rows = resultsCsvRows(process([question('q1', 'Budget', 5, ['3', '2'])]), null, t, text, false)

    expect(rows.slice(1).map((row) => row[8])).toEqual(['', ''])
  })
})

describe('resultsFileName', () => {
  it('keeps accented letters whole', () => {
    expect(resultsFileName('Votació anual', 'p1')).toBe('Votació-anual-p1.csv')
    expect(resultsFileName('Elección de junta', 'p1')).toBe('Elección-de-junta-p1.csv')
    expect(resultsFileName('Assemblea General Ordina\u0300ria 2026', 'p1')).toBe(
      'Assemblea-General-Ordinària-2026-p1.csv'
    )
  })

  it('turns anything else into single dashes and falls back to "results"', () => {
    expect(resultsFileName('  "Board" / 2026?  ', 'p1')).toBe('Board-2026-p1.csv')
    expect(resultsFileName('???', 'p1')).toBe('results-p1.csv')
  })
})

describe('csvReady', () => {
  it('waits until every question with a tally is settled', () => {
    const settled = question('q1', 'First', 4, ['1', '3'])
    const byClock = { ...question('q2', 'Second', 4, ['1', '3']), status: 'ONGOING' }
    byClock.results = { ...byClock.results, finalResults: false }

    expect(csvReady(questionTallies(process([settled]), null))).toBe(true)
    expect(csvReady(questionTallies(process([settled, byClock]), null))).toBe(false)
    expect(csvReady(questionTallies(process([question('q3', 'Third', 0)]), null))).toBe(false)
  })
})

import type {
  BallotProtocol,
  PublishedVotingProcessResponse,
  VotingProcessQuestion,
  VotingProcessQuestionResults,
  VotingProcessResultsResponse,
} from '@vocdoni/api-types'
import { isValidElement, type ReactNode } from 'react'

export const PROCESS_ID = '6a3cfc6b3af4e390f5f79291'

export const singleChoiceBallotProtocol: BallotProtocol = {
  costExponent: 1,
  costFromWeight: false,
  maxCount: 1,
  maxTotalCost: 0,
  maxValue: 1,
  maxVoteOverwrites: 0,
  uniqueValues: false,
}

export const createQuestion = (overrides: Partial<VotingProcessQuestion> = {}): VotingProcessQuestion => ({
  id: 'question-1',
  parentProcessId: PROCESS_ID,
  upstreamId: 'f39c69dabbf5335bd7d53130ad823a71b7ba9834',
  title: { default: 'Board continuity proposal' },
  choices: [
    { title: { default: 'Approve' }, value: 0 },
    { title: { default: 'Reject' }, value: 1 },
  ],
  ballotProtocol: singleChoiceBallotProtocol,
  type: 'singlechoice',
  secretUntilTheEnd: false,
  status: 'RESULTS',
  ...overrides,
})

export const createElection = (
  overrides: Partial<PublishedVotingProcessResponse> = {}
): PublishedVotingProcessResponse => ({
  id: PROCESS_ID,
  orgAddress: '1a9ffe1f4c2493578ce4a7dbebd7d95433eee6f0',
  title: { default: 'Annual vote' },
  chainId: 'vocdoni/LTS/1.2',
  census: { size: 100, authFields: ['memberNumber'], twoFaFields: [] },
  questions: [createQuestion()],
  published: true,
  startDate: '2026-01-01T10:00:00Z',
  endDate: '2026-01-02T10:00:00Z',
  ...overrides,
})

export const createQuestionResults = (
  overrides: Partial<VotingProcessQuestionResults> = {}
): VotingProcessQuestionResults => ({
  questionId: 'question-1',
  upstreamId: 'f39c69dabbf5335bd7d53130ad823a71b7ba9834',
  status: 'RESULTS',
  voteCount: 10,
  startDate: '2026-01-01T10:00:00Z',
  endDate: '2026-01-02T10:00:00Z',
  finalResults: true,
  // Single-choice histogram: one row, one column per choice value → 7 Approve, 3 Reject
  results: [['7', '3']],
  ...overrides,
})

export const createResults = (overrides: Partial<VotingProcessResultsResponse> = {}): VotingProcessResultsResponse => ({
  id: PROCESS_ID,
  questions: [createQuestionResults()],
  ...overrides,
})

export const translate = ((key: string, options?: Record<string, unknown> & { defaultValue?: string }) => {
  let value = options?.defaultValue ?? key

  Object.entries(options ?? {}).forEach(([name, replacement]) => {
    value = value.replace(`{{${name}}}`, String(replacement))
  })

  return value
}) as never

export const collectTextContent = (node: ReactNode): string[] => {
  if (node === null || typeof node === 'undefined' || typeof node === 'boolean') return []
  if (typeof node === 'string' || typeof node === 'number') return [String(node)]
  if (Array.isArray(node)) return node.flatMap((child) => collectTextContent(child))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!isValidElement<any>(node)) return []

  const props = node.props

  if (typeof node.type === 'function') {
    const Component = node.type as (componentProps: typeof props) => ReactNode
    return collectTextContent(Component(props))
  }

  return collectTextContent((props as { children?: ReactNode }).children)
}

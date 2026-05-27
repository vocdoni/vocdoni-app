import { CensusType, ElectionResultsTypeNames, ElectionStatus, PublishedElection } from '@vocdoni/sdk'
import { isValidElement, type ReactNode } from 'react'

export const createElection = () =>
  Object.assign(new PublishedElection({} as never), {
    id: '0x1234',
    chainId: 'vocdoni/LTS/1.2',
    title: { default: 'Annual vote' },
    status: ElectionStatus.RESULTS,
    startDate: new Date('2026-01-01T10:00:00Z'),
    endDate: new Date('2026-01-02T10:00:00Z'),
    voteCount: 42,
    census: { size: 100 },
    maxCensusSize: 100,
    electionType: { secretUntilTheEnd: false },
    voteType: { maxVoteOverwrites: 0 },
    resultsType: undefined,
    questions: [],
  }) as PublishedElection

export const createElectionWithResults = () =>
  Object.assign(createElection(), {
    voteCount: 10,
    questions: [
      {
        title: { default: 'Board continuity proposal' },
        choices: [{ title: { default: 'Approve' } }, { title: { default: 'Reject' } }],
      },
    ],
    results: [[7, 3]],
  }) as PublishedElection

export const createReport = (
  election: PublishedElection,
  overrides: Partial<{ isWeighted: boolean; participation: number; turnout: number }> = {}
) => ({
  election,
  isWeighted: false,
  participation: 42,
  turnout: 42,
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

  return collectTextContent(props.children)
}

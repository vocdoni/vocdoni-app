import type { QuestionStatus } from '@vocdoni/api-types'
import { mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { createElection, createQuestion } from './VotingReportPdf/__fixtures__'
import { ProcessDate, ProcessDateInline } from './Date'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
  }
})

// Print the date each label is given instead of a relative "x days ago", which depends on today.
vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>()
  const t = (key: string, options?: { date?: Date; status?: string }) =>
    options?.date ? [options.status, options.date.toISOString()].filter(Boolean).join(' ') : key
  return { ...actual, useTranslation: () => ({ t, i18n: { language: 'en' } }) }
})

// The fixture is configured to end on 2026-01-02T10:00:00Z.
const mockElection = (endedAt?: string, status: QuestionStatus = 'RESULTS') =>
  setReactProvidersMock({
    useElection: () =>
      mockUseElection({
        election: { ...createElection({ questions: [createQuestion({ status })] }), endedAt },
        status,
      }),
  })

describe('ProcessDate', () => {
  it('dates a vote ended early from when voting actually stopped', () => {
    mockElection('2026-01-01T15:42:00Z')

    render(<ProcessDate />)

    expect(screen.getByText('process.date.ended')).toBeInTheDocument()
    expect(screen.getByText('2026-01-01T15:42:00.000Z')).toBeInTheDocument()
    expect(screen.queryByText('2026-01-02T10:00:00.000Z')).toBeNull()
  })

  it('dates a vote that ran to its schedule from its configured end', () => {
    mockElection()

    render(<ProcessDate />)

    expect(screen.getByText('2026-01-02T10:00:00.000Z')).toBeInTheDocument()
  })
})

describe('ProcessDateInline', () => {
  it('dates a vote ended early from when voting actually stopped', () => {
    mockElection('2026-01-01T15:42:00Z')

    render(<ProcessDateInline />)

    expect(screen.getByText('process.date.ended 2026-01-01T15:42:00.000Z')).toBeInTheDocument()
  })
})

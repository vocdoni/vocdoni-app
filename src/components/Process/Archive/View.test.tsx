import { render, screen } from '~src/test-utils'
import type { LegacyElection, LegacyElectionStatus } from '~src/legacy/vochain-archive'
import { ArchiveProcessView } from './View'

// Echo the calendar day, so tests can tell which date a line was given.
vi.mock('~i18n/use-date-fns', () => ({
  useDateFns: () => ({ format: (date: Date | string) => new Date(date).toISOString().slice(0, 10) }),
}))

const renderWithStatus = (status: LegacyElectionStatus) => {
  // The gateway already reports when an election really stopped, so `endDate` is the real end.
  const election: LegacyElection = {
    id: '0xelection',
    organizationId: '0xorg',
    status,
    startDate: '2026-01-01T10:00:00Z',
    endDate: '2026-01-02T10:00:00Z',
    voteCount: 3,
    finalResults: false,
    secretUntilTheEnd: false,
    maxCensusSize: 10,
    chainId: 'vocdoni/LTS/1.2',
    title: { default: 'Archived vote' },
    questions: [],
    resultsAvailable: true,
  }

  render(<ArchiveProcessView election={election} />)
}

describe('ArchiveProcessView', () => {
  it('says a finished election ended', () => {
    renderWithStatus('ENDED')

    expect(screen.getByText(/Ended 2026-01-02/)).toBeInTheDocument()
  })

  it('says when a running election ends', () => {
    renderWithStatus('ONGOING')

    expect(screen.getByText(/Ends 2026-01-02/)).toBeInTheDocument()
  })
})

import { render, screen, TestMemoryRouter } from '~src/test-utils'
import type { LegacyElectionListItem, LegacyElectionStatus, LegacyOrganization } from '~src/legacy/vochain-archive'
import { ArchiveOrganizationView } from './View'

// Echo the calendar day, so tests can tell which date a line was given.
vi.mock('~i18n/use-date-fns', () => ({
  useDateFns: () => ({ format: (date: Date | string) => new Date(date).toISOString().slice(0, 10) }),
}))

const organization: LegacyOrganization = { address: '0xorg' }

const renderWithElection = (status: LegacyElectionStatus) => {
  // The gateway already reports when an election really stopped, so `endDate` is the real end.
  const election: LegacyElectionListItem = {
    id: '0xelection',
    organizationId: '0xorg',
    status,
    startDate: '2026-01-01T10:00:00Z',
    endDate: '2026-01-02T10:00:00Z',
    voteCount: 3,
    finalResults: false,
    title: { default: 'Archived vote' },
  }

  render(
    <TestMemoryRouter>
      <ArchiveOrganizationView
        organization={organization}
        initialElectionsPage={{ elections: [election], pagination: { currentPage: 0, lastPage: 0 } }}
      />
    </TestMemoryRouter>
  )
}

describe('ArchiveOrganizationView', () => {
  it('says a finished election ended', () => {
    renderWithElection('RESULTS')

    expect(screen.getByText('Ended on 2026-01-02')).toBeInTheDocument()
  })

  it('says when a running election ends', () => {
    renderWithElection('ONGOING')

    expect(screen.getByText('Ends on 2026-01-02')).toBeInTheDocument()
  })
})

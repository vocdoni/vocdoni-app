import { render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { CensusSearch } from './CensusSearch'

vi.mock('~queries/participants', () => ({
  useProcessParticipants: () => ({ data: [], isLoading: false, isError: false }),
  isParticipantLookupField: (field: string) => field === 'email' || field === 'memberNumber',
}))

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})

const renderSearch = () => {
  setReactProvidersMock({
    useElection: () => ({
      election: { id: 'p1', census: { authFields: ['email'], twoFaFields: [] } },
      results: null,
      status: 'ONGOING',
    }),
  })
  return render(<CensusSearch />)
}

describe('CensusSearch', () => {
  it('marks the whole lookup panel with ph-no-capture so PostHog does not record participant PII', () => {
    renderSearch()
    // The ph-no-capture class must be on a container that wraps the name, email and voted badge.
    expect(document.querySelector('.ph-no-capture')).toBeInTheDocument()
    // The search field itself is inside the no-capture zone.
    const field = screen.getByRole('combobox', { hidden: true })
    expect(field.closest('.ph-no-capture')).not.toBeNull()
  })
})

import type { VotingProcessResponse } from '@vocdoni/api-types'
import { render, screen } from '~src/test-utils'
import { setReactProvidersMock, setAuthMock, getAuthMock } from '~src/test-utils-react-providers-mock'
import OrganizationView from './View'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

vi.mock('./Header', () => ({
  default: () => <div>Organization header</div>,
}))

vi.mock('./NoElections', () => ({
  default: () => <div>No elections</div>,
}))

vi.mock('../Process/CardDetailed', () => ({
  default: ({ election }: { election: VotingProcessResponse }) => <div>{election.title.default}</div>,
}))

const createElection = (id: string): VotingProcessResponse => ({
  id,
  orgAddress: 'abc',
  title: { default: `Election ${id}` },
  description: { default: '' },
  census: {},
  questions: [],
  published: true,
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-01-02T00:00:00.000Z',
})

describe('OrganizationView', () => {
  it('renders the server-provided first elections page without refetching page 1 on mount', () => {
    const list = vi.fn()

    setAuthMock({ currentAddress: '0xabc' })
    setReactProvidersMock({
      useClient: () => ({
        connected: false,
        account: null,
        client: { elections: { list } },
      }),
      useOrganization: () => ({
        organization: {
          address: '0xabc',
          name: { default: 'Vocdoni Association' },
          description: { default: '' },
        },
        fetch: vi.fn(),
      }),
    })

    render(
      <OrganizationView
        initialElectionsPage={{
          elections: [createElection('0x1')],
          pagination: {
            totalItems: 1,
            previousPage: null,
            currentPage: 1,
            nextPage: null,
            lastPage: 1,
          },
        }}
      />
    )

    expect(screen.getByText('Organization header')).toBeInTheDocument()
    expect(screen.getByText('Election 0x1')).toBeInTheDocument()
    expect(list).not.toHaveBeenCalled()
  })
})

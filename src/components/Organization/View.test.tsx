import { PublishedElection } from '@vocdoni/sdk'
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
  default: ({ election }: { election: PublishedElection }) => <div>{election.title.default}</div>,
}))

const createElection = (id: string) =>
  new PublishedElection({
    id,
    organizationId: '0xabc',
    title: { default: `Election ${id}` },
    description: { default: '' },
    status: 'READY',
    startDate: new Date('2026-01-01T00:00:00.000Z'),
    endDate: new Date('2026-01-02T00:00:00.000Z'),
    electionType: {
      anonymous: false,
      interruptible: true,
      dynamicCensus: false,
      secretUntilTheEnd: false,
    },
    census: null,
    questions: [],
  } as any)

describe('OrganizationView', () => {
  it('renders the server-provided first elections page without refetching page 0 on mount', () => {
    const fetchElections = vi.fn()

    setAuthMock({ currentAddress: '0xabc' })
    setReactProvidersMock({
      useClient: () => ({
        connected: false,
        account: null,
        client: { fetchElections },
      }),
      useOrganization: () => ({
        organization: {
          address: '0xabc',
          account: { name: { default: 'Vocdoni Association' }, description: { default: '' } },
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
            currentPage: 0,
            nextPage: null,
            lastPage: 0,
          },
        }}
      />
    )

    expect(screen.getByText('Organization header')).toBeInTheDocument()
    expect(screen.getByText('Election 0x1')).toBeInTheDocument()
    expect(fetchElections).not.toHaveBeenCalled()
  })
})

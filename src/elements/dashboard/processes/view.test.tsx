import { render, screen } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import DashboardProcessViewElement, { makeRefetchInterval } from './view'

const election = { id: 'process-1', orgAddress: '0xabc' }

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')

  return {
    ...actual,
    ...getReactProvidersMock(),
  }
})

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()

  return {
    ...actual,
    useLoaderData: () => election,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('~components/Process/Dashboard/ProcessView', () => ({
  __esModule: true,
  ProcessView: () => <div>Dashboard process view</div>,
}))

describe('DashboardProcessViewElement', () => {
  beforeEach(() => {
    resetReactProvidersMock()
  })

  // The sidebar turnout is processVoteCount(results) over election.census.size, so both reads
  // have to poll or an admin watching votes come in sees a frozen count.
  it('polls both the process and its results so the turnout stays live', () => {
    const electionProviderProps: Record<string, any>[] = []

    setReactProvidersMock({
      useOrganization: () => ({ organization: { address: '0xabc' } }),
      ElectionProvider: (props: any) => {
        electionProviderProps.push(props)
        return props.children
      },
    })

    render(<DashboardProcessViewElement />)

    expect(screen.getByText('Dashboard process view')).toBeInTheDocument()
    expect(electionProviderProps).toHaveLength(1)
    expect(electionProviderProps[0].queryOptions).toMatchObject({
      refetchInterval: makeRefetchInterval,
      refetchOnWindowFocus: 'always',
    })
    expect(electionProviderProps[0].resultsQueryOptions).toEqual({
      refetchInterval: 30_000,
      refetchOnWindowFocus: 'always',
    })
  })
})

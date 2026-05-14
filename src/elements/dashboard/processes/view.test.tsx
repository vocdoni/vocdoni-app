import { Fragment } from 'react'
import { render, waitFor, createTestMemoryRouter, TestRouterProvider } from '~src/test-utils'
import { resetReactProvidersMock, setReactProvidersMock } from '~src/test-utils-react-providers-mock'

let capturedElectionProviderProps: Record<string, any> | null = null

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')

  return {
    ...actual,
    ...getReactProvidersMock(),
    ElectionProvider: (props: any) => {
      capturedElectionProviderProps = props
      const { children } = props
      return <>{children}</>
    },
  }
})

vi.mock('~components/Process/Dashboard/ProcessView', () => ({
  ProcessView: () => <div>process view</div>,
}))

vi.mock('@vocdoni/sdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/sdk')>()

  class MockPublishedElection {}

  return {
    ...actual,
    PublishedElection: MockPublishedElection,
  }
})

describe('DashboardProcessViewElement', () => {
  beforeEach(() => {
    capturedElectionProviderProps = null
    resetReactProvidersMock()
  })

  it('passes election id to ElectionProvider so refetchInterval can trigger background refetches', async () => {
    const mockElection = Object.assign(Object.create(null), {
      id: '0xabc123',
      organizationId: '0xorg',
    })

    setReactProvidersMock({
      useOrganization: () => ({ organization: { address: '0xorg' } }),
    })

    const { default: DashboardProcessViewElement } = await import('./view')

    const router = createTestMemoryRouter(
      [
        {
          path: '/admin/process/:id',
          element: <DashboardProcessViewElement />,
          loader: async () => mockElection,
          children: [{ index: true, element: <Fragment /> }],
        },
      ],
      { initialEntries: ['/admin/process/0xabc123'] }
    )

    render(<TestRouterProvider router={router} />)

    await waitFor(() => {
      expect(capturedElectionProviderProps).not.toBeNull()
    })

    expect(capturedElectionProviderProps?.id).toBe('0xabc123')
  })
})

import { render, waitFor } from '~src/test-utils'
import { resetReactProvidersMock } from '~src/test-utils-react-providers-mock'
import PublicProcessPage from './PublicPage'

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

vi.mock('~components/Process/View', () => ({
  ProcessView: () => <div>process view</div>,
}))

vi.mock('~components/Layout/LegalNotice', () => ({
  default: () => <div>legal notice</div>,
}))

describe('PublicProcessPage', () => {
  beforeEach(() => {
    capturedElectionProviderProps = null
    resetReactProvidersMock()
  })

  it('passes election id to ElectionProvider so refetchInterval can trigger background refetches', async () => {
    const mockElection = { id: '0xabc123', organizationId: '0xorg' } as any

    render(<PublicProcessPage election={mockElection} />)

    await waitFor(() => {
      expect(capturedElectionProviderProps).not.toBeNull()
    })

    expect(capturedElectionProviderProps?.id).toBe('0xabc123')
  })
})

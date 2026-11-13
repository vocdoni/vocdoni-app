import { act, fireEvent, mockUseOrganization, render, screen, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock, setAuthMock, getAuthMock } from '~src/test-utils-react-providers-mock'
import OrganizationDashboard from './index'

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => getAuthMock(),
}))

let electionsQueryState: any = { data: null, isLoading: false, isError: false, error: null }
const useQueryOptions = vi.fn()

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<any>('@tanstack/react-query')
  return {
    ...actual,
    useQuery: (options: unknown) => {
      useQueryOptions(options)
      return electionsQueryState
    },
  }
})

vi.mock('~src/queries/account', () => ({
  useProfile: () => ({ data: { firstName: 'Jane' }, isLoading: false }),
}))

vi.mock('~src/queries/organization', () => ({
  paginatedElectionsQuery: (address?: string) => ({
    queryKey: ['elections', address],
    queryFn: vi.fn(),
    enabled: !!address,
  }),
}))

const playerProps = vi.fn()
vi.mock('react-player', () => ({
  default: (props: { onClickPreview?: () => void; onPause?: () => void }) => {
    playerProps(props)
    return <div onClick={props.onClickPreview}>Player</div>
  },
}))

vi.mock('~components/Layout/WhatsappButton', () => ({
  WhatsAppButton: () => <div>WhatsApp</div>,
}))

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
    ElectionStatusBadge: () => <div>Status</div>,
    ElectionTitle: () => <div>Title</div>,
  }
})

vi.mock('./UsageLimits', () => ({
  UsageLimits: () => <div>UsageLimits</div>,
}))

describe('OrganizationDashboard', () => {
  beforeEach(() => {
    electionsQueryState = { data: null, isLoading: false, isError: false, error: null }
    setAuthMock({ currentAddress: '0xabc' })
    setReactProvidersMock({
      ElectionProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      useOrganization: () => mockUseOrganization({ organization: null }),
    })
  })

  it('offers to create an organization even when the shared elections cache holds an error', () => {
    // The elections cache entry is keyed per organization, but the /admin/processes loaders can
    // leave it in an error state for an account that has no organization at all. A disabled
    // useQuery still reports that cached error, and showing it here hides the only way forward.
    setAuthMock({ currentAddress: undefined })
    electionsQueryState = {
      data: null,
      isLoading: false,
      isError: true,
      error: new Error('invalid URL parameter: missing orgAddress'),
    }

    render(
      <TestMemoryRouter>
        <OrganizationDashboard />
      </TestMemoryRouter>
    )

    expect(screen.getByText('Create your first organization')).toBeInTheDocument()
    expect(screen.queryByText('Error loading voting processes')).not.toBeInTheDocument()
  })

  it('lists the voting processes from the session address, without waiting for the organization to load', () => {
    // useOrganization still has no organization object; the address alone is enough to start.
    render(
      <TestMemoryRouter>
        <OrganizationDashboard />
      </TestMemoryRouter>
    )

    expect(useQueryOptions).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['elections', '0xabc'] }))
    for (const [options] of useQueryOptions.mock.calls) {
      expect(options.enabled).not.toBe(false)
    }
    expect(screen.queryByText('Create your first organization')).not.toBeInTheDocument()
  })

  it('renders dashboard header', () => {
    const env = (import.meta as any).env || {}
    Object.defineProperty(import.meta, 'env', {
      value: { ...env, VIDEO_TUTORIAL: { en: 'https://example.com' } },
      configurable: true,
    })

    render(
      <TestMemoryRouter>
        <OrganizationDashboard />
      </TestMemoryRouter>
    )
    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })

  describe('tutorial video', () => {
    const renderWithVideo = (src: string) =>
      render(
        <TestMemoryRouter>
          <OrganizationDashboard />
        </TestMemoryRouter>,
        { appEnv: { VIDEO_TUTORIAL: { en: src } } }
      )

    beforeEach(() => playerProps.mockClear())

    it('shows the YouTube thumbnail and loads the player only when it is clicked, then plays', () => {
      renderWithVideo('https://www.youtube.com/watch?v=OQRF_4-zGSk')

      const preview = screen.getByLabelText('How to create your first vote', { selector: 'button' })
      expect(preview).toHaveStyle({ backgroundImage: 'url(https://i.ytimg.com/vi/OQRF_4-zGSk/hqdefault.jpg)' })
      expect(playerProps).not.toHaveBeenCalled()

      fireEvent.click(preview)

      expect(playerProps).toHaveBeenLastCalledWith(expect.objectContaining({ playing: true }))
      expect(playerProps.mock.lastCall![0]).not.toHaveProperty('light')

      // Pausing in the player sticks: later renders do not tell it to play again
      act(() => playerProps.mock.lastCall![0].onPause())

      expect(playerProps).toHaveBeenLastCalledWith(expect.objectContaining({ playing: false }))
    })

    it('keeps a click-to-load preview for a video that is not on YouTube', () => {
      renderWithVideo('https://example.com/tutorial.mp4')

      expect(screen.getByLabelText('How to create your first vote', { selector: 'button' })).toBeInTheDocument()
      expect(playerProps).not.toHaveBeenCalled()
    })
  })
})

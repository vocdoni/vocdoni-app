import { mockUseElection, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { ElectionVideo } from './ElectionVideo'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = (await importOriginal()) as typeof import('@vocdoni/react-components')
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})

const playerLoaded = vi.fn()

vi.mock('~components/ui/VideoPlayer', () => {
  playerLoaded()
  return {
    VideoPlayer: ({ src, title }: { src: string; title: string }) => (
      <div data-testid='player' title={title}>
        {src}
      </div>
    ),
  }
})

describe('ElectionVideo', () => {
  beforeEach(() => {
    playerLoaded.mockClear()
  })

  it('renders nothing, and never loads the player, when the election has no stream', () => {
    setReactProvidersMock({ useElection: () => mockUseElection({ election: { id: 'p1' } }) })

    render(<ElectionVideo />)

    expect(screen.queryByTestId('player')).toBeNull()
    expect(playerLoaded).not.toHaveBeenCalled()
  })

  it('plays the stream once the lazy player has loaded', async () => {
    setReactProvidersMock({
      useElection: () => mockUseElection({ election: { id: 'p1', streamUri: 'https://example.test/live.m3u8' } }),
    })

    render(<ElectionVideo />)

    expect(await screen.findByTestId('player')).toHaveTextContent('https://example.test/live.m3u8')
  })

  it('titles the player after the election', async () => {
    setReactProvidersMock({
      useElection: () =>
        mockUseElection({
          election: { id: 'p1', streamUri: 'https://example.test/live', title: { default: 'Board election' } },
        }),
    })

    render(<ElectionVideo />)

    expect(await screen.findByTestId('player')).toHaveAttribute('title', 'Board election')
  })

  it('falls back to a generic title when the election has none', async () => {
    setReactProvidersMock({
      useElection: () => mockUseElection({ election: { id: 'p1', streamUri: 'https://example.test/live' } }),
    })

    render(<ElectionVideo />)

    expect(await screen.findByTestId('player')).toHaveAttribute('title', 'Video')
  })
})

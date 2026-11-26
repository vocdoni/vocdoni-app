import { render, screen } from '~src/test-utils'
import { ElectionVideo } from './ElectionVideo'

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

  it('renders nothing, and never loads the player, without a stream', () => {
    render(<ElectionVideo />)

    expect(screen.queryByTestId('player')).toBeNull()
    expect(playerLoaded).not.toHaveBeenCalled()
  })

  it('plays the stream once the lazy player has loaded', async () => {
    render(<ElectionVideo streamUri='https://example.test/live.m3u8' />)

    expect(await screen.findByTestId('player')).toHaveTextContent('https://example.test/live.m3u8')
  })

  it('titles the player after the election', async () => {
    render(<ElectionVideo streamUri='https://example.test/live' title='Board election' />)

    expect(await screen.findByTestId('player')).toHaveAttribute('title', 'Board election')
  })

  it('falls back to a generic title when the election has none', async () => {
    render(<ElectionVideo streamUri='https://example.test/live' />)

    expect(await screen.findByTestId('player')).toHaveAttribute('title', 'Video')
  })
})

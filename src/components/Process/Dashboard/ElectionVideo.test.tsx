import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { render } from '~src/test-utils'
import { VideoPlayer } from '~components/ui/VideoPlayer'
import { ElectionVideo } from './ElectionVideo'

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return { ...actual, ...getReactProvidersMock() }
})

vi.mock('~components/ui/VideoPlayer', () => ({ VideoPlayer: vi.fn(() => null) }))

describe('ElectionVideo', () => {
  const renderVideo = (election: Record<string, unknown>) => {
    setReactProvidersMock({ useElection: () => ({ election }) })
    render(<ElectionVideo />)
  }

  it('titles the player after the election', () => {
    renderVideo({ streamUri: 'https://example.test/live', title: { default: 'Board election' } })

    expect(vi.mocked(VideoPlayer).mock.lastCall?.[0]).toMatchObject({ title: 'Board election' })
  })

  it('falls back to a generic title when the election has none', () => {
    renderVideo({ streamUri: 'https://example.test/live' })

    expect(vi.mocked(VideoPlayer).mock.lastCall?.[0]).toMatchObject({ title: 'Video' })
  })
})

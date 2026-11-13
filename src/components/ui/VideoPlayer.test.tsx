import { render } from '~src/test-utils'
import { VideoPlayer } from './VideoPlayer'

// Stand-in for react-player's wrapper (Player.js): it hands the node to the forwarded ref and drops whatever that
// ref returns, so a cleanup returned from a ref callback never runs. A <fake-player> host stands in for
// <youtube-video>, whose open shadow root holds the iframe.
vi.mock('react-player', async () => {
  const { forwardRef, useCallback, createElement } = await import('react')
  return {
    default: forwardRef<HTMLElement>((_props, ref) => {
      const callback = useCallback(
        (node: HTMLElement | null) => {
          if (typeof ref === 'function') ref(node)
          else if (ref !== null) ref.current = node
        },
        [ref]
      )
      return createElement('fake-player', { ref: callback })
    }),
  }
})

const playerHost = (container: HTMLElement) => container.querySelector('fake-player') as HTMLElement

const addIframe = (root: ShadowRoot) => {
  const iframe = document.createElement('iframe')
  root.appendChild(iframe)
  return iframe
}

describe('VideoPlayer', () => {
  it('titles the iframe inside the player shadow root', async () => {
    const { container } = render(<VideoPlayer src='https://example.test/live' title='Board election' />)
    const root = playerHost(container).attachShadow({ mode: 'open' })
    const iframe = addIframe(root)

    await vi.waitFor(() => expect(iframe).toHaveAttribute('title', 'Board election'))
  })

  it('titles an iframe the player rebuilds later', async () => {
    const { container } = render(<VideoPlayer src='https://example.test/live' title='Board election' />)
    const root = playerHost(container).attachShadow({ mode: 'open' })
    addIframe(root)
    await vi.waitFor(() => expect(root.querySelector('iframe')).toHaveAttribute('title', 'Board election'))

    root.innerHTML = ''
    const next = addIframe(root)

    await vi.waitFor(() => expect(next).toHaveAttribute('title', 'Board election'))
  })

  it('follows a changed title', async () => {
    const { container, rerender } = render(<VideoPlayer src='https://example.test/live' title='English' />)
    const root = playerHost(container).attachShadow({ mode: 'open' })
    const iframe = addIframe(root)
    await vi.waitFor(() => expect(iframe).toHaveAttribute('title', 'English'))

    rerender(<VideoPlayer src='https://example.test/live' title='Català' />)

    await vi.waitFor(() => expect(iframe).toHaveAttribute('title', 'Català'))
  })

  it('never writes the old title again once the title changed and the iframe was rebuilt', async () => {
    const { container, rerender } = render(<VideoPlayer src='https://example.test/live' title='English' />)
    const root = playerHost(container).attachShadow({ mode: 'open' })
    addIframe(root)
    await vi.waitFor(() => expect(root.querySelector('iframe')).toHaveAttribute('title', 'English'))

    rerender(<VideoPlayer src='https://example.test/live' title='Català' />)
    root.innerHTML = ''
    const next = addIframe(root)
    const setAttribute = vi.spyOn(next, 'setAttribute')

    await vi.waitFor(() => expect(next).toHaveAttribute('title', 'Català'))
    const titles = setAttribute.mock.calls.filter(([name]) => name === 'title').map(([, value]) => value)
    expect(titles).toEqual(['Català'])
  })

  it('stops titling iframes once unmounted', async () => {
    const { container, unmount } = render(<VideoPlayer src='https://example.test/live' title='Board election' />)
    const root = playerHost(container).attachShadow({ mode: 'open' })
    addIframe(root)
    await vi.waitFor(() => expect(root.querySelector('iframe')).toHaveAttribute('title', 'Board election'))

    unmount()
    root.innerHTML = ''
    const late = addIframe(root)

    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(late).not.toHaveAttribute('title')
  })

  it('stops polling for a shadow root once unmounted', async () => {
    const { container, unmount } = render(<VideoPlayer src='https://example.test/live' title='Board election' />)
    const host = playerHost(container)
    unmount()

    const iframe = addIframe(host.attachShadow({ mode: 'open' }))

    await new Promise((resolve) => setTimeout(resolve, 250))
    expect(iframe).not.toHaveAttribute('title')
  })
})

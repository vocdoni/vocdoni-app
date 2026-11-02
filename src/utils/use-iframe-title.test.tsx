import { act, renderHook } from '@testing-library/react'
import { useIframeTitle } from './use-iframe-title'

const addIframe = (root: ShadowRoot) => {
  const iframe = document.createElement('iframe')
  root.appendChild(iframe)
  return iframe
}

// Stand-in for the <youtube-video> element, which draws its iframe inside an open shadow root.
const fakePlayer = () => {
  const host = document.createElement('div')
  return { host, root: host.attachShadow({ mode: 'open' }) }
}

describe('useIframeTitle', () => {
  afterEach(() => vi.useRealTimers())

  it('titles the iframe already inside the shadow root', () => {
    const { host, root } = fakePlayer()
    const iframe = addIframe(root)

    const { result } = renderHook(() => useIframeTitle('Tutorial'))
    act(() => result.current(host))

    expect(iframe).toHaveAttribute('title', 'Tutorial')
  })

  it('titles an iframe recreated later', async () => {
    const { host, root } = fakePlayer()
    const { result } = renderHook(() => useIframeTitle('Tutorial'))
    act(() => result.current(host))

    root.innerHTML = ''
    const next = addIframe(root)

    await vi.waitFor(() => expect(next).toHaveAttribute('title', 'Tutorial'))
  })

  it('waits for a shadow root that is attached after the ref', async () => {
    vi.useFakeTimers()
    const host = document.createElement('div')
    const { result } = renderHook(() => useIframeTitle('Tutorial'))
    act(() => result.current(host))

    const iframe = addIframe(host.attachShadow({ mode: 'open' }))
    await act(() => vi.advanceTimersByTimeAsync(500))

    expect(iframe).toHaveAttribute('title', 'Tutorial')
  })

  it('follows a changed title and stops observing on unmount', async () => {
    const { host, root } = fakePlayer()
    const iframe = addIframe(root)
    const { result, rerender, unmount } = renderHook(({ title }) => useIframeTitle(title), {
      initialProps: { title: 'English' },
    })
    act(() => result.current(host))

    rerender({ title: 'Català' })
    expect(iframe).toHaveAttribute('title', 'Català')

    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
    unmount()
    expect(disconnect).toHaveBeenCalled()
    disconnect.mockRestore()

    const late = addIframe(root)
    await new Promise((resolve) => setTimeout(resolve, 20))
    expect(late).not.toHaveAttribute('title')
  })
})

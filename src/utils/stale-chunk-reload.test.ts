import { installStaleChunkReload, STALE_CHUNK_RELOAD_KEY, STALE_CHUNK_RELOAD_WINDOW_MS } from './stale-chunk-reload'

const fakeWindow = ({ onLine = true }: { onLine?: boolean } = {}) => {
  const target = new EventTarget()
  const storage = new Map<string, string>()
  const reload = vi.fn()
  const win = {
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    navigator: { onLine },
    sessionStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
    location: { reload },
  } as unknown as Window
  const failChunk = () => {
    const event = new Event('vite:preloadError', { cancelable: true })
    target.dispatchEvent(event)
    return event
  }
  return { win, reload, storage, failChunk }
}

describe('installStaleChunkReload', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('reloads once when a chunk fails to load, and lets the error propagate', () => {
    const { win, reload, failChunk } = fakeWindow()
    installStaleChunkReload(win)

    const event = failChunk()

    expect(reload).toHaveBeenCalledTimes(1)
    expect(event.defaultPrevented).toBe(false)
  })

  it('does not reload again within the window, so a broken build cannot loop', () => {
    vi.useFakeTimers()
    const { win, reload, failChunk } = fakeWindow()
    installStaleChunkReload(win)

    failChunk()
    vi.advanceTimersByTime(STALE_CHUNK_RELOAD_WINDOW_MS - 1)
    failChunk()
    expect(reload).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(1)
    failChunk()
    expect(reload).toHaveBeenCalledTimes(2)
  })

  it('remembers the last reload across page loads through sessionStorage', () => {
    const { win, reload, storage, failChunk } = fakeWindow()
    storage.set(STALE_CHUNK_RELOAD_KEY, String(Date.now()))
    installStaleChunkReload(win)

    failChunk()

    expect(reload).not.toHaveBeenCalled()
  })

  it('does not reload while offline', () => {
    const { win, reload, failChunk } = fakeWindow({ onLine: false })
    installStaleChunkReload(win)

    failChunk()

    expect(reload).not.toHaveBeenCalled()
  })

  it('stops listening after cleanup', () => {
    const { win, reload, failChunk } = fakeWindow()
    const cleanup = installStaleChunkReload(win)

    cleanup()
    failChunk()

    expect(reload).not.toHaveBeenCalled()
  })
})

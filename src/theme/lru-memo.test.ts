import { lruMemo } from './lru-memo'

describe('lruMemo', () => {
  it('builds once per key and returns the same result on a hit', () => {
    const build = vi.fn((key: string) => ({ key }))
    const get = lruMemo(2, build)
    const first = get('a')
    expect(get('a')).toBe(first)
    expect(build).toHaveBeenCalledTimes(1)
  })

  it('keeps at most `max` entries, dropping the least recently used', () => {
    const build = vi.fn((key: string) => ({ key }))
    const get = lruMemo(2, build)
    const a = get('a')
    get('b')
    get('a') // a is now the most recent; b is the oldest
    get('c') // evicts b
    expect(get('a')).toBe(a)
    expect(build).toHaveBeenCalledTimes(3)
    get('b') // rebuilt after its eviction
    expect(build).toHaveBeenCalledTimes(4)
  })

  it('stays bounded under a stream of new keys', () => {
    const build = vi.fn((key: string) => key)
    const get = lruMemo(32, build)
    for (let i = 0; i < 1000; i++) get(`k${i}`)
    build.mockClear()
    for (let i = 968; i < 1000; i++) get(`k${i}`) // the last 32 are all still cached
    expect(build).not.toHaveBeenCalled()
    get('k0') // long evicted
    expect(build).toHaveBeenCalledTimes(1)
  })
})

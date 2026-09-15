import { afterEach, describe, expect, it, vi } from 'vitest'
import { resolveAppEnv } from './app-env'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('resolveAppEnv', () => {
  it('returns the env coming from the global context untouched', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const appEnv = { PRIMARY_COLOR: '#1a73e8' }

    expect(resolveAppEnv(appEnv)).toBe(appEnv)
    expect(warn).not.toHaveBeenCalled()
  })

  it('warns once when the env never arrived, instead of degrading silently', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const first = resolveAppEnv(undefined)

    expect(first).toBeDefined()
    expect(first.PRIMARY_COLOR).toBeUndefined()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0][0]).toMatch(/passToClient/)

    // warn-once: a missing env is a boot-time misconfiguration, not a per-render event
    resolveAppEnv(undefined)
    expect(warn).toHaveBeenCalledTimes(1)
  })
})

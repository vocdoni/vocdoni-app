import { renderHook } from '@testing-library/react'
import { createElement, type PropsWithChildren } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AppEnvProvider, resolveAppEnv, useLanguagesEnv } from './app-env'

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

describe('useLanguagesEnv', () => {
  const renderLanguages = (LANGUAGES: string | Record<string, string>) =>
    renderHook(() => useLanguagesEnv(), {
      wrapper: ({ children }: PropsWithChildren) => createElement(AppEnvProvider, { value: { LANGUAGES } }, children),
    })

  // Callers put the map in hook dependency lists (AnalyticsProvider restarts
  // its sinks on it), so a fresh object per render would re-run those effects
  // on every render. The JSON-string form is the one that parses anew each call.
  it('returns the same map across re-renders for a JSON-string LANGUAGES', () => {
    const { result, rerender } = renderHook(() => useLanguagesEnv(), {
      wrapper: ({ children }: PropsWithChildren) =>
        createElement(AppEnvProvider, { value: { LANGUAGES: '{"ca":"Català","es":"Español"}' } }, children),
    })
    const first = result.current

    rerender()

    expect(first).toEqual({ ca: 'Català', es: 'Español' })
    expect(result.current).toBe(first)
  })

  it('returns the configured object itself when LANGUAGES is already a map', () => {
    const LANGUAGES = { ca: 'Català' }
    const { result, rerender } = renderLanguages(LANGUAGES)

    rerender()

    expect(result.current).toBe(LANGUAGES)
  })
})

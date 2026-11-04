import { createRef } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '~src/test-utils'
import { usePanelFocus } from './usePanelFocus'

const makeRef = () => {
  const el = document.createElement('h2')
  document.body.appendChild(el)
  el.tabIndex = -1
  const ref = createRef<HTMLHeadingElement>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(ref as any).current = el
  return { ref, el }
}

describe('usePanelFocus', () => {
  const originalTitle = 'Test Page'

  beforeEach(() => {
    document.title = originalTitle
  })

  afterEach(() => {
    // Clean up appended elements
    document.querySelectorAll('h2').forEach((el) => el.remove())
  })

  it('sets document.title and focuses the heading when key changes', () => {
    const { ref, el } = makeRef()
    const focusSpy = vi.spyOn(el, 'focus')

    const { rerender } = renderHook(
      ({ k }: { k: string }) => usePanelFocus(ref, k, { title: 'Checking', vote: 'My Vote', error: false }),
      { initialProps: { k: 'checking' } }
    )

    // After initial render (skipInitial not set), title and focus should be set.
    expect(document.title).toBe('Checking - My Vote')
    expect(focusSpy).toHaveBeenCalledTimes(1)

    // Change key: should set title and focus again.
    act(() => {
      rerender({ k: 'stalled' })
    })
    expect(document.title).toBe('Checking - My Vote')
    expect(focusSpy).toHaveBeenCalledTimes(2)
  })

  it('prefixes "Error:" when error is true', () => {
    const { ref } = makeRef()
    renderHook(() => usePanelFocus(ref, 'err', { title: 'Something went wrong', vote: 'My Vote', error: true }))
    expect(document.title).toBe('Error: Something went wrong - My Vote')
  })

  it('does nothing on the first render when skipInitial is true', () => {
    const { ref, el } = makeRef()
    const focusSpy = vi.spyOn(el, 'focus')

    const { rerender } = renderHook(
      ({ k }: { k: string }) => usePanelFocus(ref, k, { title: 'Panel', vote: 'My Vote', skipInitial: true }),
      { initialProps: { k: 'first' } }
    )

    expect(document.title).toBe(originalTitle)
    expect(focusSpy).not.toHaveBeenCalled()

    // On key change it should activate.
    act(() => {
      rerender({ k: 'second' })
    })
    expect(document.title).toBe('Panel - My Vote')
    expect(focusSpy).toHaveBeenCalledTimes(1)
  })

  it('restores the original title on unmount', () => {
    const { ref } = makeRef()
    const { unmount } = renderHook(() => usePanelFocus(ref, 'k', { title: 'Panel', vote: 'My Vote' }))
    expect(document.title).not.toBe(originalTitle)
    unmount()
    expect(document.title).toBe(originalTitle)
  })
})

import { act, renderHook } from '@testing-library/react'
import { useSelection, type SelectedMember } from './useSelection'

const member = (id: string) => ({ id, name: id }) as SelectedMember
const page = ['a', 'b', 'c', 'd'].map(member)

describe('useSelection', () => {
  it('toggles members and reports the page state', () => {
    const { result } = renderHook(() => useSelection())

    act(() => result.current.toggle(page[0], true))
    expect(result.current.ids).toEqual(['a'])
    expect(result.current.pageState(['a', 'b'])).toEqual({ selected: 1, all: false, some: true })

    act(() => result.current.setMany(page.slice(0, 2), true))
    expect(result.current.pageState(['a', 'b'])).toEqual({ selected: 2, all: true, some: true })
    expect(result.current.members.map((entry) => entry.id)).toEqual(['a', 'b'])
  })

  it('applies a shift+click to the whole range since the last toggle', () => {
    const { result } = renderHook(() => useSelection())

    act(() => result.current.toggle(page[0], true))
    act(() => result.current.toggle(page[3], true, { shiftKey: true, range: page }))
    expect(result.current.ids.sort()).toEqual(['a', 'b', 'c', 'd'])

    act(() => result.current.toggle(page[1], false, { shiftKey: true, range: page }))
    expect(result.current.ids).toEqual(['a'])
  })

  it('clears when the reset key changes', () => {
    const { result, rerender } = renderHook(({ resetKey }) => useSelection({ resetKey }), {
      initialProps: { resetKey: 'page-1' },
    })

    act(() => result.current.toggle(page[0], true))
    rerender({ resetKey: 'page-1' })
    expect(result.current.count).toBe(1)
    rerender({ resetKey: 'page-2' })
    expect(result.current.count).toBe(0)
  })
})

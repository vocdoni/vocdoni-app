import { fireEvent, renderHook } from '@testing-library/react'
import { createRef } from 'react'
import { useListShortcuts } from './useListShortcuts'

const setup = (enabled = true) => {
  const onNew = vi.fn()
  const input = document.createElement('input')
  document.body.append(input)
  const searchRef = createRef<HTMLInputElement>()
  ;(searchRef as { current: HTMLInputElement | null }).current = input
  renderHook(() => useListShortcuts({ onNew, searchRef, enabled }))
  return { onNew, input }
}

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useListShortcuts', () => {
  it('opens a new vote on n and N', () => {
    const { onNew } = setup()
    fireEvent.keyDown(window, { key: 'n' })
    fireEvent.keyDown(window, { key: 'N' })
    expect(onNew).toHaveBeenCalledTimes(2)
  })

  it('focuses the search on / and prevents the default', () => {
    const { input } = setup()
    const event = new KeyboardEvent('keydown', { key: '/', cancelable: true, bubbles: true })
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(input).toHaveFocus()
  })

  it('does nothing while typing in a field', () => {
    const { onNew, input } = setup()
    fireEvent.keyDown(input, { key: 'n' })
    const area = document.createElement('textarea')
    document.body.append(area)
    fireEvent.keyDown(area, { key: 'n' })
    const editable = document.createElement('div')
    editable.setAttribute('contenteditable', 'true')
    document.body.append(editable)
    fireEvent.keyDown(editable, { key: 'n' })
    expect(onNew).not.toHaveBeenCalled()
  })

  it.each([
    ['dialog', '<div role="dialog" data-state="open"></div>'],
    ['alertdialog', '<div role="alertdialog" data-state="open"></div>'],
    ['menu', '<div role="menu" data-state="open"></div>'],
  ])('does nothing while an %s is open', (_name, html) => {
    const { onNew } = setup()
    document.body.insertAdjacentHTML('beforeend', html)
    fireEvent.keyDown(window, { key: 'n' })
    fireEvent.keyDown(window, { key: '/' })
    expect(onNew).not.toHaveBeenCalled()
  })

  it('ignores a closed menu and a closed dialog left in the DOM', () => {
    const { onNew, input } = setup()
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div role="menu" hidden data-state="closed"></div><div role="dialog" hidden data-state="closed"></div>'
    )
    fireEvent.keyDown(window, { key: 'n' })
    fireEvent.keyDown(window, { key: '/' })
    expect(onNew).toHaveBeenCalledTimes(1)
    expect(input).toHaveFocus()
  })

  it('ignores modified keys, composition and handled events', () => {
    const { onNew } = setup()
    fireEvent.keyDown(window, { key: 'n', ctrlKey: true })
    fireEvent.keyDown(window, { key: 'n', metaKey: true })
    fireEvent.keyDown(window, { key: 'n', altKey: true })
    fireEvent.keyDown(window, { key: 'n', isComposing: true })
    const handled = new KeyboardEvent('keydown', { key: 'n', cancelable: true, bubbles: true })
    handled.preventDefault()
    window.dispatchEvent(handled)
    expect(onNew).not.toHaveBeenCalled()
  })

  it('does nothing when disabled', () => {
    const { onNew } = setup(false)
    fireEvent.keyDown(window, { key: 'n' })
    expect(onNew).not.toHaveBeenCalled()
  })
})

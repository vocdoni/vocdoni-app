import { act, render } from '@testing-library/react'
import { useAnimatedHeight } from './useAnimatedHeight'

const Frame = ({ step, frame }: { step: string; frame: HTMLElement }) => {
  useAnimatedHeight(frame, step)
  return null
}

const mockMedia = (matches: (query: string) => boolean) =>
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: matches(query), media: query }))

describe('useAnimatedHeight', () => {
  afterEach(() => vi.unstubAllGlobals())

  const heights = { value: 300 }
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')!
  beforeEach(() => {
    heights.value = 300
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', { configurable: true, get: () => heights.value })
  })
  afterEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', original)
  })

  it('holds the old height, then releases to the new one when the step changes', () => {
    mockMedia((query) => query.includes('min-width'))
    const frame = document.createElement('div')
    const { rerender } = render(<Frame frame={frame} step='summary' />)

    heights.value = 200
    rerender(<Frame frame={frame} step='wallet' />)

    expect(frame.style.height).toBe('200px')
    expect(frame).toHaveAttribute('data-resizing')
    expect(frame.style.transition).toContain('height 200ms')
    act(() => {
      frame.dispatchEvent(new Event('transitionend'))
    })
    // Not the frame's own height transition: still going
    expect(frame).toHaveAttribute('data-resizing')
    const done = new Event('transitionend') as Event & { propertyName: string }
    done.propertyName = 'height'
    act(() => {
      frame.dispatchEvent(done)
    })
    expect(frame).not.toHaveAttribute('data-resizing')
    expect(frame.style.height).toBe('')
  })

  it('leaves the height alone under reduced motion and on phones', () => {
    const frame = document.createElement('div')
    mockMedia((query) => query.includes('min-width') || query.includes('reduce'))
    const { rerender } = render(<Frame frame={frame} step='summary' />)
    heights.value = 200
    rerender(<Frame frame={frame} step='wallet' />)
    expect(frame.style.height).toBe('')
    expect(frame).not.toHaveAttribute('data-resizing')

    mockMedia(() => false)
    heights.value = 400
    rerender(<Frame frame={frame} step='summary' />)
    expect(frame.style.height).toBe('')
  })
})

import { useEffect, useLayoutEffect, useRef } from 'react'

// Phones run the dialog full screen and short screens scroll it whole: only a pinned dialog (md up,
// 48em) with room to spare eases its height, and never for someone who asks for less motion
const easesHeight = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(min-width: 48em)').matches &&
  !window.matchMedia('(max-height: 40em)').matches &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches

const durationMs = 200

/**
 * Eases the dialog frame from its old height to the new step's when `stepKey` changes (or the frame
 * itself is replaced, as when the card step remounts the dialog). The new height is measured with
 * `height: auto`, so the frame's own max-height caps it, then the frame is held at the old height and
 * released to the new one. Afterwards the height goes back to auto: whatever resizes inside (the cost
 * panel, Stripe's frames) grows the dialog as it always did. While it eases the frame has
 * `data-resizing`, so the recipe hides the middle's scrollbar.
 */
export const useAnimatedHeight = (frame: HTMLElement | null, stepKey: string) => {
  // The last height seen, which survives the frame being replaced
  const last = useRef<number | null>(null)
  const started = useRef(false)

  useEffect(() => {
    if (!frame || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(() => {
      last.current = frame.offsetHeight
    })
    observer.observe(frame)
    return () => observer.disconnect()
  }, [frame])

  useLayoutEffect(() => {
    if (!frame) return
    // The first open has nothing to ease from
    if (!started.current) {
      started.current = true
      last.current = frame.offsetHeight
      return
    }
    const from = last.current
    const settle = () => {
      frame.style.transition = ''
      frame.style.height = ''
      frame.removeAttribute('data-resizing')
    }
    if (from === null || !easesHeight()) {
      settle()
      last.current = frame.offsetHeight
      return
    }
    frame.style.transition = 'none'
    frame.style.height = 'auto'
    const to = frame.offsetHeight
    if (Math.abs(to - from) < 2) {
      settle()
      last.current = to
      return
    }
    frame.setAttribute('data-resizing', '')
    frame.style.height = `${from}px`
    // Commits the starting height before the transition is switched on
    void frame.offsetHeight
    frame.style.transition = `height ${durationMs}ms ease-out`
    frame.style.height = `${to}px`
    last.current = to
    const done = (event: TransitionEvent) => {
      if (event.target === frame && event.propertyName === 'height') settle()
    }
    frame.addEventListener('transitionend', done)
    // transitionend never comes if the transition is cancelled or the tab is hidden
    const timer = window.setTimeout(settle, durationMs + 100)
    return () => {
      frame.removeEventListener('transitionend', done)
      window.clearTimeout(timer)
    }
  }, [frame, stepKey])
}

import { useEffect, useRef } from 'react'

/**
 * Cmd/Ctrl+Enter runs `onShortcut` while `enabled`. For a step whose primary is not a form submit
 * (the card step's form submits on its own). A held key does not repeat it.
 */
export const usePrimaryShortcut = (enabled: boolean, onShortcut: () => void) => {
  const latest = useRef(onShortcut)
  useEffect(() => {
    latest.current = onShortcut
  })

  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || !(event.metaKey || event.ctrlKey) || event.repeat || event.defaultPrevented) return
      event.preventDefault()
      latest.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [enabled])
}

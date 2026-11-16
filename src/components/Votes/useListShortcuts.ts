import { useEffect, type RefObject } from 'react'

// Ark keeps a closed menu's and dialog's content in the DOM (`hidden`, `data-state="closed"`), so only open ones count.
const OPEN_OVERLAY =
  '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [role="menu"][data-state="open"]'

const isTyping = (target: EventTarget | null) =>
  target instanceof Element &&
  !!target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])')

type Options = {
  onNew: () => void
  searchRef: RefObject<HTMLInputElement | null>
  /** Off below `lg`. */
  enabled?: boolean
}

/** `n` starts a new vote and `/` focuses the search. Mounted by the votes page only. */
export const useListShortcuts = ({ onNew, searchRef, enabled = true }: Options) => {
  useEffect(() => {
    if (!enabled) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if (isTyping(event.target) || document.querySelector(OPEN_OVERLAY)) return
      // `key`, never `code`: it follows the keyboard layout, so `/` works where it is not on the same key.
      if (event.key === 'n' || event.key === 'N') {
        onNew()
      } else if (event.key === '/') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enabled, onNew, searchRef])
}

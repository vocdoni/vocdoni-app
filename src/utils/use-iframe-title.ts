import { useEffect, useState } from 'react'

const ATTACH_RETRY_MS = 100
const ATTACH_MAX_TRIES = 50

/**
 * Gives a title to the iframes that a player custom element (e.g. react-player's `<youtube-video>`) draws inside its
 * open shadow root, which neither react-player nor the element lets us set. Returns a ref callback for the player.
 * The element attaches its shadow root lazily and rebuilds the iframe on every load, so it keeps watching.
 */
export const useIframeTitle = (title: string) => {
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (!host) return

    let observer: MutationObserver | undefined
    let timer: ReturnType<typeof setTimeout> | undefined

    const apply = (root: ShadowRoot) =>
      root.querySelectorAll('iframe').forEach((iframe) => {
        if (iframe.getAttribute('title') !== title) iframe.setAttribute('title', title)
      })

    const attach = (tries: number) => {
      const root = host.shadowRoot
      if (root) {
        apply(root)
        observer = new MutationObserver(() => apply(root))
        observer.observe(root, { childList: true, subtree: true })
      } else if (tries < ATTACH_MAX_TRIES) {
        timer = setTimeout(() => attach(tries + 1), ATTACH_RETRY_MS)
      }
    }
    attach(0)

    return () => {
      clearTimeout(timer)
      observer?.disconnect()
    }
  }, [host, title])

  return setHost
}

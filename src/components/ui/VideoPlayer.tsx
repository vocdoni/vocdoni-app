import { ComponentProps, useEffect, useState } from 'react'
import ReactPlayer from 'react-player'

const ATTACH_RETRY_MS = 100
const ATTACH_MAX_TRIES = 50

type VideoPlayerProps = Omit<ComponentProps<typeof ReactPlayer>, 'ref'> & {
  // react-player has no prop for the iframe's title, so it is set on the iframe itself.
  title: string
}

// The player (e.g. <youtube-video>) draws its iframe in an open shadow root that it attaches lazily and rebuilds on
// every load, so the title is re-applied on each mutation and the root is polled for while it is missing.
// react-player drops any cleanup a ref callback returns, so the host goes to state and the effect owns the cleanup.
export const VideoPlayer = ({ title, ...props }: VideoPlayerProps) => {
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

  return <ReactPlayer ref={setHost} {...props} />
}

import { chakra, Icon, useSlotRecipe } from '@chakra-ui/react'
import { ComponentProps, useEffect, useRef, useState } from 'react'
import ReactPlayer from 'react-player'
import { ResumeIcon } from '~theme/icons'
import { VideoPreview as videoPreviewRecipe } from '~theme/recipes/videoPreview'

const ATTACH_RETRY_MS = 100
const ATTACH_MAX_TRIES = 50

type VideoPlayerProps = Omit<
  ComponentProps<typeof ReactPlayer>,
  'ref' | 'light' | 'previewAriaLabel' | 'onClickPreview' | 'playIcon' | 'previewTabIndex'
> & {
  // react-player has no prop for the iframe's title, so it is set on the iframe itself.
  title: string
  // A play button named by `title` until it is clicked, then the player mounts and plays. A string is the thumbnail's
  // URL; `true` is a plain button.
  preview?: string | true
}

// The player (e.g. <youtube-video>) draws its iframe in an open shadow root that it attaches lazily and rebuilds on
// every load, so the title is re-applied on each mutation and the root is polled for while it is missing.
// react-player drops any cleanup a ref callback returns, so the host goes to state and the effect owns the cleanup.
export const VideoPlayer = ({ title, preview, playing, onPlay, onPause, ...props }: VideoPlayerProps) => {
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [started, setStarted] = useState(preview === undefined)
  // Set by the click that starts the player and read once it is mounted: the preview unmounts, so focus moves into
  // the player and keyboard users keep their place.
  const focusPlayer = useRef(false)
  // A preview owns playback: a pause sticks, so a re-render never tells the player to play again.
  const [paused, setPaused] = useState(false)
  const styles = useSlotRecipe({ recipe: videoPreviewRecipe })()

  useEffect(() => {
    if (!host || !focusPlayer.current) return
    focusPlayer.current = false
    // A native <video>/<audio> with controls is already tabbable; -1 would drop it from the tab order.
    if (!(host instanceof HTMLMediaElement) && !host.hasAttribute('tabindex')) host.tabIndex = -1
    host.focus()
  }, [host])

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

  if (!started && preview !== undefined) {
    return (
      <chakra.button
        type='button'
        aria-label={title}
        css={styles.root}
        onClick={() => {
          focusPlayer.current = true
          setStarted(true)
        }}
      >
        {typeof preview === 'string' && <chakra.img src={preview} alt='' css={styles.thumbnail} />}
        <Icon as={ResumeIcon} css={styles.icon} />
      </chakra.button>
    )
  }

  return (
    <ReactPlayer
      ref={setHost}
      {...props}
      playing={preview === undefined ? playing : !paused}
      onPlay={(event) => {
        setPaused(false)
        onPlay?.(event)
      }}
      onPause={(event) => {
        setPaused(true)
        onPause?.(event)
      }}
    />
  )
}

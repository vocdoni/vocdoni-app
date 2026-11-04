import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'

type UsePanelFocusOptions = {
  title: string
  vote: string
  error?: boolean
  /** Skip focus and title update on the first render (use when the panel is already in view). */
  skipInitial?: boolean
}

/**
 * When `key` changes, focuses the heading ref and updates document.title to reflect
 * the current panel state. Restores the original title on unmount.
 */
export const usePanelFocus = (
  ref: React.RefObject<HTMLHeadingElement | null>,
  key: string,
  { title, vote, error, skipInitial }: UsePanelFocusOptions
) => {
  const { t } = useTranslation()
  const originalTitle = useRef<string | null>(null)
  const isFirstRender = useRef(true)

  // Capture the original title once so we can restore it on unmount.
  useEffect(() => {
    originalTitle.current = document.title
    return () => {
      if (originalTitle.current !== null) {
        document.title = originalTitle.current
      }
    }
  }, [])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      if (skipInitial) return
    }
    const template = error ? 'cert_auth.document_title.error' : 'cert_auth.document_title.status'
    const defaultValue = error ? 'Error: {{title}} - {{vote}}' : '{{title}} - {{vote}}'
    document.title = t(template, { defaultValue, title, vote })
    ref.current?.focus()
    // key drives the effect; title/vote/error/t/ref changes are picked up on the next key change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}

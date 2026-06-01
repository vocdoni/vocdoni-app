import { useEffect, useRef } from 'react'
import { AppTitle } from '~constants'

export function useDocumentTitle(title?: string) {
  const defaultTitleRef = useRef(AppTitle)

  useEffect(() => {
    if (title) {
      let prepend = 'Vocdoni'
      document.title = `${prepend} - ${title}`
    } else {
      document.title = defaultTitleRef.current
    }

    return () => {
      document.title = defaultTitleRef.current
    }
  }, [title])
}

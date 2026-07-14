import { useEffect } from 'react'

/**
 * Sets the document title while the calling component is mounted, restoring
 * the previous title on unmount. SSR pages get their titles from Vike
 * `+title.ts` hooks instead; this is only for client-rendered sections that
 * need to override the app-wide default.
 */
export const useDocumentTitle = (title: string) => {
  useEffect(() => {
    const previous = document.title
    document.title = title
    return () => {
      document.title = previous
    }
  }, [title])
}

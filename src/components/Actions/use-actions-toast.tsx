import { useElection } from '@vocdoni/react-components'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { useVoteText } from '~i18n/use-vote-text'
import { useActions, type ActionKey } from './ActionsContext'

/**
 * The "waiting for the transaction" toast of a running header action (whole-vote pause included); failures are told
 * by the status-job runner. A slow chain can take minutes, so the organiser may close it.
 */
export const useActionsToast = () => {
  const toastRef = useRef<string | undefined>(undefined)
  const { info } = useActions()
  const { election } = useElection()
  const { text } = useVoteText()
  const toast = useToast()
  const { t } = useTranslation()
  // useToast returns a new function every render; the unmount cleanup needs the latest one only.
  const toastFn = useRef(toast)
  toastFn.current = toast

  useEffect(() => {
    const title = text(election?.title)
    const descriptions: Record<ActionKey, string> = {
      continue: t('votes.waiting.continue', { defaultValue: 'Resuming “{{title}}”…', title }),
      pause: t('votes.waiting.pause', { defaultValue: 'Pausing “{{title}}”…', title }),
      end: t('votes.waiting.end', { defaultValue: 'Ending “{{title}}”…', title }),
      cancel: t('votes.waiting.cancel', { defaultValue: 'Canceling “{{title}}”…', title }),
    }
    if (info && !toastRef.current) {
      toastRef.current = toast({
        title: t('votes.waiting.title', { defaultValue: 'Waiting for the change to be confirmed' }),
        description: descriptions[info],
        type: 'info',
        duration: null,
        isClosable: true,
      })
    }
    if (!info && toastRef.current) {
      toast.close(toastRef.current)
      toastRef.current = undefined
    }
  }, [info, toast, t, election, text])

  // Leaving the page mid-action must not leave the toast behind.
  useEffect(
    () => () => {
      if (toastRef.current) toastFn.current.close(toastRef.current)
    },
    []
  )
}

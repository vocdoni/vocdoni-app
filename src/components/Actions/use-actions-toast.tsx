import { useElection } from '@vocdoni/react-components'
import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'
import { useActions } from './ActionsContext'

const isTranslationKey = (value: string) => /^[a-z0-9_.-]+$/i.test(value) && value.includes('.')

/** The "waiting for the transaction" toast of a running header action; failures are told by the status-job runner. */
export const useActionsToast = () => {
  const toastRef = useRef<string | undefined>(undefined)
  const { info } = useActions()
  const { election } = useElection()
  const toast = useToast()
  const { t } = useTranslation()
  // useToast returns a new function every render; the unmount cleanup needs the latest one only.
  const toastFn = useRef(toast)
  toastFn.current = toast

  useEffect(() => {
    const translate = (value?: string | null) =>
      value && isTranslationKey(value) ? t(value, { defaultValue: value, election }) : (value ?? undefined)
    if (info && !toastRef.current) {
      toastRef.current = toast({
        title: translate(info.title),
        description: translate(info.description),
        type: 'info',
        duration: null,
        isClosable: false,
      })
    }
    if (!info && toastRef.current) {
      toast.close(toastRef.current)
      toastRef.current = undefined
    }
  }, [info, toast, t, election])

  // Leaving the page mid-action must not leave a toast nobody can close.
  useEffect(
    () => () => {
      if (toastRef.current) toastFn.current.close(toastRef.current)
    },
    []
  )
}

// Translation keys for extraction:
// t('actions.waiting_title', 'Waiting for transaction confirmation...')
// t('actions.cancel_description', 'Canceling "{{ election.title.default }}"...')
// t('actions.end_description', 'Ending "{{ election.title.default }}" voting process...')
// t('actions.pause_description', 'Pausing "{{ election.title.default }}" voting process...')
// t('actions.continue_description', 'Resuming "{{ election.title.default }}" voting process...')

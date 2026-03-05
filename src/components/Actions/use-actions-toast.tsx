import { useActions, useElection } from '@vocdoni/react-providers'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useToast } from '~components/Toast'

let activeInfoKey: string | undefined
let activeErrorKey: string | undefined

const isTranslationKey = (value: string) => /^[a-z0-9_.-]+$/i.test(value) && value.includes('.')

export const useActionsToast = () => {
  const toastRef = useRef<string | undefined>()
  const { info, error } = useActions()
  const { election } = useElection()
  const toast = useToast()
  const { t } = useTranslation()

  const infoKey = useMemo(() => {
    if (!info) return null
    return `${info.title ?? ''}::${info.description ?? ''}`
  }, [info])

  const errorKey = useMemo(() => {
    if (!error) return null
    return `${error.title ?? ''}::${error.description ?? ''}`
  }, [error])

  const translate = (value?: string | null) => {
    if (!value) return value ?? undefined
    if (isTranslationKey(value)) {
      return t(value, { defaultValue: value, election })
    }
    return value
  }

  useEffect(() => {
    if (toast && info === null && toastRef.current) {
      toast.close(toastRef.current)
      toastRef.current = undefined
      activeInfoKey = undefined
    }
    if (info && toast) {
      if (infoKey && activeInfoKey === infoKey) return
      const toastId = toast({
        title: translate(info.title),
        description: translate(info.description),
        type: 'info',
        duration: null,
        isClosable: false,
      })
      toastRef.current = toastId
      activeInfoKey = infoKey ?? undefined
    }
    if (error && toast) {
      if (errorKey && activeErrorKey === errorKey) return
      toast({
        title: translate(error.title),
        description: translate(error.description),
        type: 'error',
        duration: 7000,
        isClosable: false,
      })
      activeErrorKey = errorKey ?? undefined
    }
  }, [info, error, toast, infoKey, errorKey, t])
}

// Translation keys for extraction:
// t('actions.waiting_title', 'Waiting for transaction confirmation...')
// t('actions.error_title', 'There was some error while executing the transaction')
// t('actions.cancel_description', 'Canceling "{{ election.title.default }}"...')
// t('actions.end_description', 'Ending "{{ election.title.default }}" voting process...')
// t('actions.pause_description', 'Pausing "{{ election.title.default }}" voting process...')
// t('actions.continue_description', 'Resuming "{{ election.title.default }}" voting process...')

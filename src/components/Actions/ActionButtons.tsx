import { Button, type ButtonProps } from '@chakra-ui/react'
import { useConfirm, useElection } from '@vocdoni/react-components'
import { areEqualHexStrings } from '@vocdoni/sdk'
import { hasResults, isLive, isUpcoming } from '@vocdoni/api-client'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '~components/Auth/useAuth'
import { useActions } from './ActionsContext'
import { ConfirmActionModal } from './ConfirmActionModal'

export const ActionContinue = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { currentAddress } = useAuth()
  const { election } = useElection()
  const {
    resume,
    disabled,
    loading: { continue: loading },
  } = useActions()
  const { t } = useTranslation()

  if (!election || !areEqualHexStrings(election.organizationId, currentAddress)) {
    return null
  }

  return (
    <Button ref={ref} loading={loading} onClick={resume} disabled={disabled || election.status !== 'PAUSED'} {...props}>
      {children ?? t('actions.continue')}
    </Button>
  )
})
ActionContinue.displayName = 'ActionContinue'

export const ActionPause = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { currentAddress } = useAuth()
  const { election } = useElection()
  const {
    pause,
    disabled,
    loading: { pause: loading },
  } = useActions()
  const { t } = useTranslation()

  if (!election || !areEqualHexStrings(election.organizationId, currentAddress)) {
    return null
  }

  return (
    <Button ref={ref} loading={loading} onClick={pause} disabled={disabled || !isLive(election)} {...props}>
      {children ?? t('actions.pause')}
    </Button>
  )
})
ActionPause.displayName = 'ActionPause'

export const ActionEnd = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { currentAddress } = useAuth()
  const { confirm } = useConfirm()
  const { election } = useElection()
  const {
    end,
    disabled,
    loading: { end: loading },
  } = useActions()
  const { t } = useTranslation()

  const handle = async () => {
    if (
      await confirm(
        <ConfirmActionModal
          title={t('confirm.end_process_title')}
          description={t('actions.end_description', { election })}
          confirm={t('confirm.end_process_button')}
          cancel={t('confirm.cancel_button')}
        />
      )
    ) {
      await end()
    }
  }

  if (!election || !areEqualHexStrings(election.organizationId, currentAddress)) {
    return null
  }

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={handle}
      disabled={
        disabled ||
        hasResults(election) ||
        election.status === 'ENDED' ||
        election.status === 'CANCELED' ||
        isUpcoming(election)
      }
      {...props}
    >
      {children ?? t('actions.end')}
    </Button>
  )
})
ActionEnd.displayName = 'ActionEnd'

export const ActionCancel = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { currentAddress } = useAuth()
  const { confirm } = useConfirm()
  const { election } = useElection()
  const {
    cancel,
    disabled,
    loading: { cancel: loading },
  } = useActions()
  const { t } = useTranslation()

  const handle = async () => {
    if (
      await confirm(
        <ConfirmActionModal
          title={t('confirm.cancel_process_title')}
          description={t('actions.cancel_description', { election })}
          confirm={t('confirm.cancel_process_button')}
          cancel={t('confirm.cancel_button')}
        />
      )
    ) {
      await cancel()
    }
  }

  if (!election || !areEqualHexStrings(election.organizationId, currentAddress)) {
    return null
  }

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={handle}
      disabled={disabled || election.status === 'CANCELED' || election.status === 'ENDED' || hasResults(election)}
      {...props}
    >
      {children ?? t('actions.cancel')}
    </Button>
  )
})
ActionCancel.displayName = 'ActionCancel'

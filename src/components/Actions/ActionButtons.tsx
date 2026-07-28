import { Button, type ButtonProps } from '@chakra-ui/react'
import { useConfirm, useElection } from '@vocdoni/react-components'
import { hasResults, isUpcoming } from '@vocdoni/api-client'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '~components/Auth/useAuth'
import { sameAddress } from '~utils/address'
import { AnalyticsEvents, trackAnalyticsEvent } from '~utils/analytics'
import { useActions } from './ActionsContext'
import { ConfirmActionModal } from './ConfirmActionModal'

const trackProcessAction = (action: string, election: { id?: string } | null | undefined) =>
  trackAnalyticsEvent({
    name: AnalyticsEvents.ProcessAction,
    props: { action, election_id: election?.id ?? 'unknown' },
  })

export const ActionContinue = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { currentAddress } = useAuth()
  const { election, status } = useElection()
  const {
    resume,
    disabled,
    loading: { continue: loading },
  } = useActions()
  const { t } = useTranslation()

  if (!election || !sameAddress(election.orgAddress, currentAddress)) {
    return null
  }

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={() => {
        trackProcessAction('resume', election)
        return resume()
      }}
      disabled={disabled || status !== 'PAUSED'}
      {...props}
    >
      {children ?? t('actions.continue')}
    </Button>
  )
})
ActionContinue.displayName = 'ActionContinue'

export const ActionPause = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { currentAddress } = useAuth()
  const { election, status } = useElection()
  const {
    pause,
    disabled,
    loading: { pause: loading },
  } = useActions()
  const { t } = useTranslation()

  if (!election || !sameAddress(election.orgAddress, currentAddress)) {
    return null
  }

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={() => {
        trackProcessAction('pause', election)
        return pause()
      }}
      disabled={disabled || status !== 'ONGOING'}
      {...props}
    >
      {children ?? t('actions.pause')}
    </Button>
  )
})
ActionPause.displayName = 'ActionPause'

export const ActionEnd = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { currentAddress } = useAuth()
  const { confirm } = useConfirm()
  const { election, status } = useElection()
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
      trackProcessAction('end', election)
      await end()
    }
  }

  if (!election || !sameAddress(election.orgAddress, currentAddress)) {
    return null
  }

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={handle}
      disabled={disabled || hasResults(election) || status === 'ENDED' || status === 'CANCELED' || isUpcoming(election)}
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
  const { election, status } = useElection()
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
      trackProcessAction('cancel', election)
      await cancel()
    }
  }

  if (!election || !sameAddress(election.orgAddress, currentAddress)) {
    return null
  }

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={handle}
      disabled={disabled || status === 'CANCELED' || status === 'ENDED' || hasResults(election)}
      {...props}
    >
      {children ?? t('actions.cancel')}
    </Button>
  )
})
ActionCancel.displayName = 'ActionCancel'

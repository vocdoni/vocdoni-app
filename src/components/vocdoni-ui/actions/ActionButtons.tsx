import { Button, type ButtonProps } from '@chakra-ui/react'
import { useActions, useClient, useElection } from '@vocdoni/react-providers'
import { areEqualHexStrings, ElectionStatus, PublishedElection } from '@vocdoni/sdk'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useConfirm } from '../confirm/useConfirm'
import { ConfirmActionModal } from './ConfirmActionModal'

export const ActionContinue = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { account } = useClient()
  const { election } = useElection()
  const {
    resume,
    disabled,
    loading: { continue: loading },
  } = useActions()
  const { t } = useTranslation()

  if (
    !election ||
    !(election instanceof PublishedElection) ||
    !areEqualHexStrings(election.organizationId, account?.address)
  ) {
    return null
  }

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={resume}
      disabled={disabled || election.status !== ElectionStatus.PAUSED}
      {...props}
    >
      {children ?? t('actions.continue')}
    </Button>
  )
})
ActionContinue.displayName = 'ActionContinue'

export const ActionPause = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { account } = useClient()
  const { election } = useElection()
  const {
    pause,
    disabled,
    loading: { pause: loading },
  } = useActions()
  const { t } = useTranslation()

  if (
    !election ||
    !(election instanceof PublishedElection) ||
    !areEqualHexStrings(election.organizationId, account?.address)
  ) {
    return null
  }

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={pause}
      disabled={disabled || election.status !== ElectionStatus.ONGOING}
      {...props}
    >
      {children ?? t('actions.pause')}
    </Button>
  )
})
ActionPause.displayName = 'ActionPause'

export const ActionEnd = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { account } = useClient()
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

  if (
    !election ||
    !(election instanceof PublishedElection) ||
    !areEqualHexStrings(election.organizationId, account?.address)
  ) {
    return null
  }

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={handle}
      disabled={
        disabled ||
        [ElectionStatus.RESULTS, ElectionStatus.ENDED, ElectionStatus.CANCELED, ElectionStatus.UPCOMING].includes(
          election.status
        )
      }
      {...props}
    >
      {children ?? t('actions.end')}
    </Button>
  )
})
ActionEnd.displayName = 'ActionEnd'

export const ActionCancel = forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  const { account } = useClient()
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

  if (
    !election ||
    !(election instanceof PublishedElection) ||
    !areEqualHexStrings(election.organizationId, account?.address)
  ) {
    return null
  }

  return (
    <Button
      ref={ref}
      loading={loading}
      onClick={handle}
      disabled={
        disabled || [ElectionStatus.CANCELED, ElectionStatus.ENDED, ElectionStatus.RESULTS].includes(election.status)
      }
      {...props}
    >
      {children ?? t('actions.cancel')}
    </Button>
  )
})
ActionCancel.displayName = 'ActionCancel'

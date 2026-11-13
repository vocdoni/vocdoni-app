import { useConfirm } from '@vocdoni/react-components'
import { useTranslation } from 'react-i18next'
import { ConfirmDialogContent } from '~components/ui/ConfirmDialog'

export type ConfirmActionModalProps = {
  title: string
  description: string
  confirm?: string
  cancel?: string
}

export const ConfirmActionModal = ({ title, description, confirm, cancel }: ConfirmActionModalProps) => {
  const { cancel: cancelFn, proceed } = useConfirm()
  const { t } = useTranslation()

  return (
    <ConfirmDialogContent
      layout='shell'
      title={title}
      description={description}
      confirmText={confirm ?? t('confirm.confirm')}
      cancelText={cancel ?? t('confirm.cancel')}
      onCancel={cancelFn ?? undefined}
      onConfirm={proceed ?? undefined}
    />
  )
}

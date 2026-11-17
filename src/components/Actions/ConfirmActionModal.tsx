import { useConfirm } from '@vocdoni/react-components'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ConfirmDialogContent, type ConfirmDialogTone } from '~components/ui/ConfirmDialog'

export type ConfirmActionModalProps = {
  title: string
  description: ReactNode
  confirm?: string
  cancel?: string
  /** The confirm button: `danger` (default, an outline in the danger colour) or `primary` (the filled accent). */
  tone?: ConfirmDialogTone
  /** The amber line with the warning icon under the description. */
  warning?: ReactNode
}

/** A `useConfirm()` prompt: the same dialog as ConfirmDialog, opened by react-components' ConfirmShell. */
export const ConfirmActionModal = ({ title, description, confirm, cancel, tone, warning }: ConfirmActionModalProps) => {
  const { cancel: cancelFn, proceed } = useConfirm()
  const { t } = useTranslation()

  return (
    <ConfirmDialogContent
      title={title}
      description={description}
      warning={warning}
      tone={tone}
      confirmText={confirm ?? t('confirm.confirm')}
      cancelText={cancel ?? t('confirm.cancel')}
      onCancel={cancelFn ?? undefined}
      onConfirm={proceed ?? undefined}
    />
  )
}

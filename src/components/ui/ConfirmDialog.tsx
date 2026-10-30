import { Button, type ButtonProps, Dialog, type DialogRootProps, Spacer, Text, useSlotRecipe } from '@chakra-ui/react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'
import { DialogHeader } from '~components/ui/DialogHeader'
import { ConfirmModal } from '~theme/recipes/confirmModal'
import { statusPalette } from '~theme/status'

export type ConfirmDialogLayout = 'panel' | 'inline' | 'compact' | 'shell' | 'summary'

export interface ConfirmDialogContentProps {
  title: React.ReactNode
  description?: React.ReactNode
  confirmText?: React.ReactNode
  cancelText?: React.ReactNode
  onConfirm?: () => void
  /** Without it, Cancel closes the dialog through `onOpenChange`. */
  onCancel?: () => void
  /** Shows a spinner on the confirm button. Does not auto-close — the caller controls `open`. */
  loading?: boolean
  /** Red confirm button for destructive actions (default). Set false for a neutral confirm. */
  destructive?: boolean
  layout?: ConfirmDialogLayout
  cancelDisabled?: boolean
  /** e.g. `disabled`, or `asChild` with a link as `confirmText`. */
  confirmProps?: ButtonProps
  /** Rendered after the confirm button. */
  extraActions?: React.ReactNode
  /** Pushes Cancel to the start of the footer, away from the actions. */
  separateCancel?: boolean
  /** Extra body content rendered below the description. */
  children?: React.ReactNode
}

export type ConfirmDialogProps = ConfirmDialogContentProps & Omit<DialogRootProps, 'children'>

/**
 * Header, body and footer of a confirm dialog, for a dialog someone else opens: useConfirm renders it
 * inside react-components' ConfirmShell. Everything else uses ConfirmDialog.
 */
export const ConfirmDialogContent = ({
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  loading = false,
  destructive = true,
  layout = 'panel',
  cancelDisabled,
  confirmProps,
  extraActions,
  separateCancel,
  children,
}: ConfirmDialogContentProps) => {
  const { t } = useTranslation()
  const styles = useSlotRecipe({ recipe: ConfirmModal })({ layout })
  const descriptionText = description && <Text css={styles.description}>{description}</Text>

  const cancel = (
    <Button variant='outline' disabled={cancelDisabled} onClick={onCancel}>
      {cancelText || t('actions.cancel', { defaultValue: 'Cancel' })}
    </Button>
  )

  return (
    <>
      <DialogHeader
        css={styles.header}
        title={title}
        titleProps={{ css: styles.title }}
        description={layout === 'summary' ? description : undefined}
        descriptionProps={{ css: styles.description }}
      />
      <Dialog.Body css={styles.body}>
        {layout !== 'summary' && descriptionText}
        {children}
      </Dialog.Body>
      <Dialog.Footer css={styles.footer}>
        {/* ActionTrigger, not CloseTrigger: that one carries the close button's absolute position. */}
        {onCancel ? cancel : <Dialog.ActionTrigger asChild>{cancel}</Dialog.ActionTrigger>}
        {separateCancel && <Spacer />}
        <Button
          colorPalette={destructive ? statusPalette.destructive : undefined}
          loading={loading}
          onClick={onConfirm}
          {...confirmProps}
        >
          {confirmText || t('actions.confirm', { defaultValue: 'Confirm' })}
        </Button>
        {extraActions}
      </Dialog.Footer>
    </>
  )
}

/**
 * The app's one confirm dialog. Prefer it over `useConfirm` for async actions: the caller owns `open`,
 * so the dialog stays open with a loading confirm until the mutation succeeds.
 */
export const ConfirmDialog = ({
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  loading,
  destructive,
  layout,
  cancelDisabled,
  confirmProps,
  extraActions,
  separateCancel,
  children,
  ...dialogProps
}: ConfirmDialogProps) => (
  <Dialog.Root {...dialogProps}>
    <Dialog.Backdrop />
    <Dialog.Positioner>
      <Dialog.Content>
        <ConfirmDialogContent
          {...{ title, description, confirmText, cancelText, onConfirm, onCancel, loading, destructive, layout }}
          {...{ cancelDisabled, confirmProps, extraActions, separateCancel }}
        >
          {children}
        </ConfirmDialogContent>
      </Dialog.Content>
    </Dialog.Positioner>
  </Dialog.Root>
)

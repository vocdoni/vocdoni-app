import { Button, Dialog, DialogRootProps, Text } from '@chakra-ui/react'
import * as React from 'react'
import { useTranslation } from 'react-i18next'

export interface ConfirmDialogProps extends Omit<DialogRootProps, 'children'> {
  title: React.ReactNode
  description?: React.ReactNode
  confirmText?: React.ReactNode
  cancelText?: React.ReactNode
  onConfirm: () => void
  /** Shows a spinner on the confirm button. Does not auto-close — the caller controls `open`. */
  loading?: boolean
  /** Red confirm button for destructive actions (default). Set false for a neutral confirm. */
  destructive?: boolean
  /** Optional extra body content rendered below the description. */
  children?: React.ReactNode
}

/**
 * Declarative confirm/destructive-action dialog with a built-in footer (Cancel + confirm),
 * so consumers stop hand-rolling the identical `<Flex justifyContent='flex-end'>` + outline
 * Cancel + red confirm button that every `DeleteModal` call site repeats.
 *
 * Use this (not `useConfirm`) when the confirmed action is async: `useConfirm` closes the
 * dialog the moment the user clicks, before the mutation runs. Here the caller controls
 * `open` and closes it in `onSuccess`, so the confirm button can show `loading` state and
 * the dialog stays in context if the operation fails.
 */
export const ConfirmDialog = ({
  title,
  description,
  confirmText,
  cancelText,
  onConfirm,
  loading = false,
  destructive = true,
  children,
  ...dialogProps
}: ConfirmDialogProps) => {
  const { t } = useTranslation()

  return (
    <Dialog.Root placement='center' {...dialogProps}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header pb={0}>
            <Dialog.Title>{title}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            {description && <Text variant='subheader'>{description}</Text>}
            {children}
          </Dialog.Body>
          <Dialog.Footer justifyContent='flex-end' gap={2}>
            <Dialog.CloseTrigger asChild>
              <Button variant='outline'>{cancelText || t('actions.cancel', { defaultValue: 'Cancel' })}</Button>
            </Dialog.CloseTrigger>
            <Button colorPalette={destructive ? 'red' : undefined} loading={loading} onClick={onConfirm}>
              {confirmText || t('actions.confirm', { defaultValue: 'Confirm' })}
            </Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

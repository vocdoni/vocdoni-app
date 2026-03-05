import { Button, CloseButton, Dialog, Text, useSlotRecipe } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import { useConfirm } from '../Confirm/useConfirm'

export type ConfirmActionModalProps = {
  title: string
  description: string
  confirm?: string
  cancel?: string
}

export const ConfirmActionModal = ({ title, description, confirm, cancel }: ConfirmActionModalProps) => {
  const modalRecipe = useSlotRecipe({ key: 'ConfirmModal' })
  const styles = modalRecipe()
  const { cancel: cancelFn, proceed } = useConfirm()
  const { t } = useTranslation()

  const confirmLabel = confirm ?? t('confirm.confirm')
  const cancelLabel = cancel ?? t('confirm.cancel')

  return (
    <>
      <Dialog.Header css={styles.header}>{title}</Dialog.Header>
      <Dialog.CloseTrigger asChild>
        <CloseButton css={styles.close} />
      </Dialog.CloseTrigger>
      <Dialog.Body css={styles.body}>
        <Text>{description}</Text>
      </Dialog.Body>
      <Dialog.Footer css={styles.footer}>
        <Button onClick={cancelFn ?? undefined} variant='ghost' css={styles.cancel}>
          {cancelLabel}
        </Button>
        <Button onClick={proceed ?? undefined} css={styles.confirm}>
          {confirmLabel}
        </Button>
      </Dialog.Footer>
    </>
  )
}

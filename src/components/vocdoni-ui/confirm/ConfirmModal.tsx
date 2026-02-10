import { Dialog, useSlotRecipe } from '@chakra-ui/react'
import { useConfirm } from './useConfirm'

export const ConfirmModal = () => {
  const recipe = useSlotRecipe({ key: 'ConfirmModal' })
  const styles = recipe()
  const { prompt, isOpen, cancel } = useConfirm()

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && cancel?.()}>
      <Dialog.Backdrop css={styles.overlay} />
      <Dialog.Positioner>
        <Dialog.Content css={styles.content}>{prompt}</Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

import { useSlotRecipe } from '@chakra-ui/react'
import { Modal, ModalContent, ModalOverlay } from '~shared/Modal/Modal'
import { useConfirm } from './useConfirm'

export const ConfirmModal = () => {
  const recipe = useSlotRecipe({ key: 'ConfirmModal' })
  const styles = recipe()
  const { prompt, isOpen, cancel } = useConfirm()

  return (
    <Modal isOpen={isOpen} onClose={cancel}>
      <ModalOverlay css={styles.overlay} />
      <ModalContent css={styles.content}>{prompt}</ModalContent>
    </Modal>
  )
}

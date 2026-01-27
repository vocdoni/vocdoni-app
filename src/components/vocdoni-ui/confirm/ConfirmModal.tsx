import { Modal, ModalContent, ModalOverlay, useMultiStyleConfig } from '@chakra-ui/react'
import { useConfirm } from './useConfirm'

export const ConfirmModal = () => {
  const styles = useMultiStyleConfig('ConfirmModal')
  const { prompt, isOpen, cancel } = useConfirm()

  return (
    <Modal isOpen={isOpen} onClose={cancel}>
      <ModalOverlay sx={styles.overlay} />
      <ModalContent sx={styles.content}>{prompt}</ModalContent>
    </Modal>
  )
}

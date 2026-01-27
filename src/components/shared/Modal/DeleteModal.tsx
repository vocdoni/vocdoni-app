import { Box, Flex, Heading } from '@chakra-ui/react'
import { Modal, ModalBody, ModalContent, ModalHeader, ModalOverlay, type ModalProps } from '~shared/Modal/Modal'

export type DeleteModalProps = {
  title: string | React.ReactNode
  subtitle: string | React.ReactNode
  children: React.ReactNode
} & ModalProps

const DeleteModal = ({ title, subtitle, children, ...modalProps }: DeleteModalProps) => {
  return (
    <Modal size='lg' {...modalProps}>
      <ModalOverlay />
      <ModalContent p={5}>
        <ModalHeader p={0}>
          <Flex flexDirection='column' gap={3}>
            <Heading size='sm'>{title}</Heading>
            <Box fontSize='sm' color='texts.subtle'>
              {subtitle}
            </Box>
          </Flex>
        </ModalHeader>
        <ModalBody p={0}>{children}</ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default DeleteModal

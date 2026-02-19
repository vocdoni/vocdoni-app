import { Dialog, DialogRootProps, Text } from '@chakra-ui/react'

export type DeleteModalProps = {
  title: string | React.ReactNode
  subtitle: string | React.ReactNode
  children: React.ReactNode
} & DialogRootProps

const DeleteModal = ({ title, subtitle, children, ...dialogProps }: DeleteModalProps) => {
  return (
    <Dialog.Root placement='center' {...dialogProps}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header pb={0}>
            <Dialog.Title>{title}</Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>
            <Text variant='subheader'>{subtitle}</Text>
            {children}
          </Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

export default DeleteModal

import { Box, Dialog, DialogRootProps, Heading } from '@chakra-ui/react'

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
          <Dialog.Header>
            <Dialog.Title>
              <Heading size='sm'>{title}</Heading>
              <Box fontSize='sm' color='texts.subtle'>
                {subtitle}
              </Box>
            </Dialog.Title>
          </Dialog.Header>
          <Dialog.Body>{children}</Dialog.Body>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  )
}

export default DeleteModal

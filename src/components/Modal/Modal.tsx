import {
  CloseButton,
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPositioner,
  DialogRoot,
  type DialogRootProps,
} from '@chakra-ui/react'
import { PropsWithChildren, RefObject } from 'react'

export type ModalProps = Omit<DialogRootProps, 'open' | 'onOpenChange'> & {
  isOpen?: boolean
  onClose?: () => void
  closeOnOverlayClick?: boolean
  closeOnEsc?: boolean
  blockScrollOnMount?: boolean
  returnFocusOnClose?: boolean
  initialFocusRef?: RefObject<HTMLElement>
  finalFocusRef?: RefObject<HTMLElement>
  isCentered?: boolean
}

export const Modal = ({
  isOpen,
  onClose,
  closeOnOverlayClick,
  closeOnEsc,
  blockScrollOnMount,
  returnFocusOnClose,
  initialFocusRef,
  finalFocusRef,
  isCentered,
  children,
  ...rest
}: PropsWithChildren<ModalProps>) => (
  <DialogRoot
    open={isOpen}
    onOpenChange={(details) => {
      if (!details.open) {
        onClose?.()
      }
    }}
    closeOnInteractOutside={closeOnOverlayClick}
    closeOnEscape={closeOnEsc}
    preventScroll={blockScrollOnMount}
    restoreFocus={returnFocusOnClose}
    initialFocusEl={initialFocusRef ? () => initialFocusRef.current : undefined}
    finalFocusEl={finalFocusRef ? () => finalFocusRef.current : undefined}
    placement={isCentered ? 'center' : undefined}
    {...rest}
  >
    {children}
  </DialogRoot>
)

export const ModalOverlay = DialogBackdrop

export const ModalContent = ({ children, ...props }: PropsWithChildren<React.ComponentProps<typeof DialogContent>>) => (
  <DialogPositioner>
    <DialogContent {...props}>{children}</DialogContent>
  </DialogPositioner>
)

export const ModalHeader = (props: React.ComponentProps<typeof DialogHeader>) => <DialogHeader {...props} />

export const ModalBody = (props: React.ComponentProps<typeof DialogBody>) => <DialogBody {...props} />

export const ModalFooter = (props: React.ComponentProps<typeof DialogFooter>) => <DialogFooter {...props} />

export const ModalCloseButton = (props: React.ComponentProps<typeof CloseButton>) => (
  <DialogCloseTrigger asChild>
    <CloseButton {...props} />
  </DialogCloseTrigger>
)

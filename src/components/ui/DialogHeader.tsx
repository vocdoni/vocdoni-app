import {
  Dialog,
  type DialogDescriptionProps,
  type DialogHeaderProps as ChakraDialogHeaderProps,
  type DialogTitleProps,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'

export interface DialogHeaderProps extends Omit<ChakraDialogHeaderProps, 'title'> {
  title: ReactNode
  description?: ReactNode
  titleProps?: DialogTitleProps
  descriptionProps?: DialogDescriptionProps
}

/**
 * A dialog's title and muted description. `Dialog.Title` names the dialog for screen readers; anything
 * else in the header (an illustration) goes in `children`, after them.
 */
export const DialogHeader = ({
  title,
  description,
  titleProps,
  descriptionProps,
  children,
  ...headerProps
}: DialogHeaderProps) => (
  <Dialog.Header {...headerProps}>
    <Dialog.Title {...titleProps}>{title}</Dialog.Title>
    {description && <Dialog.Description {...descriptionProps}>{description}</Dialog.Description>}
    {children}
  </Dialog.Header>
)

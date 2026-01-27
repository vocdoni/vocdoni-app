import { Button, type ButtonProps } from '@chakra-ui/react'

export type EllipsisButtonProps = ButtonProps & {
  gotoPage: (page: number) => void
}

export const EllipsisButton = ({ gotoPage, ...rest }: EllipsisButtonProps) => (
  <Button onClick={() => gotoPage(1)} {...rest}>
    ...
  </Button>
)

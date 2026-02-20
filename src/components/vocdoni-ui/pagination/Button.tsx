import { Button, type ButtonProps, useRecipe } from '@chakra-ui/react'
import { forwardRef } from 'react'

export const PaginationButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const recipe = useRecipe({ key: 'PaginationButton' })
  const styles = recipe()
  return <Button ref={ref} css={styles} {...props} />
})

PaginationButton.displayName = 'PaginationButton'

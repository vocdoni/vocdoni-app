import { defineSlotRecipe } from '@chakra-ui/react'
import { ellipsisButtonAnatomy } from '~components/vocdoni-ui/pagination/anatomy'

const sharedButtonInputStyle = { py: 4, px: 3, h: '8', minW: '8', fontSize: 'sm' }
const sizes = {
  xs: {
    button: sharedButtonInputStyle,
    input: sharedButtonInputStyle,
  },
}

export const EllipsisButton = defineSlotRecipe({
  slots: ellipsisButtonAnatomy,
  variants: {
    size: sizes,
  },
  defaultVariants: {
    size: 'xs',
  },
})

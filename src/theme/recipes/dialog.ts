import { dialogAnatomy as parts } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const baseStyle = {
  content: {
    bg: 'surface.overlay',
    boxShadow: 'shadow.overlay',
  },
}

export const Dialog = defineSlotRecipe({
  slots: parts.keys(),
  base: baseStyle,
})

import { popoverAnatomy as parts } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const baseStyle = {
  content: {
    bg: 'bg',
    padding: 1,
    borderColor: 'border',
  },
  header: {
    p: 0,
  },
  body: {
    p: 0,
  },
  footer: {
    p: 0,
  },
}

export const Popover = defineSlotRecipe({
  slots: parts.keys(),
  base: baseStyle,
})

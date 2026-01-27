import { progressAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

export const Progress = defineSlotRecipe({
  slots: progressAnatomy.keys(),
  variants: {
    size: {
      xs: {},
      sm: {},
      md: {},
      lg: {},
    },
  },
  defaultVariants: {
    colorPalette: 'black',
    size: 'xs',
  },
})

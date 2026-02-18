import { defineSlotRecipe } from '@chakra-ui/react'
import { checkboxAnatomy } from '@chakra-ui/react/anatomy'

export const Checkbox = defineSlotRecipe({
  slots: checkboxAnatomy.keys(),
  base: {
    label: {
      fontWeight: 'normal',
    },
  },
  defaultVariants: {
    colorPalette: 'brand',
  },
})

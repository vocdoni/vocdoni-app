import { stepsAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const baseStyle = {
  separator: {
    display: { base: 'none', lg: 'inline-block' },
    mt: { lg: 2 },
  },
  item: {
    '&:first-of-type': {
      h: { lg: '600px' },
      my: { lg: 10 },
    },
  },
  title: {
    mt: 1.5,
    fontSize: 'xs',
    display: { base: 'none', lg: 'block' },
  },
}

export const Stepper = defineSlotRecipe({
  slots: stepsAnatomy.keys(),
  base: baseStyle,
  defaultVariants: {
    colorPalette: 'brand',
  },
})

import { tooltipAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe, defineStyle } from '@chakra-ui/react'

// Chakra's inverted tooltip (`bg.inverted` on `fg.inverted`, `xs` text), kept flat: no ring, no shadow.
const baseStyle = defineStyle({
  boxShadow: '[none]',
  borderRadius: 'sm',
  px: '2',
  py: '1',
})

export const Tooltip = defineSlotRecipe({
  slots: tooltipAnatomy.keys(),
  base: {
    content: baseStyle,
  },
})

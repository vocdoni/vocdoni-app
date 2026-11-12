import { tooltipAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe, defineStyle } from '@chakra-ui/react'

const baseStyle = defineStyle({
  boxShadow: 'shadow.raised.tooltip',
  border: 'sm',
  borderColor: 'border',
  px: '2',
  py: '1',
  bgColor: 'surface.raised.tooltip',
  color: 'fg',
})

export const Tooltip = defineSlotRecipe({
  slots: tooltipAnatomy.keys(),
  base: {
    content: baseStyle,
  },
})

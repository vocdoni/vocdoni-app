import { tooltipAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const baseStyle = {
  boxShadow: 'xs',
  border: '1px solid',
  borderColor: 'border',
  px: 2,
  py: 1,
  bgColor: 'bg.panel',
  color: 'fg',
}

export const Tooltip = defineSlotRecipe({
  slots: tooltipAnatomy.keys(),
  base: {
    content: baseStyle,
  },
})

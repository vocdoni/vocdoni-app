import { tooltipAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const baseStyle = {
  boxShadow: '0 1px 2px 0 rgb(0 0 0/0.05)',
  border: '1px solid rgb(228, 228, 231)',
  px: 2,
  py: 1,
  bgColor: 'white',
  color: 'black',
  _dark: {
    bgColor: 'gray.700',
    border: '1px solid rgb(71, 71, 71)',
    color: 'white',
  },
}

export const Tooltip = defineSlotRecipe({
  slots: tooltipAnatomy.keys(),
  base: {
    content: baseStyle,
  },
})

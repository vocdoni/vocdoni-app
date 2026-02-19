import { defineSlotRecipe } from '@chakra-ui/react'
import { switchAnatomy } from '@chakra-ui/react/anatomy'

const baseStyle = {
  control: {
    _focusVisible: {
      _dark: {
        boxShadow: '0 0 0 2px darkgray',
      },
    },
  },
  thumb: {
    _dark: {
      bg: 'colorPalette.600',
    },
  },
}

export const Switch = defineSlotRecipe({
  slots: switchAnatomy.keys(),
  base: baseStyle,
})

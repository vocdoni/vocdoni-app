import { menuAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const baseStyle = {
  content: {
    p: 1,
    borderRadius: 'sm',
    boxShadow: 'shadow.raised',
    bg: 'surface.raised',
  },
  item: {
    bg: 'surface.raised',
    _selected: {
      bg: 'gray.100',
      color: 'black',
      _dark: {
        bg: 'ink.700',
        color: 'white',
      },
    },
    _focus: {
      bg: 'gray.100',
      color: 'black',
      _dark: {
        bg: 'ink.800',
        color: 'white',
      },
    },
  },

  separator: {
    m: 0,
  },
}

export const Menu = defineSlotRecipe({
  slots: menuAnatomy.keys(),
  base: baseStyle,
})

import { menuAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const baseStyle = {
  content: {
    p: 1,
    borderRadius: 'sm',
    boxShadow: 'md',
    bg: 'chakra.body.bg',
  },
  item: {
    bg: 'chakra.body.bg',
    _selected: {
      bg: 'gray.100',
      color: 'black',
      _dark: {
        bg: 'brand.700',
        color: 'white',
      },
    },
    _focus: {
      bg: 'gray.100',
      color: 'black',
      _dark: {
        bg: 'brand.800',
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

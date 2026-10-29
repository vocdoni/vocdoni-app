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
      bg: 'state.selected.bg',
      color: 'state.selected.fg',
    },
    _focus: {
      bg: 'state.hover.bg',
      color: 'state.hover.fg',
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

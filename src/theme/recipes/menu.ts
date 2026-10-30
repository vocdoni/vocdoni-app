import { menuAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'

const baseStyle = {
  content: {
    p: '1',
    borderRadius: 'sm',
    boxShadow: 'shadow.raised',
    bg: 'surface.raised',
  },
  item: {
    bg: 'surface.raised',
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
    m: '[0]',
  },
} satisfies Partial<Record<string, SystemStyleObject>>

export const Menu = defineSlotRecipe({
  slots: menuAnatomy.keys(),
  base: baseStyle,
})

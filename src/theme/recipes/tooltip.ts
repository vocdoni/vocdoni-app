import { tooltipAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe, defineStyle } from '@chakra-ui/react'

// Chakra's inverted tooltip (`bg.inverted` on `fg.inverted`, `xs` text), kept flat: no ring, no shadow.
const baseStyle = defineStyle({
  boxShadow: '[none]',
  borderRadius: 'sm',
  px: '2',
  py: '1',
  // In dark the tooltip sits on the raised grey with a ring, like a menu, instead of a light inverted box. The
  // arrow paints `--tooltip-bg`, so the grey goes there, not on `bg`, or the arrow keeps the light inverted colour.
  _dark: { '--tooltip-bg': 'colors.surface.raised', color: 'fg', boxShadow: 'shadow.control' },
})

export const Tooltip = defineSlotRecipe({
  slots: tooltipAnatomy.keys(),
  base: {
    content: baseStyle,
  },
})

import { drawerAnatomy as parts } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const baseStyle = {
  content: {
    bg: 'dashboard.menu',
  },
}

export const Drawer = defineSlotRecipe({
  slots: parts.keys(),
  base: baseStyle,
})

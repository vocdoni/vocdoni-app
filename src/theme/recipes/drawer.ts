import { drawerAnatomy as parts } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const baseStyle = {
  content: {
    bg: 'surface.overlay.drawer',
    boxShadow: 'shadow.overlay',
  },
}

export const Drawer = defineSlotRecipe({
  slots: parts.keys(),
  base: baseStyle,
})

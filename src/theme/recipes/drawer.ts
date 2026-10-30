import { drawerAnatomy as parts } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

export const Drawer = defineSlotRecipe({
  slots: parts.keys(),
  base: {
    content: {
      boxShadow: 'shadow.overlay',
    },
  },
  // `navigation` is the mobile dashboard menu; `panel` paints like a dialog.
  variants: {
    variant: {
      navigation: { content: { bg: 'surface.overlay.drawer' } },
      panel: { content: { bg: 'surface.overlay' } },
    },
  },
  defaultVariants: { variant: 'panel' },
})

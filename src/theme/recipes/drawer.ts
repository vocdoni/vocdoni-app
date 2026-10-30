import { drawerAnatomy as parts } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

export const Drawer = defineSlotRecipe({
  slots: parts.keys(),
  base: {
    backdrop: {
      bg: 'scrim.strong',
    },
    content: {
      boxShadow: 'shadow.overlay',
    },
  },
  // `sidebar` is the mobile dashboard menu; `panel` paints like a dialog.
  variants: {
    variant: {
      sidebar: { content: { bg: 'surface.overlay.drawer' } },
      panel: { content: { bg: 'surface.overlay' } },
    },
  },
  defaultVariants: { variant: 'panel' },
})

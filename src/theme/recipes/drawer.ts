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
  // `navigation` is the mobile dashboard menu; `panel` paints like a dialog and is ui/Drawer's shell.
  variants: {
    variant: {
      navigation: { content: { bg: 'surface.overlay.drawer' } },
      // The header stacks the title over its description; the end padding keeps both clear of the close button.
      panel: {
        content: { bg: 'surface.overlay' },
        header: { flexDirection: 'column', alignItems: 'flex-start', pe: '12' },
        description: { textStyle: 'body-sm', color: 'fg.muted' },
      },
    },
  },
  defaultVariants: { variant: 'panel' },
})

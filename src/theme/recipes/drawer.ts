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
    title: {
      textStyle: 'xl',
      fontWeight: 'semibold',
      letterSpacing: 'tight',
    },
  },
  // `sidebar` is the mobile dashboard menu; `panel` paints like a dialog and is ui/Drawer's shell; `sheet` is a bottom sheet.
  variants: {
    variant: {
      sidebar: { content: { bg: 'surface.overlay.drawer' } },
      // A bottom sheet (ui/ResponsiveMenu on a phone): rounded on top, clear of the home indicator. Use with
      // `placement='bottom'`.
      sheet: {
        content: {
          bg: 'surface.overlay',
          borderTopRadius: 'xl',
          pb: '[env(safe-area-inset-bottom)]',
        },
        header: { flexDirection: 'column', alignItems: 'flex-start' },
      },
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

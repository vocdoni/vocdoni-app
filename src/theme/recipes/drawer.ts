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
  // `sidebar` is the dashboard's navigation below `lg`; `panel` paints like a dialog and is ui/Drawer's shell; `sheet` is a
  // bottom sheet.
  variants: {
    variant: {
      // Use with `placement='start'`; its width is the guide's drawer, whatever the size.
      sidebar: { content: { bg: 'surface.overlay.drawer', maxW: 'dashboard.drawer' } },
      // A bottom sheet (ui/ResponsiveMenu on a phone): rounded on top, clear of the home indicator. Use with
      // `placement='bottom'`.
      sheet: {
        content: {
          bg: 'surface.overlay',
          borderTopRadius: 'xl',
          pb: '[env(safe-area-inset-bottom)]',
        },
        header: { flexDirection: 'column', alignItems: 'flex-start', gap: '0' },
        // The name of what the actions act on, over its state.
        title: { textStyle: 'lg', fontWeight: 'semibold', letterSpacing: 'heading.item' },
        description: { textStyle: 'md', color: 'fg.subtle' },
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

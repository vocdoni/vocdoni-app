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
      // A bottom sheet (ui/ResponsiveMenu on a phone), as the boards draw it: rounded on top, a grab handle, the
      // title over a muted line, then the rows (button `sheet-row`, each under a rule) and the close button
      // (`sheet-close`); clear of the home indicator. Use with `placement='bottom'`.
      sheet: {
        backdrop: { bg: 'scrim.sheet' },
        content: {
          bg: 'surface.overlay',
          borderTopRadius: 'xl',
          px: '4',
          pt: '2',
          pb: '[calc({spacing.6} + env(safe-area-inset-bottom))]',
        },
        header: {
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '0',
          p: '0',
          _before: {
            content: '""',
            alignSelf: 'center',
            w: '9',
            h: '1',
            mb: '3',
            borderRadius: 'bar',
            bg: 'bg.track',
          },
        },
        // The name of what the actions act on, over its state.
        // The base's `tight` tracking would win over the text style's: restate the sheet's.
        title: { textStyle: 'dialog-title', letterSpacing: 'heading.item', color: 'fg' },
        description: { fontSize: 'md', lineHeight: '[1.45]', color: 'fg.subtle', pb: '2' },
        body: { display: 'flex', flexDirection: 'column', p: '0' },
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

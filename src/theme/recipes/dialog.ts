import { dialogAnatomy as parts } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'

const baseStyle = {
  backdrop: {
    bg: 'scrim.strong',
  },
  content: {
    bg: 'surface.overlay',
    borderRadius: 'l3',
    boxShadow: 'shadow.overlay',
  },
  title: {
    textStyle: 'xl',
    fontWeight: 'semibold',
    letterSpacing: 'tight',
  },
  // ui/DialogHeader: the title over its muted description.
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  description: {
    color: 'fg.muted',
  },
} satisfies Partial<Record<string, SystemStyleObject>>

export const Dialog = defineSlotRecipe({
  slots: parts.keys(),
  base: baseStyle,
  // From `md` every dialog sits in the middle of the screen; a taller one still scrolls from its top. Below `md` it
  // is a bottom sheet: pinned to the bottom edge, full width, rounded on top and clear of the home indicator.
  // Chakra's placement variants stay as they are: naming `center` lets it be the default.
  variants: {
    placement: {
      center: {
        positioner: { mdDown: { alignItems: 'flex-end' } },
        content: {
          mdDown: {
            '--dialog-base-margin': '0',
            mx: '0',
            maxW: 'full',
            borderBottomRadius: 'none',
            borderTopRadius: 'xl',
            pb: '[env(safe-area-inset-bottom)]',
          },
        },
      },
    },
  },
  defaultVariants: { placement: 'center' },
})

import { dialogAnatomy as parts } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'

const baseStyle = {
  backdrop: {
    bg: 'scrim.strong',
  },
  content: {
    bg: 'surface.overlay',
    boxShadow: 'shadow.overlay',
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
  // Every dialog sits in the middle of the screen; a taller one still scrolls from its top.
  // Chakra's placement variants stay as they are: naming `center` lets it be the default.
  variants: { placement: { center: {} } },
  defaultVariants: { placement: 'center' },
})

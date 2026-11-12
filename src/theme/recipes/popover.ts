import { popoverAnatomy as parts } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'

const baseStyle = {
  content: {
    bg: 'surface.raised',
    boxShadow: 'shadow.raised.popover',
    padding: '1',
    borderColor: 'border',
  },
  header: {
    p: '[0]',
  },
  body: {
    p: '[0]',
  },
  footer: {
    p: '[0]',
  },
} satisfies Partial<Record<string, SystemStyleObject>>

export const Popover = defineSlotRecipe({
  slots: parts.keys(),
  base: baseStyle,
})

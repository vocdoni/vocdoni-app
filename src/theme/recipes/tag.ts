import { defineSlotRecipe, type SystemStyleObject } from '@chakra-ui/react'
import { tagAnatomy } from '@chakra-ui/react/anatomy'

const baseStyle = {
  root: {
    width: 'fit',
    display: 'flex',
    justifyContent: 'center',
    borderRadius: 'sm',
    fontWeight: 'bold',
    py: '1',
    px: '3',
  },
  // Centre icons on their own box: inside a heading they would sit on its tall line instead.
  startElement: { display: 'flex', alignItems: 'center' },
  endElement: { display: 'flex', alignItems: 'center' },
} satisfies Partial<Record<string, SystemStyleObject>>

export const Tag = defineSlotRecipe({
  slots: tagAnatomy.keys(),
  base: baseStyle,
})

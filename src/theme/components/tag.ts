import { tagAnatomy } from '@chakra-ui/react/anatomy'
import { defineSlotRecipe } from '@chakra-ui/react'

const baseStyle = {
  root: {
    width: 'fit-content',
    display: 'flex',
    justifyContent: 'center',
    borderRadius: 'sm',
    fontWeight: 'bold',
    py: 1,
    px: 3,
  },
}

export const Tag = defineSlotRecipe({
  slots: tagAnatomy.keys(),
  base: baseStyle,
})

import { defineSlotRecipe } from '@chakra-ui/react'
import { tableAnatomy } from '@chakra-ui/react/anatomy'

export const Table = defineSlotRecipe({
  slots: tableAnatomy.keys(),
  base: {
    caption: {
      p: 4,
    },
  },
})

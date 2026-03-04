import { defineSlotRecipe } from '@chakra-ui/react'
import { listAnatomy } from '@chakra-ui/react/anatomy'

export const listSlotRecipe = defineSlotRecipe({
  slots: listAnatomy.keys(),
  base: {
    root: {
      marginBottom: 4,
    },
  },
  variants: {
    variant: {
      marker: {
        root: {
          listStylePosition: 'inside',
        },
      },
    },
  },
})

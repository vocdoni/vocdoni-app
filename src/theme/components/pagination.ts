import { defineSlotRecipe } from '@chakra-ui/react'
import { paginationAnatomy } from '~components/vocdoni-ui/pagination/anatomy'

export const Pagination = defineSlotRecipe({
  slots: paginationAnatomy,
  base: {
    wrapper: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'end',
    },
    totalResults: {
      display: 'none',
    },
  },
})

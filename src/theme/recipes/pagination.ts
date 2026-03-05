import { defineRecipe, defineSlotRecipe } from '@chakra-ui/react'
import { paginationAnatomy } from '~theme/react-components/anatomy/pagination'

export const Pagination = defineSlotRecipe({
  slots: paginationAnatomy,
  base: {
    wrapper: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'end',
      gap: 2,
    },
    totalResults: {
      display: 'none',
    },
  },
})

export const PaginationButton = defineRecipe({
  base: {
    _active: {
      fontWeight: 'bolder',
      borderColor: 'border.pagination.active',
    },
  },
})

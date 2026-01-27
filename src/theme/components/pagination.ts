import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { paginationAnatomy } from '~components/vocdoni-ui'

const { defineMultiStyleConfig: defineVoteWeightTipStyle, definePartsStyle: defineVoteWeightParts } =
  createMultiStyleConfigHelpers(paginationAnatomy)

export const Pagination = defineVoteWeightTipStyle({
  baseStyle: defineVoteWeightParts({
    wrapper: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'end',
    },
    totalResults: {
      display: 'none',
    },
  }),
})

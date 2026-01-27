import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { voteWeightAnatomy } from '~components/vocdoni-ui'

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(voteWeightAnatomy)

export const VoteWeight = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    wrapper: {
      display: 'flex',
      gap: 2,
    },
    weight: {
      fontWeight: 'bold',
    },
  }),
})

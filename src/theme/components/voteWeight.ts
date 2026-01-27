import { defineSlotRecipe } from '@chakra-ui/react'
import { voteWeightAnatomy } from '~components/vocdoni-ui/theming/anatomy'

export const VoteWeight = defineSlotRecipe({
  slots: voteWeightAnatomy,
  base: {
    wrapper: {
      display: 'flex',
      gap: 2,
    },
    weight: {
      fontWeight: 'bold',
    },
  },
})

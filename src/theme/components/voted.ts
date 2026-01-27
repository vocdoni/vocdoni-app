import { defineSlotRecipe } from '@chakra-ui/react'
import { votedAnatomy } from '~components/vocdoni-ui/theming/anatomy'

const baseStyle = {
  link: {
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
  },
}

export const Voted = defineSlotRecipe({
  slots: votedAnatomy,
  base: baseStyle,
})

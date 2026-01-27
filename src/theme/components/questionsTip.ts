import { defineSlotRecipe } from '@chakra-ui/react'
import { questionTipAnatomy } from '~components/vocdoni-ui/theming/anatomy'

export const QuestionsTip = defineSlotRecipe({
  slots: questionTipAnatomy,
  base: {
    wrapper: {
      mt: 4,
      w: 'full',
      display: 'flex',
      justifyContent: 'end',
      alignItems: 'end',
    },
    text: {
      fontSize: 'sm',
      fontWeight: 'semibold',
    },
  },
})

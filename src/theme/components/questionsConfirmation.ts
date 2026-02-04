import { defineSlotRecipe } from '@chakra-ui/react'
import { questionsConfirmationAnatomy } from '~components/vocdoni-ui/theming/anatomy'

const baseStyle = {
  question: {
    '& + &': {
      mt: 4,
    },
  },
  description: {
    color: 'texts.subtle',
    fontSize: 'sm',
    whiteSpace: 'pre-line',
    mb: 4,
  },
  title: {
    fontWeight: 'bold',
  },
}

export const QuestionsConfirmation = defineSlotRecipe({
  slots: questionsConfirmationAnatomy,
  base: baseStyle,
})

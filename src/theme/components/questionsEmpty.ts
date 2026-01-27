import { defineSlotRecipe } from '@chakra-ui/react'
import { questionsEmptyAnatomy } from '~components/vocdoni-ui/theming/anatomy'

export const QuestionsEmpty = defineSlotRecipe({
  slots: questionsEmptyAnatomy,
  base: {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 3,
      py: 6,
    },
    icon: {
      boxSize: 6,
    },
    description: {
      fontSize: 'sm',
      color: 'texts.subtle',
      textAlign: 'center',
    },
  },
})

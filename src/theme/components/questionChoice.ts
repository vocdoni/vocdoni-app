import { defineSlotRecipe } from '@chakra-ui/react'
import { questionChoiceAnatomy } from '~components/vocdoni-ui/theming/anatomy'

const baseStyle = {
  wrapper: {
    gap: 2,
    height: '100%',
  },

  skeleton: {
    w: '100%',
    aspectRatio: '4 / 3',
  },

  image: {
    w: '100%',
    h: '100%',
    borderTopRadius: 'lg',
    objectFit: 'cover',
    objectPosition: 'center',
  },

  label: {
    fontWeight: 'semibold',
    wordBreak: 'break-word',
  },

  description: {
    wordBreak: 'break-word',
  },
}

export const QuestionChoice = defineSlotRecipe({
  slots: questionChoiceAnatomy,
  base: baseStyle,
})

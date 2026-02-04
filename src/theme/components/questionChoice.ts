import { defineSlotRecipe } from '@chakra-ui/react'
import { questionChoiceAnatomy } from '~components/vocdoni-ui/theming/anatomy'

const baseStyle = {
  skeleton: {
    w: '100%',
    h: '150px',
  },

  image: {
    w: '100%',
    h: '100%',
    borderTopRadius: 'lg',
    objectFit: 'cover',
    objectPosition: 'center',
  },

  label: {
    '.chakra-skeleton + &': {
      wordBreak: 'break-word',
      fontWeight: 'semibold',
      mt: 4,
      px: 4,
      mb: 4,
    },
  },

  description: {
    '.chakra-skeleton ~ &': {
      px: 4,
      mb: 4,
    },
  },
}

export const QuestionChoice = defineSlotRecipe({
  slots: questionChoiceAnatomy,
  base: baseStyle,
})

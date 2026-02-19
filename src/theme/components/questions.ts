import { defineSlotRecipe } from '@chakra-ui/react'
import { questionsAnatomy } from '~components/vocdoni-ui/theming/anatomy'

const baseStyle = {
  title: {
    display: 'block',
    textAlign: 'start',
    lineHeight: 1.3,
    fontSize: 'lg',
    fontWeight: 'semibold',
    mb: 6,
  },

  error: {
    display: 'flex',
    justifyContent: 'center',
  },
}

export const ElectionQuestions = defineSlotRecipe({
  slots: questionsAnatomy,
  base: baseStyle,
  variants: {
    layout: {
      list: {
        stack: {
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
        },
      },
      grid: {
        stack: {
          display: 'grid',
          gridTemplateColumns: {
            base: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 4,
        },
      },
    },
  },
  defaultVariants: {
    layout: 'list',
  },
})

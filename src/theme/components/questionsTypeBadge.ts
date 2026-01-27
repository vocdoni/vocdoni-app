import { defineSlotRecipe } from '@chakra-ui/react'
import { questionTypeBadgeAnatomy } from '~components/vocdoni-ui'

export const QuestionsTypeBadge = defineSlotRecipe({
  slots: questionTypeBadgeAnatomy,
  base: {
    box: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    title: {
      fontWeight: 'bold',
    },
    tooltip: {},
  },
})

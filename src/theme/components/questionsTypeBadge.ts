import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { questionTypeBadgeAnatomy } from '~components/vocdoni-ui'

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(questionTypeBadgeAnatomy)

export const QuestionsTypeBadge = defineMultiStyleConfig({
  baseStyle: definePartsStyle({
    box: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    },
    title: {
      fontWeight: 'bold',
    },
    tooltip: {},
  }),
})

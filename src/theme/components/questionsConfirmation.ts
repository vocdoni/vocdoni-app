import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { questionsConfirmationAnatomy } from '~components/vocdoni-ui'

const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(questionsConfirmationAnatomy)

const baseStyle = definePartsStyle({
  description: {
    color: 'texts.subtle',
    fontSize: 'sm',
    whiteSpace: 'pre-line',
  },
})

export const QuestionsConfirmation = defineMultiStyleConfig({
  baseStyle,
})

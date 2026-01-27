import { createMultiStyleConfigHelpers } from '@chakra-ui/react'
import { votedAnatomy } from '~components/vocdoni-ui'
const { defineMultiStyleConfig, definePartsStyle } = createMultiStyleConfigHelpers(votedAnatomy)

const baseStyle = definePartsStyle({
  link: {
    whiteSpace: 'normal',
    overflowWrap: 'anywhere',
  },
})

export const Voted = defineMultiStyleConfig({ baseStyle })

import { defineSlotRecipe } from '@chakra-ui/react'

// Merged over Chakra's toast. Its 0.8 description opacity leaves white on red.solid at 3.53:1 (needs 4.5:1).
export const Toast = defineSlotRecipe({
  slots: ['description'],
  base: {
    description: { opacity: '[1]' },
  },
})

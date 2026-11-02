import { defineSlotRecipe } from '@chakra-ui/react'

// Merged over Chakra's radioCard. Its 0.64 description opacity leaves fg.muted at 3.17:1 on white (needs 4.5:1).
export const RadioCard = defineSlotRecipe({
  slots: ['itemDescription'],
  base: {
    itemDescription: { opacity: '[1]' },
  },
})

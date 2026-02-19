import { defineSlotRecipe } from '@chakra-ui/react'
import { radioGroupAnatomy } from '@chakra-ui/react/anatomy'

export const radioGroup = defineSlotRecipe({
  slots: radioGroupAnatomy.keys(),
})

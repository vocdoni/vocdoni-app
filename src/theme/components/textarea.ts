import { defineRecipe } from '@chakra-ui/react'

const baseStyle = {
  fontSize: 'md',
  _placeholder: {
    color: 'input.placeholder',
    fontSize: 'md',
  },
}

export const Textarea = defineRecipe({
  base: baseStyle,
  variants: {
    variant: {
      borderless: {
        border: 'none',
        px: 0,
      },
    },
  },
})

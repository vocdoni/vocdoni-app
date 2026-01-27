import { defineRecipe } from '@chakra-ui/react'

const baseStyle = {
  fontSize: 'md',
  _placeholder: {
    color: 'input.placeholder',
    fontSize: 'md',
  },
}

const xxl = {
  fontSize: '2xl',
  _placeholder: {
    fontSize: '2xl',
  },
}

const sm = {
  paddingY: 2,
  paddingX: 3,
  borderRadius: 'sm',
}

const md = {
  paddingY: 2.5,
  paddingX: 3.5,
  borderRadius: 'sm',
}

export const Input = defineRecipe({
  base: baseStyle,
  variants: {
    size: {
      sm,
      md,
      '2xl': xxl,
    },
  },
})

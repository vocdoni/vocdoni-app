import { defineRecipe } from '@chakra-ui/react'

const baseStyle = {
  textStyle: 'md',
  _placeholder: {
    color: 'input.placeholder',
    textStyle: 'md',
  },
}

const xxl = {
  textStyle: '2xl',
  _placeholder: {
    textStyle: '2xl',
  },
}

const sm = {
  borderRadius: 'sm',
}

const md = {
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
    variant: {
      borderless: {
        border: 'none',
        px: 0,
        bg: 'transparent',
      },
    },
  },
})

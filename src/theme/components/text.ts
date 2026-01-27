import { defineRecipe } from '@chakra-ui/react'

const sizes = {
  xs: {
    fontSize: '12px',
    lineHeight: '18px',
  },
  sm: {
    fontSize: '14px',
    lineHeight: '20px',
  },
  md: {
    fontSize: '16px',
    lineHeight: '24px',
  },
  lg: {
    fontSize: '18px',
    lineHeight: '28px',
  },
  xl: {
    fontSize: '20px',
    lineHeight: '30px',
  },
  '2xl': {
    fontSize: '24px',
    lineHeight: 1.3,
  },
}

export const Text = defineRecipe({
  variants: {
    size: sizes,
    variant: {
      subheader: {
        color: 'texts.subtle',
        fontWeight: 'normal',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

import { defineRecipe } from '@chakra-ui/react'

const xs = {
  fontSize: 'xs',
  lineHeight: 'xs',
  px: 1,
  py: 0.5,
}

const sm = {
  fontSize: 'sm',
  lineHeight: 'sm',
  px: 2,
  py: 1,
}

const md = {
  fontSize: 'md',
  lineHeight: 'md',
  px: 3,
  py: 2,
}

const lg = {
  fontSize: 'lg',
  lineHeight: 'lg',
  px: 3,
  py: 2,
}

export const Badge = defineRecipe({
  variants: {
    size: { xs, sm, md, lg },
  },
  defaultVariants: { size: 'xs' },
})

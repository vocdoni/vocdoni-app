import { defineRecipe } from '@chakra-ui/react'

const baseStyle = {
  border: '1px solid',
  borderColor: 'colorPalette.200',
  textTransform: 'normal',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: 1,
  bg: 'colorPalette.100',
  '& svg': {
    boxSize: 3.5,
  },
}

const xs = {
  fontSize: 'xs',
  lineHeight: 'xs',
  px: 1,
  py: '3px',
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
  base: baseStyle,
  variants: {
    size: { xs, sm, md, lg },
  },
  defaultVariants: { size: 'xs' },
})

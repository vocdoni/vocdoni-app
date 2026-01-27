import { defineRecipe } from '@chakra-ui/react'

const baseStyle = {
  minW: 0,
  fontWeight: 'bold',
  borderRadius: 'sm',
  fontSize: 'sm',
}

const listmenu = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 'normal',
  borderRadius: 'sm',
  _active: {
    fontWeight: 'bold',
  },
  _hover: {
    bg: 'gray.100',
    _dark: {
      bg: 'gray.700',
    },
  },
}

const profilemenu = {
  w: 'full',
  px: 2,
  py: 1.5,
  borderRadius: 'xs',
  display: 'flex',
  justifyContent: 'start',
  bg: 'transparent',
  _hover: {
    bg: 'gray.100',
    _dark: {
      bg: 'gray.700',
    },
  },
}

const unstyled = {
  textAlign: 'left',
}

const navbar = {
  textAlign: 'left',
  fontWeight: 'semibold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'start',
  fontSize: 'md',
  h: 'fit-content',
}

const sizes = {
  lg: {
    py: 7,
    px: 6,
    h: '14',
    minW: '14',
    fontSize: 'md',
  },
  md: {
    py: 6,
    px: 5,
    h: '12',
    minW: '12',
    fontSize: 'sm',
  },
  sm: {
    py: 5,
    px: 4,
    h: '10',
    minW: '10',
    fontSize: 'sm',
  },
  xs: {
    py: 4,
    px: 3,
    h: '8',
    minW: '8',
    fontSize: 'sm',
  },
} as const

const outline = {
  borderWidth: '1px',
  borderColor: 'colorPalette.500',
  color: 'colorPalette.500',
  _hover: {
    bg: 'colorPalette.50',
  },
}

const env = (import.meta as any)?.env ?? (typeof process !== 'undefined' ? process.env : {})
const defaultPalette = env.BUTTON_COLOR_SCHEME || 'gray'

export const Button = defineRecipe({
  base: baseStyle,
  variants: {
    variant: {
      unstyled,
      navbar,
      listmenu,
      outline,
      profilemenu,
    },
    size: sizes,
  },
  defaultVariants: {
    colorPalette: defaultPalette as any,
    size: 'sm',
  },
})

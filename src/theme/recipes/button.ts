import { defineRecipe, defineStyle } from '@chakra-ui/react'

const baseStyle = defineStyle({
  minW: 0,
  fontWeight: 'bold',
  borderRadius: 'sm',
  fontSize: 'sm',
  // Tactile feedback on press. Named properties only (never `transition: all`).
  transitionProperty: 'transform, background-color, border-color, color, box-shadow',
  transitionDuration: 'fast',
  transitionTimingFunction: 'standard',
  _active: {
    transform: 'scale(0.96)',
  },
  _currentPage: {
    fontWeight: 'bold',
    backgroundColor: {
      _dark: 'colorPalette.800',
      _light: 'colorPalette.200',
    },
  },
  _selected: {
    fontWeight: 'bold',
  },
})

const listmenu = defineStyle({
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
})

const profilemenu = defineStyle({
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
})

const unstyled = defineStyle({
  textAlign: 'left',
})

const link = defineStyle({
  textAlign: 'left',
  w: 'auto',
  h: 'auto',
  p: 0,
  verticalAlign: 'unset',
  // Text-like button: scaling reads as a glitch, not a press.
  _active: {
    transform: 'none',
  },
  _hover: {
    textDecoration: 'underline',
  },
})

const navbar = defineStyle({
  textAlign: 'left',
  fontWeight: 'semibold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'start',
  fontSize: 'md',
  h: 'fit-content',
  // Text-like nav button: no press-scale.
  _active: {
    transform: 'none',
  },
})

export const Button = defineRecipe({
  base: baseStyle,
  variants: {
    variant: {
      unstyled,
      navbar,
      link,
      listmenu,
      profilemenu,
    },
  },
})

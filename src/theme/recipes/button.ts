import { defineRecipe, defineStyle } from '@chakra-ui/react'

const baseStyle = defineStyle({
  minW: 0,
  fontWeight: 'bold',
  borderRadius: 'sm',
  fontSize: 'sm',
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
    bg: 'var(--pal-nav-active-bg)',
    color: 'var(--pal-nav-active-fg)',
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

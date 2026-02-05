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

const outline = {
  borderWidth: '1px',
  borderColor: 'colorPalette.500',
  color: 'colorPalette.500',
  _hover: {
    bg: 'colorPalette.50',
  },
}

const defaultPalette = import.meta.env?.BUTTON_COLOR_SCHEME || 'gray'

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
  },
  defaultVariants: {
    colorPalette: defaultPalette as any,
  },
})

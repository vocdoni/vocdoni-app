import { defineRecipe, defineSlotRecipe } from '@chakra-ui/react'
import { switchAnatomy } from '@chakra-ui/react/anatomy'

export const formLabel = defineRecipe({
  base: {
    fontSize: 'sm',
    fontWeight: 'normal',
  },
})

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

export const input = defineRecipe({
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

export const textarea = defineRecipe({
  base: {
    fontSize: 'md',
    _placeholder: {
      color: 'input.placeholder',
      fontSize: 'md',
    },
  },
  variants: {
    variant: {
      borderless: {
        border: 'none',
        px: 0,
      },
    },
  },
})

export const switchRecipe = defineSlotRecipe({
  slots: switchAnatomy.keys(),
  base: {
    control: {
      _focusVisible: {
        _dark: {
          boxShadow: '0 0 0 2px darkgray',
        },
      },
    },
    thumb: {
      _dark: {
        bg: 'colorPalette.600',
      },
    },
  },
})

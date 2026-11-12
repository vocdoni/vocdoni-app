import { defineRecipe, defineSlotRecipe, defineStyle } from '@chakra-ui/react'
import { switchAnatomy } from '@chakra-ui/react/anatomy'

const baseStyle = defineStyle({
  textStyle: 'md',
  _placeholder: {
    color: 'input.placeholder',
    textStyle: 'md',
  },
})

const xxl = defineStyle({
  textStyle: '2xl',
  _placeholder: {
    textStyle: '2xl',
  },
})

// iOS Safari auto-zooms focused inputs with a font-size below 16px; keep base at
// `md` (16px) on mobile and restore the compact `sm` (14px) look from `md` up.
// Set at variant level so it overrides Chakra's default size variants (textStyle `sm`).
const mobileSafeFontSize = defineStyle({
  fontSize: { base: 'md', md: 'sm' },
  _placeholder: {
    fontSize: { base: 'md', md: 'sm' },
  },
})

const sm = defineStyle({
  borderRadius: 'sm',
  ...mobileSafeFontSize,
})

const md = defineStyle({
  borderRadius: 'sm',
  ...mobileSafeFontSize,
})

export const input = defineRecipe({
  base: baseStyle,
  variants: {
    size: {
      sm,
      md,
      '2xl': xxl,
    },
    variant: {
      inline: {
        border: '[none]',
        px: '[0]',
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
    size: {
      sm: mobileSafeFontSize,
      md: mobileSafeFontSize,
    },
    variant: {
      inline: {
        border: '[none]',
        px: '[0]',
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
          boxShadow: '[0 0 0 2px {colors.gray.focusRing}]',
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

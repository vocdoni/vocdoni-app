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

// iOS Safari auto-zooms focused inputs with a font-size below 16px; keep base at
// `md` (16px) on mobile and restore the compact `sm` (14px) look from `md` up.
// Set at variant level so it overrides Chakra's default size variants (textStyle `sm`).
const mobileSafeFontSize = {
  fontSize: { base: 'md', md: 'sm' },
  _placeholder: {
    fontSize: { base: 'md', md: 'sm' },
  },
}

const sm = {
  borderRadius: 'sm',
  ...mobileSafeFontSize,
}

const md = {
  borderRadius: 'sm',
  ...mobileSafeFontSize,
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
    size: {
      sm: mobileSafeFontSize,
      md: mobileSafeFontSize,
    },
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
          boxShadow: '0 0 0 2px {colors.gray.400}',
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

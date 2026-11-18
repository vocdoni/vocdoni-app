import { defineRecipe, defineSlotRecipe, defineStyle } from '@chakra-ui/react'
import { switchAnatomy } from '@chakra-ui/react/anatomy'

// The ring replaces the border, so every field state is drawn through `boxShadow` and the focus outline.
const baseStyle = defineStyle({
  textStyle: 'control',
  '--error-color': 'colors.status.error.fg',
  _placeholder: {
    color: 'input.placeholder',
    textStyle: 'control',
  },
})

// Fil's field: a panel with a 1px ring, a 2px accent outline on focus and the error colour for a ring when invalid.
export const field = defineStyle({
  bg: 'bg.field',
  color: 'fg',
  borderWidth: '[0]',
  boxShadow: 'shadow.field',
  focusVisibleRing: 'outside',
  focusRingColor: 'colorPalette.solid',
  _dark: { focusRingColor: 'colorPalette.fg' },
  _readOnly: { bg: 'bg.muted' },
  _invalid: {
    boxShadow: '[0 0 0 {borderWidths.hairline} {colors.status.error.fg}]',
    focusRingColor: 'status.error.fg',
  },
})

const xxl = defineStyle({
  textStyle: '2xl',
  _placeholder: {
    textStyle: '2xl',
  },
})

// iOS Safari auto-zooms focused inputs with a font-size below 16px; keep base at
// `lg` (the 1rem step) on mobile and restore the control size from `md` up.
// Set at variant level so it overrides Chakra's default size variants (textStyle `sm`).
export const mobileSafeFontSize = defineStyle({
  fontSize: { base: 'lg', md: 'control' },
  _placeholder: {
    fontSize: { base: 'lg', md: 'control' },
  },
})

// One field height, the shared control size.
const sm = defineStyle({
  borderRadius: 'l2',
  px: '3',
  '--input-height': 'sizes.control.md',
  ...mobileSafeFontSize,
})

const md = sm

export const input = defineRecipe({
  base: baseStyle,
  variants: {
    size: {
      sm,
      md,
      '2xl': xxl,
    },
    variant: {
      outline: field,
      inline: {
        border: '[none]',
        px: '0',
        bg: 'transparent',
        boxShadow: '[none]',
      },
    },
  },
})

export const textarea = defineRecipe({
  base: {
    fontSize: 'control',
    _placeholder: {
      color: 'input.placeholder',
      fontSize: 'control',
    },
  },
  variants: {
    size: {
      sm: { ...mobileSafeFontSize, borderRadius: 'l2', px: '3', py: '2', minH: 'control.area' },
      md: { ...mobileSafeFontSize, borderRadius: 'l2', px: '3', py: '2', minH: 'control.area' },
    },
    variant: {
      outline: field,
      inline: {
        border: '[none]',
        px: '0',
        boxShadow: '[none]',
      },
    },
  },
})

// 36 by 20 with a 2px gutter, square-ish corners (not a pill) and a white thumb. The thumb colours come from
// `switch.thumb*`; off, the track has an inset line so it reads on a white page.
export const switchRecipe = defineSlotRecipe({
  slots: switchAnatomy.keys(),
  variants: {
    variant: {
      solid: {
        control: {
          borderRadius: 'l2',
          p: '0.5',
          bg: 'bg.emphasized',
          boxShadow: '[inset 0 0 0 {borderWidths.hairline} {colors.border.emphasized}]',
          _checked: { bg: 'colorPalette.solid', boxShadow: '[none]' },
        },
        thumb: {
          bg: 'switch.thumb',
          borderRadius: 'l1',
          boxShadow: '[none]',
          scale: '1',
          // Inside the 2px gutter; the 16px travel is the track width minus the root's own height var,
          // which equals 36 - 4 - 16, so it still reaches the end.
          width: '4',
          height: '4',
          _checked: { bg: 'switch.thumb.checked' },
        },
      },
    },
    size: {
      // The root vars drive the track and the travel.
      md: {
        root: { '--switch-width': '36px', '--switch-height': '20px' },
        label: { textStyle: 'control' },
      },
    },
  },
})

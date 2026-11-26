import { defineRecipe, defineSlotRecipe, defineStyle } from '@chakra-ui/react'
import { switchAnatomy } from '@chakra-ui/react/anatomy'
import { solidEdge } from './solidEdge'

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
  // The ring slot, not `solid`: a pale brand fill would vanish on the page; the slot keeps 3:1 in both modes.
  focusRingColor: 'colorPalette.focusRing',
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

// iOS Safari auto-zooms focused inputs with a font-size below 16px: 16px on a phone, 14px on a tablet and the
// control size from `lg`.
// Set at variant level so it overrides Chakra's default size variants (textStyle `sm`).
export const mobileSafeFontSize = defineStyle({
  fontSize: { base: 'lg', md: 'md', lg: 'control' },
  _placeholder: {
    fontSize: { base: 'lg', md: 'md', lg: 'control' },
  },
})

// One field height, the shared control size: 44px on a phone, 40px on a tablet, 34px from `lg`.
const sm = defineStyle({
  borderRadius: 'l2',
  px: '3',
  '--input-height': { base: 'sizes.control.touch', md: 'sizes.control.tablet', lg: 'sizes.control.md' },
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
      // A read-only value to copy (a voting link): a sunken fill, no ring, in the figure face.
      code: {
        border: '[none]',
        boxShadow: '[none]',
        bg: 'bg.muted',
        color: 'fg.muted',
        // Restated over the size's field text: 13px up to `lg`, 12px from `lg`. Read-only, so iOS never zooms.
        fontFamily: 'figure',
        fontSize: { base: 'sm', lg: 'xs' },
        letterSpacing: 'none',
        textOverflow: 'ellipsis',
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
// `switch.thumb*`; off, the track has an inset line so it reads on a white page, and on, the fill's own edge when it is
// too pale for the page (`solidEdge`).
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
          _checked: { bg: 'colorPalette.solid', boxShadow: solidEdge },
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

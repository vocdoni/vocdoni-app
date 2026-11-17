import { defineRecipe, defineStyle, type SystemStyleObject } from '@chakra-ui/react'

const sectionSubtitle = defineStyle({
  py: '4',
})

export const heading = defineRecipe({
  base: {
    fontWeight: 'semibold',
  },
  variants: {
    // Large sizes are set tight; Chakra's size axis only picks the text style.
    size: {
      xl: { letterSpacing: 'tight' },
      '2xl': { letterSpacing: 'tight' },
      '3xl': { letterSpacing: 'tighter' },
      '4xl': { letterSpacing: 'tighter' },
      '5xl': { letterSpacing: 'tighter' },
      '6xl': { letterSpacing: 'tighter' },
      '7xl': { letterSpacing: 'tighter' },
    },
    variant: {
      heavy: {
        fontWeight: 'semibold',
      },
      subsection: sectionSubtitle,
    },
  },
})

export const link = defineRecipe({
  base: {
    // The guide's link: label and chevron 4px apart.
    gap: '1',
    color: 'accent.fg',
    fontWeight: 'medium-plus',
    textDecoration: 'none',
    // Repeats the token on purpose: `.dark &` is more specific than a single class, so in dark mode
    // it beats the palette colour of Chakra's plain/underline variants and of a Button rendering a
    // Link (`asChild`), as the members CSV template download does.
    _dark: {
      color: 'link.fg',
      _hover: {
        color: 'link.fg.hover',
      },
    },
    _hover: {
      color: 'accent.fg.hover',
    },
  },
  variants: {
    variant: {
      // Chakra's default `plain` variant (applied via defaultVariants) sets its own colour, and variants beat the
      // base: restate the accent colour. Never underlined: hover only darkens it, and keyboard focus keeps the
      // outline.
      plain: {
        color: 'accent.fg',
        _hover: {
          color: 'accent.fg.hover',
        },
      },
      unstyled: {
        textDecoration: 'none',
        _hover: {
          textDecoration: 'none',
        },
      },
      'icon-button': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 'sm',
        minW: 'control.icon-link',
        h: 'control.icon-link',
        border: '[{borderWidths.hairline} solid]',
        cursor: 'button',
        textDecoration: 'none',
      },
      // Grey, darkening to the text colour on hover; never underlined.
      subtle: {
        textDecoration: 'none',
        color: 'fg.muted',
        _hover: {
          color: 'fg',
        },
      },
      // The way back to the parent page over a page title: a chevron and 14px medium up to `lg` (the chevron is
      // the component's, hidden from `lg`), a quiet 12px label from `lg`.
      back: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5',
        textStyle: { base: 'md', lg: 'xs' },
        lineHeight: { lg: 'row.label' },
        letterSpacing: { lg: 'none' },
        fontWeight: { base: 'medium', lg: 'normal' },
        minH: { base: 'control.touch', md: 'control.tablet', lg: 'auto' },
        color: 'fg.subtle',
        _hover: { color: 'fg' },
      },
      // The one action of a list row ("Continue", "Result"): touch-sized text and hit area up to `lg`, text alone
      // from `lg`.
      'row-action': {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '1',
        textStyle: 'control-touch',
        _icon: { boxSize: { lg: 'icon.xs' } },
        whiteSpace: 'nowrap',
        minH: { base: 'control.touch', md: 'control.tablet', lg: 'auto' },
      },
      // A whole row-sized link used as a tile: a centred label with badges laid over its corners.
      tile: {
        flexGrow: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        h: '[100px]',
        borderRadius: 'md',
        textAlign: 'center',
        fontWeight: 'bold',
        boxShadow: 'lg',
        position: 'relative',
        // The label keeps the text colour and no underline in every state: the base repeats its colour
        // under `.dark &` and on hover.
        color: 'fg',
        textDecoration: 'none',
        _hover: {
          color: 'fg',
          textDecoration: 'none',
          bgColor: 'link.tile.hover.bg',
        },
        _dark: { color: 'fg', _hover: { color: 'fg' } },
        _active: {
          transform: 'scale(0.9)',
        },
      },
    },
    size: {
      xs: { fontSize: 'xs' },
      sm: { fontSize: 'sm' },
    },
    emphasis: {
      medium: { fontWeight: 'medium' },
      strong: { fontWeight: 'bold' },
    },
    // The base repeats its colour under `.dark &` and on hover, which beats a plain `color`
    // in a variant, so a tone sets every state it changes.
    tone: {
      // Secondary links (legal notices): grey in every state and mode.
      muted: {
        color: 'fg.muted',
        _hover: { color: 'fg.muted' },
        _dark: { color: 'fg.muted', _hover: { color: 'fg.muted' } },
      },
      // Navigation-style links: the text colour in every state, never underlined.
      quiet: {
        color: 'fg',
        textDecoration: 'none',
        _hover: { color: 'fg' },
        _dark: { color: 'fg', _hover: { color: 'fg' } },
      },
    },
  },
})

// Unitless line heights (tokens) keep the spacing proportional when a consumer overrides fontSize.
const sizes = {
  xs: { fontSize: 'xs', lineHeight: 'moderate' },
  sm: { fontSize: 'sm', lineHeight: 'moderate' },
  md: { fontSize: 'md', lineHeight: 'moderate' },
  lg: { fontSize: 'lg', lineHeight: 'moderate' },
  xl: { fontSize: 'xl', lineHeight: 'moderate' },
  '2xl': { fontSize: '2xl', lineHeight: 'short' },
} satisfies Record<string, SystemStyleObject>

// No default size: a Text without one inherits its container's size and line height, as plain text does.
export const text = defineRecipe({
  variants: {
    size: sizes,
    variant: {
      muted: {
        color: 'fg.muted',
        fontWeight: 'normal',
      },
    },
  },
})

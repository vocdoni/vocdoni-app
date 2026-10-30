import { defineRecipe, defineStyle, type SystemStyleObject } from '@chakra-ui/react'

const sectionSubtitle = defineStyle({
  py: '4',
})

export const heading = defineRecipe({
  base: {
    fontWeight: 'bold',
  },
  variants: {
    variant: {
      heavy: {
        fontWeight: 'extrabold',
      },
      subsection: sectionSubtitle,
    },
  },
})

export const link = defineRecipe({
  base: {
    color: 'link.fg',
    textDecoration: 'underline',
    textDecorationThickness: 'from-font',
    textUnderlineOffset: '0.15em',
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
      color: 'link.fg.hover',
    },
  },
  variants: {
    variant: {
      // Chakra's default `plain` variant (applied via defaultVariants) fades the
      // underline to currentColor/20 and shifts its offset to 3px on hover,
      // fighting the base styles above — pin both so hover keeps a solid,
      // consistent underline.
      plain: {
        _hover: {
          textDecorationColor: 'current',
          textUnderlineOffset: '0.15em',
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
        border: 'sm',
        cursor: 'button',
        textDecoration: 'none',
      },
      // Grey, underlined only on hover; the hover colour still follows the base.
      subtle: {
        textDecoration: 'none',
        color: 'fg.muted',
        _hover: {
          textDecoration: 'underline',
        },
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
      // Navigation-style links: text colour, underlined only on hover.
      quiet: {
        color: 'fg',
        textDecoration: 'none',
        _hover: { color: 'fg', textDecoration: 'underline' },
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

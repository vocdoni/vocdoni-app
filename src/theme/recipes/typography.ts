import { defineRecipe } from '@chakra-ui/react'

const sidebarTitle = {
  pt: 4,
}

const sidebarSubtitle = {
  py: 4,
}

export const heading = defineRecipe({
  base: {
    fontWeight: 'bold',
  },
  variants: {
    variant: {
      header: {
        fontWeight: 'extrabold',
      },
      ['sidebar-title']: sidebarTitle,
      ['sidebar-subtitle']: sidebarSubtitle,
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
          textDecorationColor: 'currentColor',
          textUnderlineOffset: '0.15em',
        },
      },
      unstyled: {
        textDecoration: 'none',
        _hover: {
          textDecoration: 'none',
        },
      },
      icon: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 'sm',
        minW: '30px',
        h: '30px',
        border: '{borderWidths.hairline} solid',
        cursor: 'pointer',
        textDecoration: 'none',
      },
      footer: {
        textDecoration: 'none',
        color: 'fg.muted',
        _hover: {
          textDecoration: 'underline',
        },
      },
      button: {
        textDecoration: 'none',
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

// Line heights are unitless so text keeps proportional spacing even when a
// consumer overrides fontSize without changing the size variant.
const sizes = {
  xs: {
    fontSize: 'xs',
    lineHeight: 1.5,
  },
  sm: {
    fontSize: 'sm',
    lineHeight: 1.43,
  },
  md: {
    fontSize: 'md',
    lineHeight: 1.5,
  },
  lg: {
    fontSize: 'lg',
    lineHeight: 1.56,
  },
  xl: {
    fontSize: 'xl',
    lineHeight: 1.5,
  },
  '2xl': {
    fontSize: '2xl',
    lineHeight: 1.3,
  },
}

// No default size: a Text without one inherits its container's size and line height, as plain text does.
export const text = defineRecipe({
  variants: {
    size: sizes,
    variant: {
      subheader: {
        color: 'fg.muted',
        fontWeight: 'normal',
      },
    },
  },
})

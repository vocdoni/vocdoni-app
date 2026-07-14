import { defineRecipe } from '@chakra-ui/react'

const sidebarTitle = {
  pt: 4,
}

const sidebarSubtitle = {
  py: 4,
  textTransform: 'capitalize',
}

export const heading = defineRecipe({
  base: {
    fontWeight: 'bold',
    letterSpacing: '-0.03em',
    lineHeight: 1.02,
    // Fraunces variable axes: SOFT rounds the serifs, WONK off
    fontVariationSettings: "'SOFT' 100, 'WONK' 0",
  },
  variants: {
    variant: {
      header: {
        // Single-weight display serif: never heavier than 400
        fontWeight: 'bold',
      },
      ['sidebar-title']: sidebarTitle,
      ['sidebar-subtitle']: sidebarSubtitle,
    },
  },
})

export const link = defineRecipe({
  base: {
    color: 'oklch(0.47 0.085 158)',
    textDecoration: 'underline',
    textDecorationThickness: 'from-font',
    textUnderlineOffset: '0.15em',
    _dark: {
      color: 'oklch(0.62 0.09 158)',
      _hover: {
        color: 'oklch(0.7 0.09 158)',
      },
    },
    _hover: {
      color: 'oklch(0.4 0.08 158)',
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
      breadcrumb: {
        color: 'dashboard.breadcrumb',
        textDecoration: 'none',
        _hover: {
          color: 'black',
        },
      },
      icon: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 'sm',
        minW: '30px',
        h: '30px',
        border: '1px solid',
        cursor: 'pointer',
        textDecoration: 'none',
      },
      footer: {
        textDecoration: 'none',
        color: 'process_create.footer_link',
        _hover: {
          textDecoration: 'underline',
        },
      },
      button: {
        textDecoration: 'none',
      },
    },
  },
})

// Line heights are unitless so text keeps proportional spacing even when a
// consumer overrides fontSize without changing the size variant.
const sizes = {
  xs: {
    fontSize: '12px',
    lineHeight: 1.5,
  },
  sm: {
    fontSize: '14px',
    lineHeight: 1.43,
  },
  md: {
    fontSize: '16px',
    lineHeight: 1.5,
  },
  lg: {
    fontSize: '18px',
    lineHeight: 1.56,
  },
  xl: {
    fontSize: '20px',
    lineHeight: 1.5,
  },
  '2xl': {
    fontSize: '24px',
    lineHeight: 1.3,
  },
}

export const text = defineRecipe({
  variants: {
    size: sizes,
    variant: {
      subheader: {
        color: 'texts.subtle',
        fontWeight: 'normal',
      },
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

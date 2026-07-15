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
    color: 'gray.800',
    textDecoration: 'underline',
    textDecorationThickness: 'from-font',
    textUnderlineOffset: '0.15em',
    _dark: {
      color: 'gray.400',
      _hover: {
        color: 'gray.200',
      },
    },
    _hover: {
      color: 'gray.500',
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
        border: '1px solid',
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

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

const sizes = {
  xs: {
    fontSize: '12px',
    lineHeight: '18px',
  },
  sm: {
    fontSize: '14px',
    lineHeight: '20px',
  },
  md: {
    fontSize: '16px',
    lineHeight: '24px',
  },
  lg: {
    fontSize: '18px',
    lineHeight: '28px',
  },
  xl: {
    fontSize: '20px',
    lineHeight: '30px',
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

import { defineSemanticTokens } from '@chakra-ui/react'

/**
 * Semantic tokens allow us to define tokens, like colors, based on their usage
 * https://v2.chakra-ui.com/docs/styled-system/semantic-tokens
 */

const chakra = {
  body: {
    bg: {
      value: 'var(--pal-bg)',
    },
  },
}

const texts = {
  primary: {
    value: 'var(--pal-text)',
  },
  subtle: {
    value: 'var(--pal-text-64)',
  },
  dark: {
    value: 'var(--pal-text-strong)',
  },
}

export const colors = defineSemanticTokens.colors({
  chakra,
  bg: {
    muted: {
      value: {
        _dark: '{colors.brand.800}',
      },
    },
  },
  auth: {
    bg: {
      value: 'var(--pal-auth-bg)',
    },
    card: {
      bg: {
        value: {
          _light: 'var(--pal-t50)',
          _dark: '{colors.brand.500}',
        },
      },
      border: {
        value: 'var(--pal-hairline)',
      },
    },
  },
  border: {
    dashboard: {
      value: 'var(--pal-hairline)',
    },
    pagination: {
      active: {
        value: {
          _light: '{colors.gray.700}',
          _dark: '{colors.gray.500}',
        },
      },
    },
  },
  card: {
    pricing: {
      bg: {
        value: {
          _light: 'var(--pal-t50)',
          _dark: '{colors.brand.650}',
        },
      },
      border: {
        value: {
          _light: 'var(--pal-hairline)',
          _dark: '{colors.brand.700}',
        },
      },
      current: {
        bg: {
          value: {
            _light: '{colors.gray.100}',
            _dark: '{colors.brand.600}',
          },
        },
        color: {
          value: {
            _light: '{colors.brand.500}',
            _dark: '{colors.white}',
          },
        },
      },
      featured: {
        bg: {
          value: '{colors.gray.800}',
        },
        badge: {
          bg: {
            value: {
              _light: '{colors.brand.500}',
              _dark: '{colors.white}',
            },
          },
          color: {
            value: {
              _light: '{colors.white}',
              _dark: '{colors.brand.500}',
            },
          },
        },
        border: {
          value: {
            _light: '{colors.brand.500}',
            _dark: '{colors.white}',
          },
        },
      },
    },
  },
  dashboard: {
    menu: {
      value: {
        _light: '{colors.dashboardMenu.light}',
        _dark: '{colors.dashboardMenu.dark}',
      },
    },
  },
  input: {
    placeholder: {
      value: 'var(--pal-placeholder)',
    },
  },
  // @deprecated: to be removed in favor of border.dashboard
  table: {
    border: {
      value: 'var(--pal-hairline)',
    },
  },
  tabs: {
    tab: {
      color: {
        value: 'var(--pal-text-64)',
      },
      active: {
        color: {
          value: {
            _light: '{colors.brand.500}',
            _dark: 'var(--pal-text)',
          },
        },
        bg: {
          value: {
            _light: 'var(--pal-t50)',
            _dark: '{colors.brand.500}',
          },
        },
      },
    },
    bg: {
      value: {
        _light: 'var(--pal-auth-bg)',
        _dark: '{colors.brand.700}',
      },
    },
  },
  texts,
})

const semanticTokens = {
  colors,
}

export default semanticTokens

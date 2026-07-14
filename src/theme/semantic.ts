import { defineSemanticTokens } from '@chakra-ui/react'

/**
 * Semantic tokens allow us to define tokens, like colors, based on their usage
 * https://v2.chakra-ui.com/docs/styled-system/semantic-tokens
 */

const chakra = {
  body: {
    bg: {
      value: {
        _light: 'oklch(0.988 0.011 97)',
        _dark: '{colors.brand.650}',
      },
    },
  },
}

const texts = {
  primary: {
    value: {
      _light: 'oklch(0.24 0.013 106)',
      _dark: 'oklch(0.95 0.012 97)',
    },
  },
  subtle: {
    value: {
      _light: 'oklch(0.24 0.013 106 / 0.64)',
      _dark: 'oklch(0.95 0.012 97 / 0.66)',
    },
  },
  dark: {
    value: {
      _light: 'oklch(0.24 0.013 106)',
      _dark: 'oklch(0.95 0.012 97 / 0.8)',
    },
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
      value: {
        _light: 'oklch(0.936 0.033 97)',
        _dark: '{colors.brand.550}',
      },
    },
    card: {
      bg: {
        value: {
          _light: 'oklch(0.988 0.011 97)',
          _dark: '{colors.brand.500}',
        },
      },
      border: {
        value: 'oklch(0.24 0.013 106 / 0.1)',
      },
    },
  },
  border: {
    dashboard: {
      value: {
        _light: 'oklch(0.24 0.013 106 / 0.1)',
        _dark: 'oklch(1 0 0 / 0.1)',
      },
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
          _light: 'oklch(0.988 0.011 97)',
          _dark: '{colors.brand.650}',
        },
      },
      border: {
        value: {
          _light: 'oklch(0.24 0.013 106 / 0.1)',
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
      value: {
        _light: 'oklch(0.24 0.013 106 / 0.55)',
        _dark: 'oklch(0.95 0.012 97 / 0.5)',
      },
    },
  },
  // @deprecated: to be removed in favor of border.dashboard
  table: {
    border: {
      value: {
        _light: 'oklch(0.24 0.013 106 / 0.1)',
        _dark: 'oklch(1 0 0 / 0.1)',
      },
    },
  },
  tabs: {
    tab: {
      color: {
        value: {
          _light: 'oklch(0.24 0.013 106 / 0.64)',
          _dark: 'oklch(0.95 0.012 97 / 0.66)',
        },
      },
      active: {
        color: {
          value: {
            _light: '{colors.brand.500}',
            _dark: 'oklch(0.95 0.012 97)',
          },
        },
        bg: {
          value: {
            _light: 'oklch(0.988 0.011 97)',
            _dark: '{colors.brand.500}',
          },
        },
      },
    },
    bg: {
      value: {
        _light: 'oklch(0.936 0.033 97)',
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

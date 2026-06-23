import { defineSemanticTokens } from '@chakra-ui/react'

/**
 * Semantic tokens allow us to define tokens, like colors, based on their usage
 * https://v2.chakra-ui.com/docs/styled-system/semantic-tokens
 */

const chakra = {
  body: {
    bg: {
      value: {
        _light: '{colors.white}',
        _dark: '{colors.brand.650}',
      },
    },
  },
}

const texts = {
  primary: {
    value: {
      _light: '{colors.brand.500}',
      _dark: '{colors.white}',
    },
  },
  subtle: {
    value: {
      _light: '{colors.gray.500}',
      _dark: '{colors.gray.400}',
    },
  },
  dark: {
    value: {
      _light: '{colors.gray.600}',
      _dark: '{colors.gray.500}',
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
        _light: '{colors.gray.50}',
        _dark: '{colors.brand.550}',
      },
    },
    card: {
      bg: {
        value: {
          _light: '{colors.white}',
          _dark: '{colors.brand.500}',
        },
      },
      border: {
        value: '{colors.gray.200}',
      },
    },
  },
  border: {
    dashboard: {
      value: {
        _light: '{colors.gray.200}',
        _dark: '{colors.gray.800}',
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
          _light: '{colors.white}',
          _dark: '{colors.brand.650}',
        },
      },
      border: {
        value: {
          _light: '{colors.gray.200}',
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
      value: '{colors.gray.500}',
    },
  },
  // @deprecated: to be removed in favor of border.dashboard
  table: {
    border: {
      value: {
        _light: '{colors.gray.200}',
        _dark: '{colors.gray.800}',
      },
    },
  },
  tabs: {
    tab: {
      color: {
        value: {
          _light: '{colors.gray.500}',
          _dark: '{colors.gray.400}',
        },
      },
      active: {
        color: {
          value: {
            _light: '{colors.brand.500}',
            _dark: '{colors.white}',
          },
        },
        bg: {
          value: {
            _light: '{colors.white}',
            _dark: '{colors.brand.500}',
          },
        },
      },
    },
    bg: {
      value: {
        _light: '{colors.gray.100}',
        _dark: '{colors.brand.700}',
      },
    },
  },
  texts,
})

/**
 * Mode-aware elevation. Reference as `boxShadow="elevation.rest"` etc. Layered,
 * multi-`box-shadow` values ("shadows over borders") adapt to any background; dark
 * mode uses deeper shadows so depth reads correctly on dark surfaces. Values are
 * inlined here (rather than raw tokens) to avoid a CSS-var name collision between a
 * raw `elevation-rest` token and this semantic `elevation.rest`.
 */
export const shadows = defineSemanticTokens.shadows({
  elevation: {
    rest: {
      value: {
        _light: '0 1px 2px rgba(17, 18, 20, 0.04), 0 1px 3px rgba(17, 18, 20, 0.05)',
        _dark: '0 1px 2px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.36)',
      },
    },
    hover: {
      value: {
        _light: '0 2px 4px rgba(17, 18, 20, 0.04), 0 8px 20px -8px rgba(17, 18, 20, 0.1)',
        _dark: '0 2px 4px rgba(0, 0, 0, 0.3), 0 8px 20px -8px rgba(0, 0, 0, 0.45)',
      },
    },
    overlay: {
      value: {
        _light: '0 12px 32px -12px rgba(17, 18, 20, 0.22)',
        _dark: '0 12px 32px -12px rgba(0, 0, 0, 0.6)',
      },
    },
  },
})

const semanticTokens = {
  colors,
  shadows,
}

export default semanticTokens

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
  // Editor-scoped surface tiers (whisper-subtle depth). Three stepped surfaces +
  // a border, correct in both modes: light leans on a tinted canvas + soft
  // shadow; dark leans on surface stepping (raised card lighter than the page,
  // nested inset darker). Only the vote-creation editor consumes these.
  editor: {
    canvas: {
      value: {
        _light: '{colors.surface.canvas}',
        _dark: '{colors.brand.650}',
      },
    },
    surface: {
      value: {
        _light: '{colors.white}',
        _dark: '{colors.surface.card}',
      },
    },
    inset: {
      value: {
        _light: '{colors.gray.150}',
        _dark: '{colors.surface.inset}',
      },
    },
    border: {
      value: {
        _light: '{colors.gray.200}',
        _dark: '{colors.surface.border}',
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

const semanticTokens = {
  colors,
}

export default semanticTokens

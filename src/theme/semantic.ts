import { defineSemanticTokens } from '@chakra-ui/react'

/**
 * Semantic tokens allow us to define tokens, like colors, based on their usage
 * https://v2.chakra-ui.com/docs/styled-system/semantic-tokens
 */

// @deprecated: use the chakra built-in `bg` token directly
const chakra = {
  body: {
    bg: {
      value: '{colors.bg}',
    },
  },
}

// @deprecated: use the chakra built-in `fg`/`fg.muted` tokens directly
const texts = {
  primary: {
    value: '{colors.fg}',
  },
  subtle: {
    value: '{colors.fg.muted}',
  },
  dark: {
    value: '{colors.fg.muted}',
  },
}

export const colors = defineSemanticTokens.colors({
  chakra,
  // Overrides of the chakra built-in semantic scale — the canonical vocabulary
  // for surfaces and text (bg, bg.subtle, bg.muted, fg, fg.muted, border, …)
  bg: {
    DEFAULT: {
      value: {
        _light: '{colors.white}',
        _dark: '{colors.ink.650}',
      },
    },
    muted: {
      value: {
        _light: '{colors.gray.100}',
        _dark: '{colors.ink.800}',
      },
    },
  },
  auth: {
    bg: {
      value: {
        _light: '{colors.gray.50}',
        _dark: '{colors.ink.550}',
      },
    },
    card: {
      bg: {
        value: {
          _light: '{colors.white}',
          _dark: '{colors.ink.500}',
        },
      },
      border: {
        value: '{colors.gray.200}',
      },
    },
    // The showcase panel is dark in both color modes — it sits on a deep vertical accent
    // tone, so its foreground doesn't flip with the theme.
    showcase: {
      fg: {
        DEFAULT: {
          value: '{colors.white}',
        },
        muted: {
          value: '{colors.gray.400}',
        },
      },
      ring: {
        value: '{colors.separator}',
      },
      // Hairline between the quote and its attribution. Neutral white alpha rather than
      // `separator`, which is faintly blue and reads as a tint of its own on a coloured panel.
      rule: {
        value: 'rgba(255, 255, 255, 0.16)',
      },
    },
    // Tile the customer logos sit on, in the showcase panel and in the trust bar alike. Light in
    // both color modes on purpose: several logos are dark artwork on a transparent background and
    // disappear on a dark surface.
    logo: {
      tile: {
        bg: {
          value: '{colors.white}',
        },
        border: {
          value: {
            _light: '{colors.gray.200}',
            _dark: '{colors.separator}',
          },
        },
      },
    },
  },
  border: {
    // @deprecated: use the chakra built-in `border` token directly
    dashboard: {
      value: '{colors.border}',
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
          _dark: '{colors.ink.650}',
        },
      },
      border: {
        value: {
          _light: '{colors.gray.200}',
          _dark: '{colors.ink.700}',
        },
      },
      current: {
        bg: {
          value: {
            _light: '{colors.gray.100}',
            _dark: '{colors.ink.600}',
          },
        },
        // Accent tokens read the generated `brand.fg` / `brand.solid` /
        // `brand.contrast` slots rather than the raw 500 step: 500 is the exact
        // configured PRIMARY_COLOR, which carries no readability guarantee (a
        // pale brand renders this label at ~1.3:1 on white). With no
        // PRIMARY_COLOR these resolve to the same black/white as before.
        color: {
          value: {
            _light: '{colors.brand.fg}',
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
              _light: '{colors.brand.solid}',
              _dark: '{colors.white}',
            },
          },
          color: {
            value: {
              _light: '{colors.brand.contrast}',
              // The dark-mode badge is a *white* chip, so its label needs the
              // light-surface accent step (700), not the raw 500: a pale brand
              // at 500 reads ~1.3:1 on white. Still black without PRIMARY_COLOR.
              _dark: '{colors.brand.700}',
            },
          },
        },
        border: {
          value: {
            _light: '{colors.brand.solid}',
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
  // @deprecated: use the chakra built-in `border` token directly
  table: {
    border: {
      value: '{colors.border}',
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
        // `brand.fg`, not the raw 500: the active tab label sits on white, and
        // an arbitrary PRIMARY_COLOR at 500 carries no contrast guarantee there.
        color: {
          value: {
            _light: '{colors.brand.fg}',
            _dark: '{colors.white}',
          },
        },
        bg: {
          value: {
            _light: '{colors.white}',
            _dark: '{colors.ink.500}',
          },
        },
      },
    },
    bg: {
      value: {
        _light: '{colors.gray.100}',
        _dark: '{colors.ink.700}',
      },
    },
  },
  texts,
})

const semanticTokens = {
  colors,
}

export default semanticTokens

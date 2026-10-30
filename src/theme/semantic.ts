import { defineSemanticTokens } from '@chakra-ui/react'
import { ballotColors } from './ballot'
import { chartColors } from './charts'
import { illustrationColors } from './illustration'
import { recipeColors } from './recipeColors'
import { stateColors } from './states'
import { statusColors } from './status'

/**
 * Semantic tokens allow us to define tokens, like colors, based on their usage
 * https://v2.chakra-ui.com/docs/styled-system/semantic-tokens
 */

export const colors = defineSemanticTokens.colors({
  ...stateColors,
  ...chartColors,
  ...recipeColors,
  // Chakra's neutral `bg`, `fg` and `border` slots, written out so this file owns them; status slots stay Chakra's.
  bg: {
    DEFAULT: {
      value: {
        _light: '{colors.white}',
        _dark: '{colors.ink.650}',
      },
    },
    subtle: {
      value: {
        _light: '{colors.gray.50}',
        _dark: '{colors.gray.950}',
      },
    },
    muted: {
      value: {
        _light: '{colors.gray.100}',
        _dark: '{colors.ink.800}',
      },
    },
    emphasized: {
      value: {
        _light: '{colors.gray.200}',
        _dark: '{colors.gray.800}',
      },
    },
    inverted: {
      value: {
        _light: '{colors.black}',
        _dark: '{colors.white}',
      },
    },
    panel: {
      value: {
        _light: '{colors.white}',
        _dark: '{colors.gray.950}',
      },
    },
  },
  fg: {
    DEFAULT: {
      value: {
        _light: '{colors.black}',
        _dark: '{colors.gray.50}',
      },
    },
    muted: {
      value: {
        _light: '{colors.gray.600}',
        _dark: '{colors.gray.400}',
      },
    },
    subtle: {
      value: {
        _light: '{colors.gray.400}',
        _dark: '{colors.gray.500}',
      },
    },
    inverted: {
      value: {
        _light: '{colors.gray.50}',
        _dark: '{colors.black}',
      },
    },
    // Chakra's red.500 fails AA on white, so light mode takes red.600; dark keeps Chakra's red.400.
    error: {
      value: {
        _light: '{colors.red.600}',
        _dark: '{colors.red.400}',
      },
    },
  },
  // Surface layers. A sub-role is a member that paints a different colour from its layer (tooltip vs
  // menu, drawer vs dialog).
  surface: {
    canvas: {
      value: '{colors.bg}',
    },
    sidebar: {
      value: {
        _light: '{colors.dashboardMenu.light}',
        _dark: '{colors.dashboardMenu.dark}',
      },
    },
    // The dashboard's right side panel; the content column itself has no fill.
    content: {
      value: '{colors.bg}',
    },
    card: {
      value: '{colors.bg.panel}',
    },
    sunken: {
      value: {
        _light: '{colors.bg.subtle}',
        _dark: '{colors.whiteAlpha.50}',
      },
    },
    // Menus and popovers
    raised: {
      DEFAULT: {
        value: '{colors.bg}',
      },
      tooltip: {
        value: '{colors.bg.panel}',
      },
    },
    // Dialogs and drawers; `drawer` is the sidebar colour for the mobile dashboard menu.
    overlay: {
      DEFAULT: {
        value: '{colors.bg.panel}',
      },
      drawer: {
        value: '{colors.surface.sidebar}',
      },
    },
    // A region set apart from the surface it sits on: muted in light mode, the page colour in dark mode,
    // where `bg.muted` would be brighter than the dialog around it.
    inset: {
      value: {
        _light: '{colors.bg.muted}',
        _dark: '{colors.bg}',
      },
    },
    // Cards and tiles that stay dark in both colour modes, with the greys that sit on them.
    inverse: {
      DEFAULT: {
        value: '{colors.gray.800}',
      },
      border: {
        value: '{colors.gray.600}',
      },
      rule: {
        value: '{colors.whiteAlpha.300}',
      },
      fg: {
        DEFAULT: {
          value: '{colors.white}',
        },
        muted: {
          value: '{colors.gray.400}',
        },
      },
    },
  },
  // Dims what is under it so a control on top stays legible: an image's hover action, an upload in progress.
  scrim: {
    DEFAULT: {
      value: '{colors.blackAlpha.400}',
    },
    strong: {
      value: '{colors.blackAlpha.500}',
    },
    fg: {
      value: '{colors.surface.inverse.fg}',
    },
  },
  auth: {
    card: {
      bg: {
        value: {
          _light: '{colors.white}',
          _dark: '{colors.ink.500}',
        },
      },
      // Painted in light mode only (card `standalone`).
      border: {
        value: '{colors.border}',
      },
    },
    // The showcase panel is dark in both color modes — it sits on a deep vertical accent
    // tone, so its foreground doesn't flip with the theme.
    showcase: {
      fg: {
        DEFAULT: {
          value: '{colors.surface.inverse.fg}',
        },
        muted: {
          value: '{colors.surface.inverse.fg.muted}',
        },
      },
      // Hairline between the quote and its attribution. Neutral white alpha rather than
      // `separator`, which is faintly blue and reads as a tint of its own on a coloured panel.
      rule: {
        value: '{colors.surface.inverse.rule}',
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
    DEFAULT: {
      value: {
        _light: '{colors.gray.200}',
        _dark: '{colors.gray.800}',
      },
    },
    muted: {
      value: {
        _light: '{colors.gray.100}',
        _dark: '{colors.gray.900}',
      },
    },
    subtle: {
      value: {
        _light: '{colors.gray.50}',
        _dark: '{colors.gray.950}',
      },
    },
    emphasized: {
      value: {
        _light: '{colors.gray.300}',
        _dark: '{colors.gray.700}',
      },
    },
    inverted: {
      value: {
        _light: '{colors.gray.800}',
        _dark: '{colors.gray.200}',
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
  ...illustrationColors,
  // Raw values kept as semantic tokens so a retheme (and the stress theme) can move them: the horizontal
  // rule of Layout/Separators, translucent so it works over both color modes.
  separator: {
    value: 'rgba(135, 140, 189, 0.3)',
  },
  // Accents of the per-vertical auth showcase, read as `${accent}.900` (src/components/Auth/vertical).
  // 900 is the panel surface: a deep, desaturated tone, dark enough to carry white type at roughly 13:1.
  verticals: {
    generic: {
      900: { value: '#251a42' },
    },
    professional: {
      900: { value: '#0c2e3e' },
    },
  },
  card: {
    plan: {
      bg: {
        value: '{colors.bg}',
      },
      featured: {
        bg: {
          value: '{colors.surface.inverse}',
        },
        badge: {
          bg: {
            value: '{colors.accent.solid}',
          },
          color: {
            value: '{colors.accent.contrast}',
          },
        },
        border: {
          value: '{colors.accent.solid}',
        },
      },
    },
  },
  dashboard: {
    // Borrowed by the support cards and the chat header; the sidebar reads `surface.sidebar`.
    menu: {
      value: '{colors.surface.sidebar}',
    },
  },
  // Footer band of the public layout (elements/PublicLayout.tsx): the page surface everywhere except on
  // organisation pages, where it is a muted band.
  footer: {
    bg: {
      DEFAULT: {
        value: '{colors.bg}',
      },
      muted: {
        value: {
          _light: '{colors.gray.100}',
          _dark: '{colors.ink.550}',
        },
      },
    },
  },
  // Chakra's gray.focusRing (gray.400) misses the 3:1 WCAG floor for focus indicators on a white page,
  // so light mode steps to gray.800; dark keeps gray.400, which clears it on the dark page.
  // Deep-merges with chakra's other gray slots.
  gray: {
    focusRing: {
      value: {
        _light: '{colors.gray.800}',
        _dark: '{colors.gray.400}',
      },
    },
  },
  input: {
    placeholder: {
      value: {
        _light: '{colors.gray.500}',
        _dark: '{colors.gray.400}',
      },
    },
  },
  tabs: {
    tab: {
      color: {
        value: '{colors.fg.muted}',
      },
      active: {
        // The accent text step, not the raw 500: an arbitrary PRIMARY_COLOR at 500 carries no contrast guarantee.
        color: {
          value: '{colors.accent.fg}',
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
  ...statusColors,
  ...ballotColors,
})

// Elevation by role; each points at a Chakra size, which carries its own dark-mode value.
export const shadows = defineSemanticTokens.shadows({
  shadow: {
    // Cards are told apart by their border, not a shadow
    card: {
      value: 'none',
    },
    raised: {
      // Menus
      DEFAULT: {
        value: '{shadows.md}',
      },
      // Chakra's popover shadow
      popover: {
        value: '{shadows.lg}',
      },
      tooltip: {
        value: '{shadows.xs}',
      },
    },
    // The support chat launcher and teaser bubble; `panel` is the open chat.
    floating: {
      DEFAULT: {
        value: '{shadows.lg}',
      },
      panel: {
        value: '{shadows.xl}',
      },
    },
    // Dialogs and drawers (Chakra's own)
    overlay: {
      value: '{shadows.lg}',
    },
  },
})

const semanticTokens = {
  colors,
  shadows,
}

export default semanticTokens

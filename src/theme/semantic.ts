import { defineSemanticTokens } from '@chakra-ui/react'
import { chartColors } from './charts'
import { stateColors } from './states'
import { statusColors } from './status'
import { ballotColors } from './ballot'
import { recipeColors } from './recipeColors'
import { illustrationColors } from './illustration'

/**
 * Semantic tokens allow us to define tokens, like colors, based on their usage
 * https://v2.chakra-ui.com/docs/styled-system/semantic-tokens
 */

const colors = defineSemanticTokens.colors({
  ...stateColors,
  ...chartColors,
  ...recipeColors,
  // Chakra's neutral `bg`, `fg` and `border` slots, written out so this file owns them; status slots stay Chakra's.
  bg: {
    DEFAULT: {
      value: {
        _light: '{colors.white}',
        _dark: '{colors.gray.950}',
      },
    },
    subtle: {
      value: {
        _light: '{colors.gray.50}',
        _dark: '{colors.carbon.925}',
      },
    },
    muted: {
      value: {
        _light: '{colors.gray.100}',
        _dark: 'rgb(255 255 255 / 0.06)',
      },
    },
    emphasized: {
      value: {
        _light: '{colors.gray.200}',
        _dark: 'rgb(255 255 255 / 0.08)',
      },
    },
    // The empty track of a progress bar.
    track: {
      value: {
        _light: '#c4c4c4',
        _dark: '{colors.carbon.750}',
      },
    },
    inverted: {
      value: {
        _light: '{colors.gray.900}',
        _dark: '{colors.carbon.100}',
      },
    },
    panel: {
      value: {
        _light: '{colors.white}',
        _dark: '{colors.gray.900}',
      },
    },
    // Washes of the status tones; dark uses the sidebar grey.
    error: {
      value: {
        _light: '#fff0f0',
        _dark: '{colors.bg.subtle}',
      },
    },
    warning: {
      value: {
        _light: '#fff8eb',
        _dark: '{colors.bg.subtle}',
      },
    },
    success: {
      value: {
        _light: '#f0faf3',
        _dark: '{colors.bg.subtle}',
      },
    },
    info: {
      value: {
        _light: '{colors.gray.100}',
        _dark: '{colors.bg.subtle}',
      },
    },
  },
  fg: {
    DEFAULT: {
      value: {
        _light: '{colors.gray.900}',
        _dark: '{colors.carbon.100}',
      },
    },
    muted: {
      value: {
        _light: '{colors.gray.600}',
        _dark: '{colors.carbon.300}',
      },
    },
    subtle: {
      value: {
        _light: '{colors.gray.500}',
        _dark: '{colors.carbon.400}',
      },
    },
    // The faintest text step, below `subtle`: placeholders, disabled and decorative text.
    faint: {
      value: {
        _light: '{colors.gray.400}',
        _dark: '{colors.carbon.500}',
      },
    },
    inverted: {
      value: {
        _light: '{colors.white}',
        _dark: '{colors.gray.950}',
      },
    },
    // Fil's status text colours. `info` is neutral: blue means action.
    error: {
      value: {
        _light: '#ca2a30',
        _dark: '#f97770',
      },
    },
    warning: {
      value: {
        _light: '#875500',
        _dark: '#e4ac59',
      },
    },
    success: {
      value: {
        _light: '#0b7636',
        _dark: '#6fc884',
      },
    },
    info: {
      value: {
        _light: '{colors.gray.600}',
        _dark: '{colors.fg.muted}',
      },
    },
  },
  // Surface layers. A sub-role is a member that paints a different colour from its layer (tooltip vs
  // menu, drawer vs dialog).
  surface: {
    // The dashboard page behind the content: a light grey in light mode, so the white cards, fields and
    // sidebar stand out on it.
    canvas: {
      value: {
        _light: '{colors.bg.subtle}',
        _dark: '{colors.bg}',
      },
    },
    sidebar: {
      value: {
        _light: '{colors.white}',
        _dark: '{colors.bg.subtle}',
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
    // Menus, popovers and tooltips
    raised: {
      DEFAULT: {
        value: {
          _light: '{colors.bg}',
          _dark: '{colors.carbon.850}',
        },
      },
      tooltip: {
        value: {
          _light: '{colors.bg.panel}',
          _dark: '{colors.carbon.850}',
        },
      },
    },
    // Dialogs and drawers; `drawer` is the sidebar colour for the mobile dashboard menu.
    overlay: {
      DEFAULT: {
        value: {
          _light: '{colors.bg.panel}',
          _dark: '{colors.carbon.875}',
        },
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
    // The fill of a secondary button, an avatar and the entity selector: white in light mode, a faint wash in dark.
    control: {
      value: {
        _light: '{colors.white}',
        _dark: 'rgb(255 255 255 / 0.05)',
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
        // gray.300, not 400: on the dark panel the fainter grey drops under AA for small text.
        muted: {
          value: '{colors.gray.300}',
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
      value: {
        _light: 'rgb(23 23 23 / 0.56)',
        _dark: 'rgb(0 0 0 / 0.64)',
      },
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
          _dark: '{colors.bg.panel}',
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
        _light: 'rgb(0 0 0 / 0.1)',
        _dark: 'rgb(255 255 255 / 0.1)',
      },
    },
    muted: {
      value: {
        _light: '{colors.gray.200}',
        _dark: '{colors.gray.800}',
      },
    },
    subtle: {
      value: {
        _light: '{colors.gray.100}',
        _dark: '{colors.carbon.875}',
      },
    },
    emphasized: {
      value: {
        _light: 'rgb(0 0 0 / 0.18)',
        _dark: 'rgb(255 255 255 / 0.18)',
      },
    },
    // The ring of a field, select, textarea and voter option.
    field: {
      value: {
        _light: '{colors.gray.400}',
        _dark: '{colors.carbon.500}',
      },
    },
    // The outline of a control drawn as a line (checkbox, radio, a dashed drop zone): a solid grey, not a hairline.
    strong: {
      value: {
        _light: '{colors.gray.400}',
        _dark: '{colors.carbon.500}',
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
  // rule of Layout/Separators.
  separator: {
    value: '{colors.border.muted}',
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
  dashboard: {
    // The light grey tint of the support cards and the chat header, which sit on white panels; the sidebar
    // itself reads `surface.sidebar`.
    menu: {
      value: {
        _light: '{colors.bg.subtle}',
        _dark: '{colors.bg.subtle}',
      },
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
          _dark: '{colors.bg.subtle}',
        },
      },
    },
  },
  // Chakra's gray.focusRing (gray.400) misses the 3:1 WCAG floor for focus indicators on a white page,
  // so light mode steps to gray.800; dark keeps gray.400, which clears it on the dark page.
  // The other slots keep Chakra's light values and move dark onto the Carbó steps (Chakra's dark `black` is tinted).
  // Deep-merges with chakra's `fg`, `emphasized` and `border` gray slots.
  gray: {
    subtle: {
      value: {
        _light: '{colors.gray.100}',
        _dark: '{colors.bg.muted}',
      },
    },
    muted: {
      value: {
        _light: '{colors.gray.200}',
        _dark: '{colors.bg.emphasized}',
      },
    },
    solid: {
      value: {
        _light: '{colors.gray.900}',
        _dark: '{colors.carbon.100}',
      },
    },
    contrast: {
      value: {
        _light: '{colors.white}',
        _dark: '{colors.gray.950}',
      },
    },
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
        _dark: '{colors.fg.subtle}',
      },
    },
  },
  tabs: {
    tab: {
      color: {
        value: {
          _light: '{colors.fg.muted}',
          _dark: '{colors.gray.300}',
        },
      },
      active: {
        // Fil marks the current tab with ink, not the accent.
        color: {
          value: '{colors.fg}',
        },
        bg: {
          value: {
            _light: '{colors.white}',
            _dark: '{colors.bg.panel}',
          },
        },
      },
    },
    bg: {
      value: {
        _light: '{colors.gray.100}',
        _dark: '{colors.bg.muted}',
      },
    },
  },
  ...statusColors,
  ...ballotColors,
})

// Fil draws depth with a 1px ring, never a blur or an offset. Chakra's own sizes are overridden with the same
// ring so stock recipes lose their blur too; the roles below point at them.
const RING = '0 0 0 1px {colors.border.emphasized}'

const shadows = defineSemanticTokens.shadows({
  xs: { value: RING },
  sm: { value: RING },
  md: { value: RING },
  lg: { value: RING },
  xl: { value: RING },
  '2xl': { value: RING },
  // Chakra's `inner` is blurred; `inset` has no blur and stays.
  inner: { value: 'inset 0 0 0 1px {colors.border}' },
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
    // A ring around a control (button, field) in place of its border.
    control: {
      value: RING,
    },
    // The ring of a field, select, textarea and voter option: the darker `border.field`.
    field: {
      value: '0 0 0 1px {colors.border.field}',
    },
    // A plain hairline ring in the default border colour.
    ring: {
      value: '0 0 0 1px {colors.border}',
    },
  },
})

// Chakra's semantic radii, which its control recipes read (`l2` for buttons and fields), written out with Chakra's
// mapping so a retheme moves them here.
const radii = defineSemanticTokens.radii({
  l1: { value: '{radii.sm}' },
  l2: { value: '{radii.md}' },
  l3: { value: '{radii.md}' },
})

const semanticTokens = {
  colors,
  shadows,
  radii,
}

export default semanticTokens

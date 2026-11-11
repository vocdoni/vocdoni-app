import { defineSemanticTokens } from '@chakra-ui/react'

// Status palettes: `colorPalette='success' | 'warning' | 'danger' | 'info'`, defined the way
// `brand` is. Each aliases the raw scale chakra's Alert picks for its `status` prop, so chips,
// buttons and alerts agree, and the app picks the colour in one place. Neutral is plain `gray`.
const SCALES = { success: 'green', warning: 'orange', danger: 'red', info: 'blue' } as const
// Chakra's own name for the same status in its `fg.*` / `bg.*` roles.
const CHAKRA_ROLE = { success: 'success', warning: 'warning', danger: 'error', info: 'info' } as const

export type StatusPalette = keyof typeof SCALES

const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const
// Every slot chakra defines on its own palettes. Recipes read them through `colorPalette.<slot>`.
const SLOTS = ['solid', 'contrast', 'fg', 'muted', 'subtle', 'emphasized', 'focusRing', 'border'] as const

const palette = (name: StatusPalette) => {
  const scale = SCALES[name]
  const role = CHAKRA_ROLE[name]
  return {
    // `colorPalette.500` style reads (summary card, button and form recipes).
    ...Object.fromEntries(STEPS.map((step) => [step, { value: `{colors.${scale}.${step}}` }])),
    ...Object.fromEntries(SLOTS.map((slot) => [slot, { value: `{colors.${scale}.${slot}}` }])),
    // Chakra's status roles for text and surfaces (`fg.error`, `bg.warning`…); `status.*` aliases these.
    text: { value: `{colors.fg.${role}}` },
    wash: { value: `{colors.bg.${role}}` },
  }
}

// `status.*`: the same colours named by meaning, for code that reads a colour rather than a palette.
const statusRole = (name: StatusPalette) => ({
  fg: { value: `{colors.${name}.text}` },
  bg: { value: `{colors.${name}.wash}` },
  border: { value: `{colors.${name}.border}` },
  solid: { value: `{colors.${name}.solid}` },
  contrast: { value: `{colors.${name}.contrast}` },
})

export const statusColors = defineSemanticTokens.colors({
  success: palette('success'),
  warning: palette('warning'),
  danger: {
    ...palette('danger'),
    // Text of actions that delete or end something (menu items, icon buttons). Steps up to red.400
    // in dark mode, where red.600 is too dark to read on the dark surfaces.
    action: { value: { _light: '{colors.red.600}', _dark: '{colors.red.400}' } },
  },
  info: palette('info'),
  status: {
    success: statusRole('success'),
    warning: statusRole('warning'),
    error: statusRole('danger'),
    info: statusRole('info'),
    neutral: {
      fg: { value: '{colors.fg.muted}' },
      bg: { value: '{colors.bg.muted}' },
      border: { value: '{colors.border}' },
      solid: { value: '{colors.gray.solid}' },
      contrast: { value: '{colors.gray.contrast}' },
    },
  },
})

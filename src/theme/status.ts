import { defineSemanticTokens } from '@chakra-ui/react'

// Status palettes: `colorPalette='success' | 'warning' | 'danger' | 'info'`, defined the way
// `brand` is. Each aliases the raw scale chakra's Alert picks for its `status` prop, so chips,
// buttons and alerts agree, and the app picks the colour in one place. Neutral is plain `gray`, and so is `info`:
// Fil has no info colour, blue means action.
const SCALES = { success: 'green', warning: 'orange', danger: 'red', info: 'gray' } as const
// Chakra's own name for the same status in its `fg.*` / `bg.*` roles.
const CHAKRA_ROLE = { success: 'success', warning: 'warning', danger: 'error', info: 'info' } as const

export type StatusPalette = keyof typeof SCALES

const STEPS = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const
// Every slot chakra defines on its own palettes. Recipes read them through `colorPalette.<slot>`.
const SLOTS = ['solid', 'contrast', 'fg', 'muted', 'subtle', 'emphasized', 'focusRing', 'border'] as const

// Fil's light-mode values for the slots it names, set over the stock scale; dark keeps the scale's own.
const LIGHT: Partial<Record<StatusPalette, Partial<Record<(typeof SLOTS)[number], string>>>> = {
  success: { solid: '#2caa4f', fg: '#0b7636', subtle: '#f0faf3' },
  warning: { solid: '#875500', contrast: '#ffffff', fg: '#875500', subtle: '#fff8eb' },
  danger: { solid: '#ca2a30', contrast: '#ffffff', fg: '#ca2a30', subtle: '#fff0f0' },
}

const slot = (name: StatusPalette, slotName: (typeof SLOTS)[number]) => {
  const stock = `{colors.${SCALES[name]}.${slotName}}`
  const light = LIGHT[name]?.[slotName]
  return { value: light ? { _light: light, _dark: stock } : stock }
}

const palette = (name: StatusPalette) => {
  const scale = SCALES[name]
  const role = CHAKRA_ROLE[name]
  return {
    // `colorPalette.500` style reads (summary card, button and form recipes).
    ...Object.fromEntries(STEPS.map((step) => [step, { value: `{colors.${scale}.${step}}` }])),
    ...Object.fromEntries(SLOTS.map((slotName) => [slotName, slot(name, slotName)])),
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
  // Running text on the tone's own `bg`
  emphasis: { value: { _light: `{colors.${name}.900}`, _dark: `{colors.${name}.100}` } },
  solid: { value: `{colors.${name}.solid}` },
  contrast: { value: `{colors.${name}.contrast}` },
})

export const statusColors = defineSemanticTokens.colors({
  success: palette('success'),
  warning: palette('warning'),
  danger: {
    ...palette('danger'),
    // Text of actions that delete or end something (menu items, icon buttons): the `fg.error` role.
    action: { value: '{colors.fg.error}' },
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

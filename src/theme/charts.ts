import { defineSemanticTokens } from '@chakra-ui/react'

/**
 * `chart.N` categorical fills (`chart.N.icon` is the matching glyph), the shared track and the
 * usage-meter states. Meters are the status solids, so they keep fixed colors and do not follow the brand color.
 */
const categorical = ['blue', 'purple', 'green', 'cyan', 'pink', 'teal', 'yellow', 'orange'] as const

const chartSeries = Object.fromEntries(
  categorical.map((hue, index) => [
    String(index + 1),
    {
      DEFAULT: { value: `{colors.${hue}.600}` },
      icon: { value: `{colors.${hue}.500}` },
    },
  ])
)

export const chartColors = defineSemanticTokens.colors({
  chart: {
    ...chartSeries,
    track: { value: '{colors.bg.emphasized}' },
  },
  meter: {
    ok: { value: '{colors.status.info.solid}' },
    // In dark the status text colours, which keep 3:1 on the dark track; Chakra's solids do not.
    warning: { value: { _light: '{colors.status.warning.solid}', _dark: '{colors.status.warning.fg}' } },
    critical: { value: { _light: '{colors.status.error.solid}', _dark: '{colors.status.error.fg}' } },
  },
})

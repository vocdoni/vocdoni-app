import { defineSemanticTokens } from '@chakra-ui/react'

/**
 * `chart.N` categorical fills (`chart.N.icon` is the matching glyph), the shared track and the
 * usage-meter states. Meters keep fixed colors on purpose: they do not follow the brand color.
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
    ok: { value: '{colors.blue.600}' },
    warning: { value: { _light: '{colors.orange.600}', _dark: '{colors.orange.500}' } },
    critical: { value: '{colors.red.600}' },
  },
})

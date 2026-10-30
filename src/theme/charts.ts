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
    warning: { value: '{colors.status.warning.solid}' },
    critical: { value: '{colors.status.error.solid}' },
  },
})

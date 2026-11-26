import { defineSlotRecipe } from '@chakra-ui/react'
import { alertAnatomy } from '@chakra-ui/react/anatomy'

// Merged into chakra's alert recipe, whose `status`, `variant` and `size` stay as they are. `layout`
// is the alert's shape; chakra's `md` size already gives the inline padding (px 4, py 4).
// Only warnings and errors are tinted: the colour says something is wrong. Success and info stay on the quiet fill.
export const Alert = defineSlotRecipe({
  slots: alertAnatomy.keys(),
  variants: {
    // Chakra's own status looks stay; the axis is declared so the compound variants below type-check.
    status: { info: {}, warning: {}, success: {}, error: {}, neutral: {} },
    size: {
      md: { root: { textStyle: 'control' } },
    },
    layout: {
      // An alert among the page's content.
      inline: {},
      // Edge-to-edge strip above the page (announcements).
      banner: { root: { borderRadius: '[0]' } },
      // A single line with an action beside it.
      compact: { root: { py: '3' } },
      // A status panel with a title, several lines and its own close button.
      panel: { root: { px: '6', py: '6' } },
      // The guide's notice (a paused vote): a tinted band in ink with a ring in the tone and a 15px icon. The touch
      // board's band is 14px muted text with no icon and no ring.
      notice: {
        root: {
          px: '3.5',
          py: { base: '3', lg: 'row' },
          gap: '2.5',
          alignItems: 'flex-start',
          borderRadius: 'md',
          textStyle: { base: 'body', lg: 'control' },
        },
        indicator: { display: { base: 'none', lg: 'inline-flex' }, boxSize: 'icon.chevron', mt: '0.5' },
        description: { textStyle: { base: 'body', lg: 'control' } },
      },
      // The voter page's notice (a vote paused mid-ballot, an identification that failed): a band tinted by the
      // status, in ink at every width, with the hairline inside its edge, 12px corners and 15px text whose lead
      // sentence is semibold; no icon. Its ink is a compound variant below, after the status colours.
      ballot: {
        root: {
          px: '4',
          py: '3.5',
          gap: '2.5',
          alignItems: 'flex-start',
          borderRadius: 'xl',
          textStyle: 'ballot-hint',
          boxShadow: 'inner',
          '& b, & strong': { fontWeight: 'semibold' },
        },
        indicator: { display: 'none' },
        title: { textStyle: 'ballot-hint', fontWeight: 'semibold' },
        description: { textStyle: 'ballot-hint' },
      },
    },
  },
  // After chakra's `variant`, so the look holds whichever variant is asked for.
  compoundVariants: [
    {
      status: 'warning',
      css: { root: { bg: 'status.warning.bg', color: 'status.warning.fg' }, indicator: { color: 'status.warning.fg' } },
    },
    {
      status: 'error',
      css: { root: { bg: 'status.error.bg', color: 'status.error.fg' }, indicator: { color: 'status.error.fg' } },
    },
    {
      status: 'success',
      css: {
        root: { bg: 'bg.subtle', color: 'fg', borderWidth: 'hairline', borderColor: 'border' },
        indicator: { color: 'status.success.fg' },
      },
    },
    {
      status: ['info', 'neutral'],
      css: { root: { bg: 'bg.subtle', color: 'fg.muted' }, indicator: { color: 'fg.muted' } },
    },
    {
      status: 'warning',
      layout: 'notice',
      css: {
        root: {
          color: { base: 'fg.muted', lg: 'fg' },
          boxShadow: { base: '[none]', lg: '[inset 0 0 0 {borderWidths.hairline} {colors.status.warning.ring}]' },
        },
      },
    },
    { layout: 'ballot', css: { root: { color: 'fg' } } },
  ],
  defaultVariants: {
    layout: 'inline',
  },
})

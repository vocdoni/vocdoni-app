// Warm editorial experiment: every value is a palette var (see palettes.ts)
// so the demo palette switcher can swap them at runtime.
export const colors = {
  brand: {
    // comments refer to (unused) button styles
    50: { value: 'var(--pal-ghost)' }, // ghost hover (light)
    100: { value: 'var(--pal-ghost-2)' }, // hover (light)
    200: { value: 'var(--pal-t50)' }, // outline hover / ghost active (light)
    300: { value: 'var(--pal-ink20)' }, // outline active (light)
    500: { value: 'var(--pal-solid)' }, // base solid — ink
    550: { value: 'var(--pal-dark-2)' }, // custom (auth bg) — dark surface
    600: { value: 'var(--pal-solid-hover)' }, // solid hover
    650: { value: 'var(--pal-dark-1)' }, // custom — dark body bg
    700: { value: 'var(--pal-solid-active)' }, // solid active
    800: { value: 'var(--pal-dark-3)' }, // link active (dark)
  },

  gray: {
    50: { value: 'var(--pal-t50)' },
    100: { value: 'var(--pal-ghost)' },
    200: { value: 'var(--pal-g200)' },
    400: { value: 'var(--pal-g400)' },
    500: { value: 'var(--pal-g500)' },
    600: { value: 'var(--pal-g600)' },
    700: { value: 'var(--pal-g700)' },
    800: { value: 'var(--pal-g800)' },
  },

  dashboardMenu: {
    light: { value: 'var(--pal-menu)' },
    dark: { value: 'var(--pal-dark-menu)' },
  },

  // Status ramps (alerts, progress, badges…): palette-tuned via vars so each
  // demo palette controls how muted or vivid they are
  ...Object.fromEntries(
    ['red', 'orange', 'green', 'blue', 'purple'].map((name) => [
      name,
      Object.fromEntries(
        ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].map((stop) => [
          stop,
          { value: `var(--pal-${name}-${stop})` },
        ])
      ),
    ])
  ),
}

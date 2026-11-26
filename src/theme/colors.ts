// Default accent when PRIMARY_COLOR is not configured: Fil's blue. The `brand` scale is
// generated from the configured color at system creation (see system.ts), so it
// is deliberately absent from this static map.
export const DEFAULT_PRIMARY_COLOR = '#1d62e9'

export const colors = {
  // Neutral near-black scale used for dark-mode surfaces (page, cards, menus)
  // and the default black accent. Kept separate from `brand` on purpose: a
  // configured PRIMARY_COLOR must recolor the accent, never tint the surfaces.
  // Steps are numbered by lightness, like Chakra's scales: a higher step is darker.
  ink: {
    950: { value: '#000000' },
    900: { value: '#0a0a0a' },
    850: { value: '#1f1f22' },
    800: { value: '#262626' }, // dark surface for muted bands (organisation footer)
    700: { value: '#2e2e2e' },
  },

  // The whole neutral scale, so a retheme replaces this one table. Fil's greys carry no tint.
  gray: {
    50: { value: '#fafafa' },
    100: { value: '#f5f5f5' },
    200: { value: '#ebebeb' },
    300: { value: '#c9c9c9' },
    400: { value: '#8f8f8f' },
    500: { value: '#6b6b6b' },
    600: { value: '#4d4d4d' },
    700: { value: '#3d3d3d' },
    800: { value: '#262626' },
    900: { value: '#171717' },
    950: { value: '#0a0a0a' },
  },

  dashboardMenu: {
    dark: { value: '#18181b' },
  },

  whatsapp: {
    500: { value: '#25D366' },
    600: { value: '#20BA5A' },
  },
}

// The page backgrounds a generated brand palette must stay readable against —
// the two sides of the `bg` semantic token (see semantic.ts). Defined here, next
// to the `ink` scale it reads from, so the palette generator, the theme and the
// tests all measure contrast against the background the app actually paints.
export const PAGE_BACKGROUNDS = { light: '#ffffff', dark: colors.ink[900].value }

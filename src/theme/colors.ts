// Default accent when PRIMARY_COLOR is not configured. The `brand` scale is
// generated from the configured color at system creation (see system.ts), so it
// is deliberately absent from this static map.
export const DEFAULT_PRIMARY_COLOR = '#000000'

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

  // The whole neutral scale, so a retheme replaces this one table. 50, 100, 400 and 500 are the app's own;
  // the other steps are Chakra's zinc-tinted defaults, copied as they resolve today.
  gray: {
    50: { value: '#fcfcfc' },
    100: { value: '#f5f5f5' },
    200: { value: '#e4e4e7' },
    300: { value: '#d4d4d8' },
    400: { value: '#b2b2b2' },
    500: { value: '#737373' },
    600: { value: '#52525b' },
    700: { value: '#3f3f46' },
    800: { value: '#27272a' },
    900: { value: '#18181b' },
    950: { value: '#111111' },
  },

  dashboardMenu: {
    light: { value: '#fbfbfb' },
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

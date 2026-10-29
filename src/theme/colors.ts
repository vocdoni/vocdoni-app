// Default accent when PRIMARY_COLOR is not configured. The `brand` scale is
// generated from the configured color at system creation (see system.ts), so it
// is deliberately absent from this static map.
export const DEFAULT_PRIMARY_COLOR = '#000000'

export const colors = {
  // Neutral near-black scale used for dark-mode surfaces (page, cards, menus)
  // and the default black accent. Kept separate from `brand` on purpose: a
  // configured PRIMARY_COLOR must recolor the accent, never tint the surfaces.
  ink: {
    500: { value: '#000000' },
    550: { value: '#262626' }, // dark surface for muted bands (organisation footer)
    650: { value: '#0a0a0a' },
    700: { value: '#2e2e2e' },
    800: { value: '#3f3f3f' },
  },

  // Partial override of chakra's default gray scale — only the shades that
  // differ from the defaults; the rest (200, 300, 600-950) merge through.
  gray: {
    50: { value: '#fcfcfc' },
    100: { value: '#f5f5f5' },
    400: { value: '#b2b2b2' },
    500: { value: '#737373' },
  },

  // Accents for the per-vertical auth showcase (see src/components/Auth/vertical).
  // 900 is the panel surface: a deep, desaturated tone, dark enough to carry white type at
  // roughly 13:1.
  verticals: {
    generic: {
      900: { value: '#251a42' },
    },
    professional: {
      900: { value: '#0c2e3e' },
    },
  },

  dashboardMenu: {
    light: { value: '#fbfbfb' },
    dark: { value: '#18181b' },
  },

  whatsapp: {
    500: { value: '#25D366' },
    600: { value: '#20BA5A' },
  },

  // Translucent so it works over both color modes
  separator: { value: 'rgba(135, 140, 189, 0.3)' },
}

// The page backgrounds a generated brand palette must stay readable against —
// the two sides of the `bg` semantic token (see semantic.ts). Defined here, next
// to the `ink` scale it reads from, so the palette generator, the theme and the
// tests all measure contrast against the background the app actually paints.
export const PAGE_BACKGROUNDS = { light: '#ffffff', dark: colors.ink[650].value }

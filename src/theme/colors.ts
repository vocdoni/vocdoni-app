export const colors = {
  brand: {
    // comments refer to (unused) button styles
    50: { value: '#e5e5e5' }, // ghost hover (light)
    100: { value: '#cccccc' }, // hover (light)
    200: { value: '#fafafa' }, // outline hover / ghost active (light)
    300: { value: '#bbbbbb' }, // outline active (light)
    500: { value: '#000000' }, // base solid
    550: { value: '#262626' }, // custom (auth bg)
    600: { value: '#353535' }, // solid hover
    650: { value: '#0a0a0a' }, // custom
    700: { value: '#2e2e2e' }, // solid active
    800: { value: '#3f3f3f' }, // link active (dark)
  },

  // Partial override of chakra's default gray scale — only the shades that
  // differ from the defaults; the rest (200, 300, 600-950) merge through.
  gray: {
    50: { value: '#fcfcfc' },
    100: { value: 'whitesmoke' },
    400: { value: '#b2b2b2' },
    500: { value: '#737373' },
  },

  // Accents for the per-vertical auth showcase (see src/components/Auth/vertical).
  // Each scale only carries the four shades the panel uses: 200/300 for text on the
  // dark panel, 500 for the blurred glow, 700 as the gradient anchor.
  verticals: {
    generic: {
      200: { value: '#ddd6fe' },
      300: { value: '#c4b5fd' },
      500: { value: '#8b5cf6' },
      700: { value: '#4c1d95' },
    },
    professional: {
      200: { value: '#bae6fd' },
      300: { value: '#7dd3fc' },
      500: { value: '#0ea5e9' },
      700: { value: '#0c4a6e' },
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

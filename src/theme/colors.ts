// Default accent when PRIMARY_COLOR is not configured: Fil's blue. The `brand` scale is
// generated from the configured color at system creation (see system.ts), so it
// is deliberately absent from this static map.
export const DEFAULT_PRIMARY_COLOR = '#1d62e9'

export const colors = {
  // Pure black, for the few marks that must not be the gray scale's near-black (the logo, the progress stripe).
  ink: {
    950: { value: '#000000' },
  },

  // The dark ("Carbó") steps that fall between the `gray` steps, untinted like them: the sidebar, dialog and menu
  // greys, the track, and the text and line greys. A higher step is darker, as in `gray`.
  carbon: {
    925: { value: '#111111' },
    875: { value: '#1c1c1c' },
    850: { value: '#222222' },
    750: { value: '#333333' },
    500: { value: '#707070' },
    400: { value: '#999999' },
    300: { value: '#b4b4b4' },
    100: { value: '#ededed' },
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

  whatsapp: {
    500: { value: '#25D366' },
    600: { value: '#20BA5A' },
  },
}

// The page backgrounds a generated brand palette must stay readable against —
// the two sides of the `bg` semantic token (see semantic.ts). Defined here, next
// to the `gray` scale it reads from, so the palette generator, the theme and the
// tests all measure contrast against the background the app actually paints.
export const PAGE_BACKGROUNDS = { light: '#ffffff', dark: colors.gray[950].value }

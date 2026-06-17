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

  gray: {
    50: { value: '#fcfcfc' },
    100: { value: 'whitesmoke' },
    150: { value: '#f4f4f5' },
    200: { value: '#e4e4e7' },
    400: { value: '#b2b2b2' },
    500: { value: '#737373' },
    600: { value: '#52525b' },
    700: { value: '#3f3f46' },
    800: { value: '#27272a' },
  },

  // Editor surface ramp (dark) — used by the editor's scoped depth system so raised
  // cards read lighter than the page and nested controls recede. Additive; nothing
  // else in the app references these.
  surface: {
    canvas: { value: '#fafafa' }, // light page behind cards (recessed)
    card: { value: '#17171a' }, // dark raised card (lighter than #0a0a0a page)
    inset: { value: '#0e0e10' }, // dark nested control (darker than card)
    border: { value: '#2a2a2e' }, // dark edge, slightly lifted for visibility
  },

  dashboardMenu: {
    light: { value: '#fbfbfb' },
    dark: { value: '#18181b' },
  },
}

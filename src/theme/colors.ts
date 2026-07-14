// Warm editorial experiment: brand = warm ink ramp, gray = warm cream/ink grays
export const colors = {
  brand: {
    // comments refer to (unused) button styles
    50: { value: 'oklch(0.962 0.022 97)' }, // ghost hover (light) — tinted cream
    100: { value: 'oklch(0.936 0.033 97)' }, // hover (light) — deeper cream
    200: { value: 'oklch(0.988 0.011 97)' }, // outline hover / ghost active (light) — cream
    300: { value: 'oklch(0.24 0.013 106 / 0.2)' }, // outline active (light)
    500: { value: 'oklch(0.24 0.013 106)' }, // base solid — warm ink
    550: { value: 'oklch(0.235 0.012 107)' }, // custom (auth bg) — dark surface
    600: { value: 'oklch(0.32 0.014 106)' }, // solid hover
    650: { value: 'oklch(0.22 0.012 106)' }, // custom — dark body bg
    700: { value: 'oklch(0.29 0.016 106)' }, // solid active
    800: { value: 'oklch(0.34 0.016 106)' }, // link active (dark)
  },

  gray: {
    50: { value: 'oklch(0.988 0.011 97)' },
    100: { value: 'oklch(0.962 0.022 97)' },
    200: { value: 'oklch(0.911 0.02 100)' },
    400: { value: 'oklch(0.72 0.015 100)' },
    500: { value: 'oklch(0.55 0.015 103)' },
    600: { value: 'oklch(0.45 0.014 104)' },
    700: { value: 'oklch(0.35 0.014 105)' },
    800: { value: 'oklch(0.27 0.013 106)' },
  },

  dashboardMenu: {
    light: { value: 'oklch(0.962 0.022 97)' },
    dark: { value: 'oklch(0.25 0.013 106)' },
  },
}

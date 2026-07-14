/**
 * Warm editorial experiment: runtime-switchable demo palettes.
 *
 * Every themed color in the token layer is a `var(--pal-*)` reference; each
 * palette defines those vars for light and dark mode. Switching palettes is
 * just `document.documentElement.dataset.palette = id` (unset = default).
 */

type PaletteInput = {
  id: string
  label: string
  /** hue + chroma of the near-white surfaces */
  surface: { h: number; c: number }
  /** hue + chroma of the ink (text, solid buttons, dark surfaces) */
  ink: { h: number; c: number }
  /** accent color for links/highlights, light and dark mode variants */
  accent: { light: string; lightHover: string; dark: string; darkHover: string }
  /**
   * "Easier on the eyes": warm, lower-glare surfaces (off-white instead of
   * near-white) and slightly softened text contrast for the light mode.
   */
  soft?: boolean
}

export type Palette = {
  id: string
  label: string
  /** swatch colors for the switcher UI */
  swatch: { bg: string; accent: string }
  light: Record<string, string>
  dark: Record<string, string>
}

const build = ({ id, label, surface: s, ink, accent, soft = false }: PaletteInput): Palette => {
  const inkAt = (l: number, alpha?: number) =>
    alpha ? `oklch(${l} ${ink.c} ${ink.h} / ${alpha})` : `oklch(${l} ${ink.c} ${ink.h})`
  const surfaceAt = (l: number, cMult = 1) => `oklch(${l} ${s.c * cMult} ${s.h})`
  const lightText = (alpha?: number) => (alpha ? `oklch(0.95 0.012 ${s.h} / ${alpha})` : `oklch(0.95 0.012 ${s.h})`)

  // "soft" palettes drop the light surfaces off pure white and ease the text
  // contrast down a notch, so the whole UI is gentler to look at.
  const L = soft
    ? { bg: 0.972, menu: 0.95, auth: 0.925, t50: 0.978, g200: 0.9 }
    : { bg: 0.988, menu: 0.962, auth: 0.936, t50: 0.988, g200: 0.911 }
  const tL = soft ? 0.3 : 0.24 // light-mode text lightness

  // Constants shared by both modes (raw brand/gray ramps don't mode-switch)
  const constants = {
    '--pal-t50': surfaceAt(L.t50), // brand.200 / gray.50
    '--pal-ghost': surfaceAt(L.menu, 2), // brand.50 / gray.100 / menu tint
    '--pal-ghost-2': surfaceAt(L.auth, 3), // brand.100 / muted panels
    '--pal-ink20': inkAt(0.24, 0.2),
    '--pal-solid': inkAt(0.24),
    '--pal-solid-hover': inkAt(0.32),
    '--pal-solid-active': inkAt(0.29),
    '--pal-dark-1': `oklch(0.22 0.012 ${ink.h})`, // dark body bg
    '--pal-dark-2': `oklch(0.235 0.012 ${ink.h})`, // dark auth bg
    '--pal-dark-menu': `oklch(0.25 0.013 ${ink.h})`, // dark sidebar/menu
    '--pal-dark-3': `oklch(0.34 0.016 ${ink.h})`, // dark muted bg
    '--pal-g200': surfaceAt(L.g200, 2),
    '--pal-g400': inkAt(0.72),
    '--pal-g500': inkAt(0.55),
    '--pal-g600': inkAt(0.45),
    '--pal-g700': inkAt(0.35),
    '--pal-g800': inkAt(0.27),
  }

  return {
    id,
    label,
    swatch: { bg: surfaceAt(L.menu, 2), accent: accent.light },
    light: {
      ...constants,
      '--pal-bg': surfaceAt(L.bg),
      '--pal-menu': surfaceAt(L.menu, 2),
      '--pal-auth-bg': surfaceAt(L.auth, 3),
      '--pal-text': inkAt(tL),
      '--pal-text-strong': inkAt(tL),
      '--pal-text-64': inkAt(tL, 0.64),
      '--pal-placeholder': inkAt(tL, 0.55),
      '--pal-hairline': inkAt(tL, 0.1),
      '--pal-accent': accent.light,
      '--pal-accent-hover': accent.lightHover,
    },
    dark: {
      ...constants,
      '--pal-bg': `oklch(0.22 0.012 ${ink.h})`,
      '--pal-menu': `oklch(0.25 0.013 ${ink.h})`,
      '--pal-auth-bg': `oklch(0.235 0.012 ${ink.h})`,
      '--pal-text': lightText(),
      '--pal-text-strong': lightText(0.8),
      '--pal-text-64': lightText(0.66),
      '--pal-placeholder': lightText(0.5),
      '--pal-hairline': 'oklch(1 0 0 / 0.1)',
      '--pal-accent': accent.dark,
      '--pal-accent-hover': accent.darkHover,
    },
  }
}

/**
 * Institutional-friendly lineup: sober near-white surfaces, hue-tinted ink,
 * one restrained accent per palette. Targets orgs like professional bodies,
 * municipalities and political parties — calm, trustworthy, no loud colors.
 */
export const palettes: Palette[] = [
  build({
    id: 'editorial',
    label: 'Editorial',
    surface: { h: 97, c: 0.011 },
    ink: { h: 106, c: 0.013 },
    accent: {
      light: 'oklch(0.47 0.085 158)',
      lightHover: 'oklch(0.4 0.08 158)',
      dark: 'oklch(0.62 0.09 158)',
      darkHover: 'oklch(0.7 0.09 158)',
    },
  }),
  build({
    id: 'navy',
    label: 'Navy',
    surface: { h: 250, c: 0.005 },
    ink: { h: 255, c: 0.018 },
    accent: {
      light: 'oklch(0.38 0.09 258)',
      lightHover: 'oklch(0.32 0.08 258)',
      dark: 'oklch(0.68 0.09 255)',
      darkHover: 'oklch(0.75 0.08 255)',
    },
  }),
  build({
    id: 'burgundy',
    label: 'Burgundy',
    surface: { h: 75, c: 0.008 },
    ink: { h: 30, c: 0.014 },
    accent: {
      light: 'oklch(0.4 0.115 20)',
      lightHover: 'oklch(0.34 0.11 20)',
      dark: 'oklch(0.64 0.12 18)',
      darkHover: 'oklch(0.71 0.11 18)',
    },
  }),
  build({
    id: 'graphite',
    label: 'Graphite',
    surface: { h: 270, c: 0.002 },
    ink: { h: 270, c: 0.005 },
    accent: {
      light: 'oklch(0.42 0.045 255)',
      lightHover: 'oklch(0.35 0.045 255)',
      dark: 'oklch(0.7 0.045 255)',
      darkHover: 'oklch(0.77 0.04 255)',
    },
  }),
  build({
    id: 'iris',
    label: 'Iris',
    surface: { h: 290, c: 0.005 },
    ink: { h: 290, c: 0.016 },
    accent: {
      light: 'oklch(0.44 0.1 285)',
      lightHover: 'oklch(0.38 0.095 285)',
      dark: 'oklch(0.68 0.09 285)',
      darkHover: 'oklch(0.75 0.085 285)',
    },
  }),
  build({
    id: 'bronze',
    label: 'Bronze',
    surface: { h: 85, c: 0.01 },
    ink: { h: 60, c: 0.014 },
    accent: {
      light: 'oklch(0.5 0.09 75)',
      lightHover: 'oklch(0.43 0.085 75)',
      dark: 'oklch(0.72 0.09 80)',
      darkHover: 'oklch(0.78 0.085 80)',
    },
  }),
  build({
    id: 'moss',
    label: 'Moss',
    surface: { h: 110, c: 0.007 },
    ink: { h: 120, c: 0.013 },
    accent: {
      light: 'oklch(0.44 0.075 128)',
      lightHover: 'oklch(0.38 0.07 128)',
      dark: 'oklch(0.66 0.075 128)',
      darkHover: 'oklch(0.73 0.07 128)',
    },
  }),
  build({
    id: 'terracotta',
    label: 'Terracotta',
    surface: { h: 65, c: 0.009 },
    ink: { h: 40, c: 0.014 },
    accent: {
      light: 'oklch(0.48 0.1 45)',
      lightHover: 'oklch(0.42 0.095 45)',
      dark: 'oklch(0.66 0.1 45)',
      darkHover: 'oklch(0.73 0.095 45)',
    },
  }),
  // Softer, lower-glare set — warm off-white surfaces, gentler contrast
  build({
    id: 'sepia',
    label: 'Sepia',
    soft: true,
    surface: { h: 75, c: 0.022 },
    ink: { h: 55, c: 0.02 },
    accent: {
      light: 'oklch(0.5 0.08 65)',
      lightHover: 'oklch(0.44 0.075 65)',
      dark: 'oklch(0.72 0.08 70)',
      darkHover: 'oklch(0.78 0.075 70)',
    },
  }),
  build({
    id: 'linen',
    label: 'Linen',
    soft: true,
    surface: { h: 95, c: 0.018 },
    ink: { h: 110, c: 0.016 },
    accent: {
      light: 'oklch(0.48 0.055 145)',
      lightHover: 'oklch(0.42 0.05 145)',
      dark: 'oklch(0.68 0.055 145)',
      darkHover: 'oklch(0.74 0.05 145)',
    },
  }),
  // Inspired by Littlebird: warm cream paper surface, gentle fresh-green accent
  build({
    id: 'littlebird',
    label: 'Littlebird',
    soft: true,
    surface: { h: 85, c: 0.024 },
    ink: { h: 70, c: 0.018 },
    accent: {
      light: 'oklch(0.5 0.08 150)',
      lightHover: 'oklch(0.44 0.075 150)',
      dark: 'oklch(0.7 0.08 150)',
      darkHover: 'oklch(0.76 0.075 150)',
    },
  }),
]

export const DEFAULT_PALETTE = palettes[0]

/** Builds the globalCss selector map that defines every palette's vars. */
export const paletteGlobalCss = () => {
  const css: Record<string, Record<string, string>> = {
    // Default (no data-palette attribute) = first palette
    ':root': { ...DEFAULT_PALETTE.light },
    'html.dark': { ...DEFAULT_PALETTE.dark },
  }
  for (const palette of palettes) {
    css[`html[data-palette='${palette.id}']`] = { ...palette.light }
    css[`html.dark[data-palette='${palette.id}']`] = { ...palette.dark }
  }
  return css
}

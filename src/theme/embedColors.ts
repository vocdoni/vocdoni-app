import { PAGE_BACKGROUNDS } from './colors'
import {
  generateBrandSemanticTokens,
  generatePaletteScale,
  normalizeHexColor,
  SOLID_HOVER_TINT,
  tintHex,
  type PaletteScale,
} from './palette'

// Stripe and Cal.com render in iframes, so theme CSS vars are unreachable; these raw values mirror the Fil dark
// tokens (bg, the dialog grey, fg, field ring, primary). The one place for them, shared by both embeds. Light keeps
// each embed's own look apart from the page background.
export const EMBED_DARK = {
  background: '#0a0a0a',
  dialog: '#1c1c1c',
  text: '#ededed',
  fieldRing: '#707070',
  primary: '#1d62e9',
  primaryText: '#ffffff',
  primaryHover: '#2d6deb',
}

// The booker's brand in dark, as the app's buttons paint it: the `solid` the palette gives a configured PRIMARY_COLOR,
// its label (the palette's contrast colour) and its hover. Without one the palette is Fil's blue, which is the default.
export const embedBrandColors = (primaryColor?: string) => {
  const brand = normalizeHexColor(primaryColor)
  if (!brand) return { brand: EMBED_DARK.primary, text: EMBED_DARK.primaryText, emphasis: EMBED_DARK.primaryHover }
  const scale = generatePaletteScale(brand)
  const tokens = generateBrandSemanticTokens(scale, PAGE_BACKGROUNDS)
  // The token is a reference to a scale step, `{colors.brand.<step>}`: the step the buttons fill with.
  const step = Number(/brand\.(\d+)/.exec(tokens.solid._dark)?.[1]) as keyof PaletteScale
  return { brand: scale[step], text: tokens.contrast._dark, emphasis: tintHex(scale[step], SOLID_HOVER_TINT) }
}

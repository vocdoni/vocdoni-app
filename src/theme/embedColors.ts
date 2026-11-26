import { PAGE_BACKGROUNDS } from './colors'
import {
  contrastColor,
  generateBrandSemanticTokens,
  generatePaletteScale,
  normalizeHexColor,
  solidHoverColor,
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

// The booker's brand in dark: the dark line step the app's palette gives a configured PRIMARY_COLOR (the focus ring's),
// so it still reads on the dark dialog when the brand is as dark as black, with the label and hover the palette gives
// that fill. Without one the palette is Fil's blue, which is the default.
export const embedBrandColors = (primaryColor?: string) => {
  const brand = normalizeHexColor(primaryColor)
  if (!brand) return { brand: EMBED_DARK.primary, text: EMBED_DARK.primaryText, emphasis: EMBED_DARK.primaryHover }
  const scale = generatePaletteScale(brand)
  // The token is a reference to a scale step, `{colors.brand.<step>}`.
  const step = Number(/brand\.(\d+)/.exec(generateBrandSemanticTokens(scale, PAGE_BACKGROUNDS).focusRing._dark)?.[1])
  const fill = scale[step as keyof PaletteScale]
  return { brand: fill, text: contrastColor(fill), emphasis: solidHoverColor(fill) }
}

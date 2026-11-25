import { PAGE_BACKGROUNDS } from './colors'
import { generateBrandSemanticTokens, generatePaletteScale, normalizeHexColor, type PaletteScale } from './palette'

// Stripe and Cal.com render in iframes, so theme CSS vars are unreachable; these raw values mirror the Fil dark
// tokens (bg, the dialog grey, fg, field ring, primary). The one place for them, shared by both embeds. Light keeps
// each embed's own look apart from the page background.
export const EMBED_DARK = {
  background: '#0a0a0a',
  dialog: '#1c1c1c',
  text: '#ededed',
  fieldRing: '#707070',
  primary: '#1d62e9',
}

// The booker's brand in dark: the `solid` the app's palette gives a configured PRIMARY_COLOR, so it matches the
// buttons. Without one the palette is Fil's blue, which is the default.
export const embedBrandColor = (primaryColor?: string): string => {
  const brand = normalizeHexColor(primaryColor)
  if (!brand) return EMBED_DARK.primary
  const scale = generatePaletteScale(brand)
  // The token is a reference to a scale step, `{colors.brand.<step>}`: the step the buttons fill with.
  const step = Number(/brand\.(\d+)/.exec(generateBrandSemanticTokens(scale, PAGE_BACKGROUNDS).solid._dark)?.[1])
  return scale[step as keyof PaletteScale]
}

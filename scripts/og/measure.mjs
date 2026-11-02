/**
 * Measures how many lines a headline takes, using satori's own text layout instead of a width
 * estimate: with `embedFont: false` satori emits one `<text>` element per laid-out segment, so the
 * distinct `y` values are the rendered lines. The style must match the headline in template.mjs.
 */
import satori from 'satori'

export const createLineCounter =
  (fonts) =>
  async (text, size, width, { fontWeight = 500, lineHeight = 1.08 } = {}) => {
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            width,
            fontFamily: 'Inter',
            fontSize: size,
            fontWeight,
            lineHeight,
            letterSpacing: -(size * 0.025),
          },
          children: text,
        },
      },
      { width, height: 2000, fonts, embedFont: false }
    )
    return new Set([...svg.matchAll(/<text [^>]*\by="([^"]+)"/g)].map((match) => match[1])).size
  }

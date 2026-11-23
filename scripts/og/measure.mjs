/**
 * Measures how many lines a headline takes, using satori's own text layout instead of a width
 * estimate: with `embedFont: false` satori emits one `<text>` element per laid-out segment, so the
 * distinct `y` values are the rendered lines. The style comes from template.mjs, as the card uses it.
 */
import satori from 'satori'
import { headlineTextStyle } from './template.mjs'

export const createLineCounter =
  (fonts) =>
  async (text, size, width) => {
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            display: 'flex',
            width,
            fontFamily: 'Inter',
            ...headlineTextStyle(size),
          },
          children: text,
        },
      },
      { width, height: 2000, fonts, embedFont: false }
    )
    return new Set([...svg.matchAll(/<text [^>]*\by="([^"]+)"/g)].map((match) => match[1])).size
  }

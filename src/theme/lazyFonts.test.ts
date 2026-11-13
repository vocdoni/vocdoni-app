import { LOADED_FONT_WEIGHTS } from './fonts'
import { loadInterSubsets } from './lazyFonts'

const styles = () => document.head.querySelectorAll<HTMLStyleElement>('style[data-inter-subsets]')

describe('loadInterSubsets', () => {
  beforeEach(() => {
    styles().forEach((el) => el.remove())
  })

  it('declares every non-Latin subset at every loaded weight, each limited by unicode-range', () => {
    loadInterSubsets()

    const css = styles()[0].textContent ?? ''
    expect(css.match(/@font-face/g)).toHaveLength(6 * LOADED_FONT_WEIGHTS.length)
    // Without unicode-range these faces would replace the statically loaded Latin ones.
    expect(css.match(/unicode-range:/g)).toHaveLength(6 * LOADED_FONT_WEIGHTS.length)
    for (const range of ['U+0100-02BA', 'U+0370-0377', 'U+1F00-1FFF', 'U+0400-045F', 'U+0460-052F', 'U+1EA0-1EF9']) {
      expect(css).toContain(range)
    }
    expect(LOADED_FONT_WEIGHTS.every((weight) => css.includes(`font-weight: ${weight};`))).toBe(true)
    expect(css).toContain("font-family: 'Inter'")
    expect(css).toContain('font-display: swap')
  })

  it('injects once', () => {
    loadInterSubsets()
    loadInterSubsets()

    expect(styles()).toHaveLength(1)
  })
})

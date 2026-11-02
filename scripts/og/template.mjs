/**
 * Open Graph card for the app (1200x630): the Vocdoni wordmark, the localized `og.headline` and
 * `og.tagline` copy, and a ballot drawn with the app's own component styling (card choices, a
 * checked radio, the solid Vote button).
 *
 * Built as a satori element tree. Two satori rules shape the helpers below: every `div` with
 * element children needs `display: flex`, and a lone text child must be a plain string.
 */

// Chakra tokens the app renders with (gray scale, `ink` surfaces, radii), copied as literals so
// the script has no dependency on the theme bundle.
export const themes = {
  light: {
    bg: '#ffffff',
    fg: '#0a0a0a',
    muted: '#71717a',
    border: '#e4e4e7',
    borderStrong: '#0a0a0a',
    skeleton: '#e4e4e7',
    skeletonStrong: '#d4d4d8',
    cardBg: '#ffffff',
    buttonBg: '#0a0a0a',
    buttonFg: '#ffffff',
    radioOff: '#d4d4d8',
    shadow: '0px 24px 40px rgba(24,24,27,0.10), 0px 0px 1px rgba(24,24,27,0.30)',
    glow: undefined,
    canvas: undefined,
  },
  dark: {
    bg: '#0a0a0a',
    fg: '#ffffff',
    muted: '#a1a1aa',
    border: '#3f3f3f',
    borderStrong: '#ffffff',
    skeleton: '#3f3f46',
    skeletonStrong: '#52525b',
    cardBg: '#141414',
    buttonBg: '#ffffff',
    buttonFg: '#0a0a0a',
    radioOff: '#52525b',
    shadow: '0px 24px 40px rgba(0,0,0,0.64), 0px 0px 1px rgba(212,212,216,0.30)',
    glow: 'radial-gradient(circle, rgba(82,82,91,0.55) 0%, rgba(39,39,42,0.35) 30%, rgba(10,10,10,0) 62%)',
    canvas: undefined,
  },
  tinted: {
    bg: '#ffffff',
    fg: '#0a0a0a',
    muted: '#71717a',
    border: '#e4e4e7',
    borderStrong: '#0a0a0a',
    skeleton: '#e4e4e7',
    skeletonStrong: '#d4d4d8',
    cardBg: '#ffffff',
    buttonBg: '#0a0a0a',
    buttonFg: '#ffffff',
    radioOff: '#d4d4d8',
    shadow: '0px 24px 40px rgba(24,24,27,0.10), 0px 0px 1px rgba(24,24,27,0.30)',
    glow: 'radial-gradient(circle, rgba(196,181,253,0.55) 0%, rgba(221,214,254,0.35) 40%, rgba(245,243,255,0) 70%)',
    canvas: 'linear-gradient(120deg, #ffffff 0%, #f5f3ff 55%, #ede9fe 100%)',
  },
}

export const WIDTH = 1200
export const HEIGHT = 630
// The copy column; the headline is sized to fit it on two lines when it can.
export const HEADLINE_WIDTH = 600
const HEADLINE_SIZES = { max: 56, min: 42, fallback: 46 }

const LOGO_RATIO = 1001 / 216

const h = (type, style = {}, children = [], extra = {}) => {
  let kids = children
  if (Array.isArray(children)) {
    if (children.length === 0) kids = undefined
    else if (children.length === 1 && typeof children[0] === 'string') kids = children[0]
  }
  return { type, props: { style, children: kids, ...extra } }
}

const logo = (src, height) => h('img', { height }, [], { src, width: Math.round(height * LOGO_RATIO), height })

// Width estimate used only when no measurer is given (mockups): Inter 500 averages ~0.46em per
// character, Greek runs wider. `fitHeadline` below is what the generator uses.
const estimateHeadlineSize = (text, maxWidth, { max, min } = HEADLINE_SIZES, lines = 2) => {
  const perChar = /\p{Script=Greek}/u.test(text) ? 0.5 : 0.46
  const longest = Math.max(...text.split(/\s+/).map((word) => word.length))
  for (let size = max; size >= min; size -= 2) {
    if (longest * 0.56 * size <= maxWidth && text.length * perChar * size <= maxWidth * lines * 0.9) return size
  }
  return min
}

const splitSentences = (title) => title.split(/(?<=[.!?])\s+/)

/**
 * Picks the largest size (56 down to 42, in steps of 2) at which the headline takes two lines in
 * the copy column, falling back to 46 on three lines when none does (Greek). A headline made of
 * short sentences breaks after each sentence when every sentence fits on one line at that size.
 * `countLines(text, size, width)` is the satori-backed measurer from measure.mjs.
 */
export const fitHeadline = async (title, countLines) => {
  const { max, min, fallback } = HEADLINE_SIZES
  let size = fallback
  for (let candidate = max; candidate >= min; candidate -= 2) {
    if ((await countLines(title, candidate, HEADLINE_WIDTH)) <= 2) {
      size = candidate
      break
    }
  }
  const sentences = splitSentences(title)
  if (sentences.length > 1) {
    const fits = await Promise.all(sentences.map((sentence) => countLines(sentence, size, HEADLINE_WIDTH)))
    if (fits.every((lines) => lines === 1)) return { size, lines: sentences }
  }
  return { size, lines: [title] }
}

const bar = (width, height, color) => h('div', { width, height, background: color, borderRadius: 9999 })

const radio = (t, checked) =>
  checked
    ? h(
        'div',
        {
          width: 24,
          height: 24,
          borderRadius: 9999,
          background: t.buttonBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        },
        [h('div', { width: 9, height: 9, borderRadius: 9999, background: t.buttonFg })]
      )
    : h('div', { width: 24, height: 24, borderRadius: 9999, border: `2px solid ${t.radioOff}`, flexShrink: 0 })

// QuestionChoice in its `card` context: 1px gray border, 8-10px radius, the checked one outlined
// in the foreground color. Labels are drawn as bars so the card reads the same in every language.
const choice = (t, checked, labelWidth, descriptionWidth) =>
  h(
    'div',
    {
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '16px 18px',
      borderRadius: 10,
      width: '100%',
      border: `${checked ? 2 : 1}px solid ${checked ? t.borderStrong : t.border}`,
    },
    [
      radio(t, checked),
      h('div', { display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }, [
        bar(`${labelWidth}%`, 14, checked ? t.skeletonStrong : t.skeleton),
        ...(descriptionWidth ? [bar(`${descriptionWidth}%`, 10, t.skeleton)] : []),
      ]),
    ]
  )

const voteButton = (t, label) =>
  h(
    'div',
    {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: 52,
      width: '100%',
      padding: '0 28px',
      borderRadius: 8,
      background: t.buttonBg,
      color: t.buttonFg,
      fontSize: 20,
      fontWeight: 600,
    },
    [label]
  )

const ballot = (t, voteLabel, width) =>
  h(
    'div',
    {
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      width,
      padding: 28,
      borderRadius: 16,
      background: t.cardBg,
      border: `1px solid ${t.border}`,
      boxShadow: t.shadow,
    },
    [
      h('div', { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 8 }, [
        bar('70%', 18, t.skeletonStrong),
        bar('46%', 12, t.skeleton),
      ]),
      choice(t, false, 44, 28),
      choice(t, true, 58, 34),
      choice(t, false, 36, 0),
      h('div', { display: 'flex', marginTop: 8 }, [voteButton(t, voteLabel)]),
    ]
  )

// Estimate-only sentence split for mockups; the generator passes measured lines instead.
const estimateHeadlineLines = (title, maxWidth, size) => {
  const sentences = splitSentences(title)
  if (sentences.length < 2) return [title]
  const perChar = /\p{Script=Greek}/u.test(title) ? 0.5 : 0.46
  return sentences.every((sentence) => sentence.length * perChar * size <= maxWidth) ? sentences : [title]
}

const headline = (copy, t, maxWidth, fit) => {
  const size = fit?.size ?? estimateHeadlineSize(copy.title, maxWidth)
  const lines = fit?.lines ?? estimateHeadlineLines(copy.title, maxWidth, size)
  const textStyle = { fontSize: size, fontWeight: 500, lineHeight: 1.08, letterSpacing: -(size * 0.025), color: t.fg }
  return h('div', { display: 'flex', flexDirection: 'column', gap: 22, width: maxWidth }, [
    h(
      'div',
      { display: 'flex', flexDirection: 'column' },
      lines.map((line) => h('div', textStyle, [line]))
    ),
    h('div', { fontSize: 24, lineHeight: 1.4, color: t.muted, fontWeight: 400 }, [copy.tagline]),
  ])
}

/**
 * @param {{ title: string, tagline: string, vote: string }} copy localized strings
 * @param {{ logo: string, theme?: keyof typeof themes, headline?: { size: number, lines: string[] } }} options
 *   logo as a data URI; `headline` is the result of `fitHeadline` (measured), estimated when absent
 */
export const buildOpenGraphCard = (copy, { logo: logoSrc, theme = 'light', headline: fit }) => {
  const t = themes[theme]
  const layers = []
  if (t.glow) {
    layers.push(
      h('div', {
        position: 'absolute',
        left: 520,
        top: -160,
        width: 1000,
        height: 1000,
        borderRadius: 9999,
        background: t.glow,
      })
    )
  }
  layers.push(
    h('div', { position: 'absolute', left: 72, top: 72, display: 'flex' }, [logo(logoSrc, 40)]),
    h('div', { display: 'flex', width: WIDTH, height: HEIGHT, padding: 72, gap: 56 }, [
      h(
        'div',
        { display: 'flex', flexDirection: 'column', justifyContent: 'center', width: HEADLINE_WIDTH, paddingTop: 40 },
        [headline(copy, t, HEADLINE_WIDTH, fit)]
      ),
      h('div', { display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-end' }, [
        ballot(t, copy.vote, 400),
      ]),
    ])
  )
  return h(
    'div',
    {
      width: WIDTH,
      height: HEIGHT,
      display: 'flex',
      background: t.canvas ?? t.bg,
      fontFamily: 'Inter',
      color: t.fg,
      position: 'relative',
      overflow: 'hidden',
    },
    layers
  )
}

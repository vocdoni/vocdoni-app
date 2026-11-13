import cyrillicExt300 from '@fontsource/inter/files/inter-cyrillic-ext-300-normal.woff2?url'
import cyrillicExt400 from '@fontsource/inter/files/inter-cyrillic-ext-400-normal.woff2?url'
import cyrillicExt500 from '@fontsource/inter/files/inter-cyrillic-ext-500-normal.woff2?url'
import cyrillic300 from '@fontsource/inter/files/inter-cyrillic-300-normal.woff2?url'
import cyrillic400 from '@fontsource/inter/files/inter-cyrillic-400-normal.woff2?url'
import cyrillic500 from '@fontsource/inter/files/inter-cyrillic-500-normal.woff2?url'
import greekExt300 from '@fontsource/inter/files/inter-greek-ext-300-normal.woff2?url'
import greekExt400 from '@fontsource/inter/files/inter-greek-ext-400-normal.woff2?url'
import greekExt500 from '@fontsource/inter/files/inter-greek-ext-500-normal.woff2?url'
import greek300 from '@fontsource/inter/files/inter-greek-300-normal.woff2?url'
import greek400 from '@fontsource/inter/files/inter-greek-400-normal.woff2?url'
import greek500 from '@fontsource/inter/files/inter-greek-500-normal.woff2?url'
import vietnamese300 from '@fontsource/inter/files/inter-vietnamese-300-normal.woff2?url'
import vietnamese400 from '@fontsource/inter/files/inter-vietnamese-400-normal.woff2?url'
import vietnamese500 from '@fontsource/inter/files/inter-vietnamese-500-normal.woff2?url'
import latinExt300 from '@fontsource/inter/files/inter-latin-ext-300-normal.woff2?url'
import latinExt400 from '@fontsource/inter/files/inter-latin-ext-400-normal.woff2?url'
import latinExt500 from '@fontsource/inter/files/inter-latin-ext-500-normal.woff2?url'

// Every non-Latin Inter subset, declared after hydration. @fontsource's per-subset CSS (latin-ext-400.css...)
// has no unicode-range, so importing it would replace the Latin face for every character. These faces carry the
// ranges from @fontsource/inter/unicode.json instead, so a browser downloads one only when a glyph needs it.
// Content language is not UI language (a Greek vote read in English still needs Greek glyphs), hence all of them.
// Declaration order follows @fontsource's own CSS, where later faces win on overlapping ranges.
const SUBSETS = [
  {
    range: 'U+0460-052F,U+1C80-1C8A,U+20B4,U+2DE0-2DFF,U+A640-A69F,U+FE2E-FE2F',
    files: { 300: cyrillicExt300, 400: cyrillicExt400, 500: cyrillicExt500 },
  },
  {
    range: 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116',
    files: { 300: cyrillic300, 400: cyrillic400, 500: cyrillic500 },
  },
  {
    range: 'U+1F00-1FFF',
    files: { 300: greekExt300, 400: greekExt400, 500: greekExt500 },
  },
  {
    range: 'U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF',
    files: { 300: greek300, 400: greek400, 500: greek500 },
  },
  {
    range:
      'U+0102-0103,U+0110-0111,U+0128-0129,U+0168-0169,U+01A0-01A1,U+01AF-01B0,U+0300-0301,U+0303-0304,U+0308-0309,U+0323,U+0329,U+1EA0-1EF9,U+20AB',
    files: { 300: vietnamese300, 400: vietnamese400, 500: vietnamese500 },
  },
  {
    range:
      'U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF',
    files: { 300: latinExt300, 400: latinExt400, 500: latinExt500 },
  },
] as const

export const loadInterSubsets = () => {
  if (typeof document === 'undefined') return
  if (document.head.querySelector('style[data-inter-subsets]')) return

  const css = SUBSETS.flatMap(({ range, files }) =>
    Object.entries(files).map(
      ([weight, url]) =>
        `@font-face {\n  font-family: 'Inter';\n  font-style: normal;\n  font-display: swap;\n  font-weight: ${weight};\n  src: url(${url}) format('woff2');\n  unicode-range: ${range};\n}`
    )
  ).join('\n')

  const style = document.createElement('style')
  style.dataset.interSubsets = ''
  style.textContent = css
  document.head.appendChild(style)
}

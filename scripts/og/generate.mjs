/**
 * Renders the localized Open Graph images the SSR head points at (`/assets/og/<lang>.png`), one
 * per locale directory in `src/i18n/locales/`. The copy comes from each locale's `og.headline` and
 * `og.tagline` in `common.json` and the `vote.button` label from `react-components.json`, so re-run
 * it after changing any of those, then review the PNGs by eye. The headline size is measured with
 * satori itself (measure.mjs) so it takes two lines whenever 42px or more allows it.
 *
 *   pnpm og:generate            # all locales, tinted theme (the default)
 *   pnpm og:generate -- --theme light   # or `dark`; see themes in template.mjs
 *
 * satori lays the card out from a flex tree and resvg rasterises it, so the output is identical
 * on every machine. Inter comes from the `@fontsource/inter` package the app already ships; the
 * subsets are registered under separate family names because satori keeps one font per
 * (family, weight) and falls back to the other families for glyphs it lacks (Greek, Latin Extended).
 */
import { Resvg } from '@resvg/resvg-js'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import satori from 'satori'
import { createLineCounter } from './measure.mjs'
import { buildOpenGraphCard, fitHeadline, HEIGHT, themes, WIDTH } from './template.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const localesDir = join(root, 'src/i18n/locales')
const outDir = join(root, 'public/assets/og')

const themeArg = process.argv.indexOf('--theme')
const theme = themeArg === -1 ? 'tinted' : process.argv[themeArg + 1]
if (!themes[theme]) {
  console.error(`Unknown theme "${theme}". Available: ${Object.keys(themes).join(', ')}.`)
  process.exit(1)
}

const fontDir = join(root, 'node_modules/@fontsource/inter/files')
const fonts = []
for (const [subset, name] of [
  ['latin', 'Inter'],
  ['latin-ext', 'Inter Latin Extended'],
  ['greek', 'Inter Greek'],
]) {
  for (const weight of [400, 500, 600]) {
    fonts.push({
      name,
      weight,
      style: 'normal',
      data: readFileSync(join(fontDir, `inter-${subset}-${weight}-normal.woff`)),
    })
  }
}

const logoFile = theme === 'dark' ? 'logo-classic-white.svg' : 'logo-classic.svg'
const logo = `data:image/svg+xml;base64,${readFileSync(join(root, 'public/assets', logoFile)).toString('base64')}`

const readJson = (file) => (existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : {})

const copyFor = (lang) => {
  const common = readJson(join(localesDir, lang, 'common.json'))
  const components = readJson(join(localesDir, lang, 'react-components.json'))
  const title = common.og?.headline
  const tagline = common.og?.tagline
  const vote = components.vote?.button
  if (!title || !tagline) throw new Error(`${lang}/common.json has no og.headline / og.tagline`)
  if (!vote) throw new Error(`${lang}/react-components.json has no vote.button`)
  return { title, tagline, vote }
}

const languages = readdirSync(localesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(localesDir, entry.name, 'common.json')))
  .map((entry) => entry.name)
  .sort()

mkdirSync(outDir, { recursive: true })

const countLines = createLineCounter(fonts)

for (const lang of languages) {
  const copy = copyFor(lang)
  const headline = await fitHeadline(copy.title, countLines)
  const svg = await satori(buildOpenGraphCard(copy, { logo, theme, headline }), { width: WIDTH, height: HEIGHT, fonts })
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng()
  const file = join(outDir, `${lang}.png`)
  writeFileSync(file, png)
  console.log(
    `${lang.padEnd(6)} ${(png.length / 1024).toFixed(0).padStart(4)} KB  ${String(headline.size).padStart(2)}px/${headline.lines.length}  ${copy.title}  [${copy.vote}]`
  )
}

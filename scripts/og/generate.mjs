/**
 * Renders the localized Open Graph images the SSR head points at (`/assets/og/<lang>.png`), one
 * per locale directory in `src/i18n/locales/`. The copy comes from each locale's `head.title`
 * (headline, without the "Vocdoni |" prefix), the first sentence of `head.description` (tagline)
 * and the `vote.button` label from `react-components.json`, so re-run it after changing any of
 * those, then review the PNGs by eye (long words can push a headline to a third line).
 *
 *   pnpm og:generate            # all locales, light theme
 *   pnpm og:generate -- --theme dark   # or `tinted`; see themes in template.mjs
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
import { buildOpenGraphCard, HEIGHT, themes, WIDTH } from './template.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const localesDir = join(root, 'src/i18n/locales')
const outDir = join(root, 'public/assets/og')

const themeArg = process.argv.indexOf('--theme')
const theme = themeArg === -1 ? 'light' : process.argv[themeArg + 1]
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
  const title = common.head?.title
  const description = common.head?.description
  if (!title || !description) throw new Error(`${lang}/common.json has no head.title / head.description`)
  return {
    title: title.replace(/^Vocdoni\s*\|\s*/, ''),
    tagline: description.split(/(?<=\.)\s+/)[0],
    vote: components.vote?.button || 'Vote',
  }
}

const languages = readdirSync(localesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(join(localesDir, entry.name, 'common.json')))
  .map((entry) => entry.name)
  .sort()

mkdirSync(outDir, { recursive: true })

for (const lang of languages) {
  const copy = copyFor(lang)
  const svg = await satori(buildOpenGraphCard(copy, { logo, theme }), { width: WIDTH, height: HEIGHT, fonts })
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: WIDTH } }).render().asPng()
  const file = join(outDir, `${lang}.png`)
  writeFileSync(file, png)
  console.log(`${lang.padEnd(6)} ${(png.length / 1024).toFixed(0).padStart(4)} KB  ${copy.title}  [${copy.vote}]`)
}

/**
 * Regenerates the panel surface tones in `src/theme/logoTones.ts` from the customer logos in
 * `public/assets/verticals/logos/`.
 *
 * Each tone is the logo's dominant hue driven down to a deep, desaturated surface that carries
 * white type. Run it after replacing the artwork, then review every changed value on screen — the
 * yellow-green band needs the correction below to avoid reading as mud, and new artwork may need
 * the thresholds revisited.
 *
 *   node scripts/logo-tones.mjs          # print the table
 *   node scripts/logo-tones.mjs --write  # rewrite src/theme/logoTones.ts in place
 *
 * Decoding leans on macOS `sips` to turn each webp into an uncompressed BMP, so the script stays
 * dependency-free. On another platform, swap `decode()` for `sharp().raw()`.
 */
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const logoDir = join(root, 'public/assets/verticals/logos')
const target = join(root, 'src/theme/logoTones.ts')

/** webp -> BMP via sips, then parse the pixels directly. Returns a row-major array of [r,g,b,a]. */
const decode = (file, work) => {
  const bmp = join(work, 'f.bmp')
  execFileSync('sips', ['-s', 'format', 'bmp', file, '--out', bmp], { stdio: 'ignore' })
  const buf = readFileSync(bmp)
  const offset = buf.readUInt32LE(10)
  const width = buf.readInt32LE(18)
  const height = Math.abs(buf.readInt32LE(22))
  const bpp = buf.readUInt16LE(28)
  const stride = Math.floor((bpp * width + 31) / 32) * 4
  const px = []
  for (let y = 0; y < height; y++) {
    const row = offset + (height - 1 - y) * stride
    for (let x = 0; x < width; x++) {
      const i = row + x * (bpp / 8)
      px.push([buf[i + 2], buf[i + 1], buf[i], bpp === 32 ? buf[i + 3] : 255])
    }
  }
  return px
}

const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255
  const mx = Math.max(r, g, b)
  const mn = Math.min(r, g, b)
  const l = (mx + mn) / 2
  const d = mx - mn
  if (!d) return [0, 0, l]
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
  return [h * 60, s, l]
}

const hslToHex = (h, s, l) => {
  const a = s * Math.min(l, 1 - l)
  const f = (n) => {
    const k = (n + h / 30) % 12
    const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

const toneOf = (pixels) => {
  // Circular mean of hue, weighted by saturation squared, ignoring transparent pixels and the
  // near-white / near-black ends that every mark has regardless of its brand colour.
  let x = 0
  let y = 0
  let sat = 0
  let n = 0
  for (const [r, g, b, a] of pixels) {
    if (a < 128) continue
    const [h, s, l] = rgbToHsl(r, g, b)
    if (s < 0.15 || l < 0.08 || l > 0.94) continue
    const w = s * s
    x += Math.cos((h * Math.PI) / 180) * w
    y += Math.sin((h * Math.PI) / 180) * w
    sat += s * w
    n += w
  }
  if (!n) return '#141414'
  let hue = (Math.atan2(y, x) * 180) / Math.PI
  if (hue < 0) hue += 360
  // Yellow through green goes olive when darkened, so that band keeps far less chroma and sits a
  // touch lighter. Everything else can hold its colour.
  const muddy = hue >= 45 && hue <= 165
  return hslToHex(hue, muddy ? Math.min(0.16, (sat / n) * 0.35) : Math.min(0.4, (sat / n) * 0.6), muddy ? 0.145 : 0.135)
}

const work = mkdtempSync(join(tmpdir(), 'logo-tones-'))
let tones
try {
  tones = readdirSync(logoDir)
    .filter((f) => f.endsWith('.webp'))
    .sort()
    .map((f) => [f.replace(/\.webp$/, ''), toneOf(decode(join(logoDir, f), work))])
} finally {
  rmSync(work, { recursive: true, force: true })
}

const body = tones.map(([id, hex]) => `  ${id}: '${hex}',`).join('\n')

if (process.argv.includes('--write')) {
  const src = readFileSync(target, 'utf8')
  writeFileSync(target, src.replace(/(export const LogoTones: Record<string, string> = \{\n)[\s\S]*?(\n\})/, `$1${body}$2`))
  console.log(`Wrote ${tones.length} tones to src/theme/logoTones.ts — review them on screen before committing.`)
} else {
  console.log(body)
}

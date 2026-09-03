import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { VerticalSlugs } from '~constants/verticals'
import { renderHook } from '~src/test-utils'
import { system } from '~theme/system'
import { useVerticalCopy } from './copy'
import { baseLanguages } from '~i18n/languages'
import { GenericLogos, getWithheldLogos, MinVerticalLogos, TrustLogos } from './logos'
import { GenericAccent, VerticalRegistry } from './registry'
import { useAuthTestimonials } from './testimonials'

/**
 * Data-integrity guards for the vertical content layer, in the spirit of `src/theme/system.test.ts`:
 * these are all mistakes that fail silently in the browser — a missing logo renders a broken image,
 * a dangling accent token renders no gradient, a template-literal i18n key ships untranslated.
 */

const publicDir = resolve(__dirname, '../../../../public')
const sourceDir = __dirname
const slugs = new Set<string>(VerticalSlugs)

const testimonials = renderHook(() => useAuthTestimonials()).result.current
const copy = renderHook(() => useVerticalCopy()).result.current

describe('trust logos', () => {
  it('serves every logo from public/', () => {
    for (const logo of Object.values(TrustLogos)) {
      expect(existsSync(resolve(publicDir, `.${logo.src}`)), `missing asset for "${logo.id}": ${logo.src}`).toBe(true)
    }
  })

  it('keys the catalogue by the logo id', () => {
    for (const [key, logo] of Object.entries(TrustLogos)) {
      expect(logo.id).toBe(key)
      expect(logo.name.trim()).not.toBe('')
    }
  })

  it('has a generic pool big enough to stand on its own', () => {
    // The generic row is the only social proof a visitor with no `?type=` sees, so it carries the
    // whole catalogue. The floor is well above what the narrow breakpoints show on purpose: it is
    // the desktop row that has to look like a customer list rather than a handful of logos.
    expect(GenericLogos.length).toBeGreaterThanOrEqual(14)
    expect(GenericLogos.length).toBeGreaterThanOrEqual(MinVerticalLogos)
    for (const id of GenericLogos) {
      expect(TrustLogos, `unknown logo id in GenericLogos: "${id}"`).toHaveProperty(id)
    }
    expect(new Set(GenericLogos).size).toBe(GenericLogos.length)
  })

  // Leaving a customer out of the cross-sector row buys nothing — it is the row shown when we have
  // no sector to speak to, so it should name everyone we can.
  it('puts the whole catalogue in the generic row', () => {
    expect(new Set(GenericLogos)).toEqual(new Set(Object.keys(TrustLogos)))
  })

  it('keeps the generic row at fourteen logos or more in every language', () => {
    for (const language of Object.keys(baseLanguages)) {
      const shown = GenericLogos.filter((id) => !getWithheldLogos(language).has(id))
      expect(shown.length, `"${language}" shows only ${shown.length} logos`).toBeGreaterThanOrEqual(14)
    }
  })
})

describe('testimonials', () => {
  it('has unique ids', () => {
    const ids = testimonials.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('references a known logo and known verticals', () => {
    for (const testimonial of testimonials) {
      expect(TrustLogos, `unknown logo "${testimonial.logo}" on testimonial "${testimonial.id}"`).toHaveProperty(
        testimonial.logo
      )
      expect(testimonial.verticals.length).toBeGreaterThan(0)
      for (const vertical of testimonial.verticals) {
        expect(slugs.has(vertical), `unknown vertical "${vertical}" on testimonial "${testimonial.id}"`).toBe(true)
      }
    }
  })

  it('resolves every string, so no key is left unrendered', () => {
    for (const testimonial of testimonials) {
      for (const field of ['author', 'position', 'company', 'quote'] as const) {
        expect(testimonial[field].trim(), `empty ${field} on testimonial "${testimonial.id}"`).not.toBe('')
      }
    }
  })

  it('serves every portrait from public/', () => {
    for (const { id, portrait } of testimonials) {
      if (!portrait) continue
      expect(existsSync(resolve(publicDir, `.${portrait}`)), `missing portrait for "${id}": ${portrait}`).toBe(true)
    }
  })

  // The showcase picks a quote by vertical but takes the eyebrow from `copy.ts`. A sector-specific
  // quote under the generic eyebrow is the half-personalized state this pairing exists to prevent.
  it('has copy for every vertical it can show a quote for', () => {
    for (const vertical of new Set(testimonials.flatMap((t) => t.verticals))) {
      expect(copy, `"${vertical}" has a testimonial but no copy`).toHaveProperty(vertical)
    }
  })

  it('keeps a testimonial available for every vertical we have registered', () => {
    for (const slug of Object.keys(VerticalRegistry)) {
      const pool = testimonials.filter((t) => t.verticals.includes(slug as never))
      expect(pool.length, `no testimonial tagged "${slug}"`).toBeGreaterThan(0)
    }
  })
})

describe('vertical registry', () => {
  it('only registers verticals it can fully back', () => {
    for (const [slug, content] of Object.entries(VerticalRegistry)) {
      expect(slugs.has(slug), `unknown vertical "${slug}"`).toBe(true)
      // Fewer than this and `useAuthVertical` degrades to the generic set, making the entry a no-op
      expect(content.logos.length, `"${slug}" has too few logos to show its own set`).toBeGreaterThanOrEqual(
        MinVerticalLogos
      )
      for (const id of content.logos) {
        expect(TrustLogos, `unknown logo "${id}" on vertical "${slug}"`).toHaveProperty(id)
      }
      expect(new Set(content.logos).size).toBe(content.logos.length)
      expect(copy, `"${slug}" is registered but has no copy`).toHaveProperty(slug)
    }
  })

  /**
   * Customers we show a logo for but hold no quote from. The trust bar is a customer list, not an
   * endorsement, so a logo without a quote is fine — but nothing else can vouch for the pairing,
   * so it is named here deliberately rather than inferred.
   */
  const UnquotedCustomers: Record<string, string> = {
    bcn: 'public-administration',
    berga: 'public-administration',
    barca: 'sports-clubs',
    alhora: 'political-parties',
    partit_pirata: 'political-parties',
  }

  // What keeps a row honest now that length is not the gate: a sector's row may only name that
  // sector's own customers. Borrowing one would make the sentence above it claim a sector trusts us
  // on someone else's behalf.
  it('only shows a vertical logos that belong to it', () => {
    for (const [slug, content] of Object.entries(VerticalRegistry)) {
      const own = new Set(testimonials.filter((t) => t.verticals.includes(slug as never)).map((t) => t.logo))
      for (const id of content.logos) {
        const vouched = own.has(id) || UnquotedCustomers[id] === slug
        expect(vouched, `"${id}" is in the "${slug}" row but nothing ties it to that vertical`).toBe(true)
      }
    }
  })

  // The showcase reads exactly one accent shade — the `.900` surface it falls back to when a logo
  // has no `LogoTones` entry (see `AuthShowcase`). Guarding shades nothing reads would let a
  // missing `.900` ship a panel with no colour behind white type.
  it('resolves the accent surface the showcase falls back to', () => {
    const accents = [GenericAccent, ...Object.values(VerticalRegistry).map((content) => content.accent)]
    for (const accent of accents) {
      const token = `colors.${accent}.900`
      expect(system.tokens.getByName(token), `dangling token: ${token}`).toBeDefined()
    }
  })
})

describe('vertical copy', () => {
  it('always has the generic fallback filled in', () => {
    for (const field of ['label', 'trustBar'] as const) {
      expect(copy.generic[field].trim()).not.toBe('')
    }
  })

  it('introduces the logo row with a colon', () => {
    for (const entry of Object.values(copy)) {
      expect(entry.trustBar.trim().endsWith(':'), `trust bar copy must end with a colon: "${entry.trustBar}"`).toBe(
        true
      )
    }
  })

  // A key the extractor could not statically resolve lands in the locale files verbatim, brackets
  // and all — the loudest symptom of the mistake the two tests below try to prevent.
  it('leaves no unresolved key in the extracted locale', () => {
    const locale = readFileSync(resolve(__dirname, '../../../i18n/locales/en/common.json'), 'utf-8')

    expect(locale).not.toContain('${')
  })

  // `pnpm translations` extracts keys by static analysis: a template-literal key works in dev, where
  // the default value is inline, and ships empty in all 10 locales.
  it.each(['copy.ts', 'testimonials.ts'])('uses only static i18n keys in %s', (file) => {
    // Comments stripped first — they document the rule by showing the forbidden form
    const source = readFileSync(resolve(sourceDir, file), 'utf-8')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '')
    expect(source).not.toMatch(/\bt\(\s*`/)
    for (const [, key] of source.matchAll(/\bt\(\s*'([^']+)'/g)) {
      expect(key).not.toContain('${')
    }
  })
})

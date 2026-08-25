import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { VerticalSlugs } from '~constants/verticals'
import { renderHook } from '~src/test-utils'
import { system } from '~theme/system'
import { useVerticalCopy } from './copy'
import { GenericLogos, MinVerticalLogos, TrustLogos } from './logos'
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
    expect(GenericLogos.length).toBeGreaterThanOrEqual(MinVerticalLogos)
    for (const id of GenericLogos) {
      expect(TrustLogos, `unknown logo id in GenericLogos: "${id}"`).toHaveProperty(id)
    }
    expect(new Set(GenericLogos).size).toBe(GenericLogos.length)
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

  it('resolves every accent shade the showcase reads', () => {
    const accents = [GenericAccent, ...Object.values(VerticalRegistry).map((content) => content.accent)]
    for (const accent of accents) {
      for (const shade of [200, 300, 500, 700]) {
        const token = `colors.${accent}.${shade}`
        expect(system.tokens.getByName(token), `dangling token: ${token}`).toBeDefined()
      }
    }
  })
})

describe('vertical copy', () => {
  it('always has the generic fallback filled in', () => {
    for (const field of ['label', 'headline', 'trustBar'] as const) {
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

import { describe, expect, it } from 'vitest'
import { resolveVerticalSlug, VerticalSlugs, withVerticalParam } from './verticals'

describe('resolveVerticalSlug', () => {
  it('resolves every known slug to itself', () => {
    for (const slug of VerticalSlugs) {
      expect(resolveVerticalSlug(slug)).toBe(slug)
    }
  })

  it('resolves the vocdoni.io solutions slugs', () => {
    expect(resolveVerticalSlug('professional-colleges')).toBe('professional-associations')
    expect(resolveVerticalSlug('municipalities')).toBe('public-administration')
    expect(resolveVerticalSlug('universities')).toBe('universities-schools')
    expect(resolveVerticalSlug('city-councils')).toBe('public-administration')
  })

  it('resolves singular forms', () => {
    expect(resolveVerticalSlug('federation')).toBe('federations')
    expect(resolveVerticalSlug('association')).toBe('associations')
    expect(resolveVerticalSlug('cooperative')).toBe('cooperatives')
    expect(resolveVerticalSlug('ngo')).toBe('ngos')
    expect(resolveVerticalSlug('chamber')).toBe('chambers')
  })

  it('normalizes casing, underscores and whitespace', () => {
    expect(resolveVerticalSlug('Professional_Associations')).toBe('professional-associations')
    expect(resolveVerticalSlug('  NGOS  ')).toBe('ngos')
    expect(resolveVerticalSlug('trade unions')).toBe('trade-unions')
    expect(resolveVerticalSlug('sports--clubs')).toBe('sports-clubs')
  })

  it('returns null for empty input', () => {
    expect(resolveVerticalSlug()).toBeNull()
    expect(resolveVerticalSlug(null)).toBeNull()
    expect(resolveVerticalSlug('')).toBeNull()
    expect(resolveVerticalSlug('   ')).toBeNull()
    expect(resolveVerticalSlug('---')).toBeNull()
  })

  it('returns null for unknown or hostile values', () => {
    expect(resolveVerticalSlug('banana')).toBeNull()
    expect(resolveVerticalSlug('companies-agm')).toBeNull()
    expect(resolveVerticalSlug('<script>alert(1)</script>')).toBeNull()
    expect(resolveVerticalSlug('../../etc/passwd')).toBeNull()
    expect(resolveVerticalSlug('__proto__')).toBeNull()
    expect(resolveVerticalSlug('constructor')).toBeNull()
  })
})

describe('withVerticalParam', () => {
  it('returns the path untouched without a slug', () => {
    expect(withVerticalParam('/account/signup')).toBe('/account/signup')
    expect(withVerticalParam('/account/signup', null)).toBe('/account/signup')
  })

  it('appends the vertical', () => {
    expect(withVerticalParam('/account/signup', 'ngos')).toBe('/account/signup?type=ngos')
  })

  it('preserves existing params and overrides a stale vertical', () => {
    expect(withVerticalParam('/account/signup?email=a%40b.com', 'ngos')).toBe(
      '/account/signup?email=a%40b.com&type=ngos'
    )
    expect(withVerticalParam('/account/signup?type=chambers', 'ngos')).toBe('/account/signup?type=ngos')
  })
})

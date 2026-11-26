import type { SystemStyleObject } from '@chakra-ui/react'
import { describe, expect, it } from 'vitest'
import { system } from './system'
import { textStyles } from './textStyles'

describe('text styles', () => {
  // A token name that does not exist is emitted as-is (e.g. `font-size: body`) and silently dropped.
  it.each(Object.keys(textStyles))('%s resolves every token it names', (name) => {
    const css = system.css({ textStyle: name as SystemStyleObject['textStyle'] }) as Record<string, unknown>
    const tokenProps = ['fontSize', 'fontFamily', 'fontWeight', 'letterSpacing'] as const
    // A responsive value sits under its media query, so look through nested objects.
    const values = (node: unknown, prop: string): unknown[] =>
      typeof node !== 'object' || node === null
        ? []
        : Object.entries(node).flatMap(([key, value]) => (key === prop ? [value] : values(value, prop)))
    expect(tokenProps.some((prop) => values(css, prop).length > 0)).toBe(true)
    for (const prop of tokenProps) {
      for (const value of values(css, prop)) expect(value, prop).toMatch(/^var\(--chakra-/)
    }
  })

  it('sets the control role in the control size on the running line height with no weight, and figures in mono at the small size', () => {
    expect(system.css({ textStyle: 'control' })).toEqual({
      fontSize: 'var(--chakra-font-sizes-control)',
      lineHeight: 'var(--chakra-line-heights-moderate)',
    })
    expect(system.token('lineHeights.moderate')).toBe(1.45)
    expect(system.css({ textStyle: 'figure' })).toEqual({
      fontFamily: 'var(--chakra-fonts-figure)',
      fontSize: 'var(--chakra-font-sizes-xs)',
      letterSpacing: 'var(--chakra-letter-spacings-none)',
    })
    expect(system.token('fontSizes.control')).toBe('0.84375rem')
    expect(system.token('fonts.figure')).not.toBe(system.token('fonts.body'))
  })

  it('has no uppercase role: Fil sets labels by size and weight', () => {
    for (const name of ['eyebrow', 'quote-label', 'separator-label', 'status-title']) {
      expect(system.css({ textStyle: name as SystemStyleObject['textStyle'] }), name).not.toHaveProperty(
        'textTransform'
      )
    }
  })

  it('sets titles in semibold with the tighter tracking of larger type', () => {
    const pageTitle = JSON.stringify(system.css({ textStyle: 'page-title' }))
    expect(pageTitle).toContain('var(--chakra-font-weights-semibold)')
    // Tighter from a tablet up, and on a 1.1 line (1.15 on a phone).
    expect(pageTitle).toContain('var(--chakra-letter-spacings-heading-page)')
    expect(pageTitle).toContain('var(--chakra-line-heights-page)')
    const sectionTitle = JSON.stringify(system.css({ textStyle: 'section-title' }))
    expect(sectionTitle).toContain('var(--chakra-font-sizes-control)')
    expect(sectionTitle).toContain('var(--chakra-font-weights-semibold)')
  })

  // Each role replaces the props one component set by hand, so it must emit exactly those declarations.
  it.each([
    ['quote-label', { textStyle: 'caption', fontWeight: 'medium' }],
    ['separator-label', { textStyle: 'caption', fontWeight: 'medium' }],
    ['status-title', { fontSize: 'xl', fontWeight: 'semibold' }],
    ['role-name', { fontWeight: 'semibold', textTransform: 'capitalize' }],
  ] as const)('%s renders what its component set by hand', (name, byHand) => {
    expect(system.css({ textStyle: name })).toEqual(system.css(byHand))
  })

  // The voter page (docs/ui-guidelines.md, "Voter page"): each role is the measure of boards V4Voter* and M4Voter*,
  // in the voter's tracking on the running line height unless it names its own.
  it.each([
    [
      'ballot-title',
      {
        fontSize: 'ballot.question',
        lineHeight: 'question',
        fontWeight: 'semibold',
        letterSpacing: 'heading.question',
      },
    ],
    ['ballot-kicker', { fontSize: 'md', lineHeight: 'moderate', fontWeight: 'medium', letterSpacing: 'voter' }],
    ['ballot-lead', { fontSize: 'ballot.lead', lineHeight: 'moderate', letterSpacing: 'voter' }],
    ['ballot-body', { fontSize: 'lg', lineHeight: 'moderate', letterSpacing: 'voter' }],
    ['ballot-hint', { fontSize: 'item', lineHeight: 'moderate', letterSpacing: 'voter' }],
    ['ballot-label', { fontSize: 'item', lineHeight: 'moderate', fontWeight: 'medium', letterSpacing: 'voter' }],
    ['ballot-button', { fontSize: 'ballot.option', lineHeight: 'moderate', letterSpacing: 'voter' }],
    ['ballot-progress', { fontSize: 'sm', lineHeight: 'moderate', fontWeight: 'medium', letterSpacing: 'voter' }],
    [
      'ballot-status',
      { fontSize: 'ballot.status', lineHeight: 'moderate', fontWeight: 'medium', letterSpacing: 'voter' },
    ],
    ['ballot-phase', { fontSize: 'ballot.option', lineHeight: 'moderate', letterSpacing: 'voter' }],
    [
      'ballot-open-title',
      { fontSize: 'vote', lineHeight: 'open-question', fontWeight: 'semibold', letterSpacing: 'heading.open' },
    ],
    ['ballot-caption', { fontSize: 'item', lineHeight: 'moderate', fontWeight: 'medium-plus', letterSpacing: 'voter' }],
    [
      'ballot-result-title',
      { fontSize: 'ballot.option', lineHeight: 'short', fontWeight: 'semibold', letterSpacing: 'heading.item' },
    ],
    [
      'ballot-code-digit',
      { fontFamily: 'figure', fontSize: 'ballot.code', lineHeight: 'moderate', letterSpacing: 'voter' },
    ],
    ['ballot-rank', { fontFamily: 'figure', fontSize: 'item', lineHeight: 'moderate', letterSpacing: 'voter' }],
    ['ballot-figure', { fontFamily: 'figure', fontSize: 'xs', lineHeight: 'moderate', letterSpacing: 'voter' }],
    [
      'ballot-figure-fold',
      { fontFamily: 'figure', fontSize: 'ballot.fold', lineHeight: 'moderate', letterSpacing: 'none' },
    ],
    ['ballot-receipt', { fontFamily: 'figure', fontSize: 'sm', lineHeight: 'moderate', letterSpacing: 'voter' }],
    ['ballot-code', { fontFamily: 'figure', fontSize: 'sm', lineHeight: 'moderate', letterSpacing: 'none' }],
    [
      'topbar-name',
      { fontSize: 'item', lineHeight: 'moderate', fontWeight: 'medium-plus', letterSpacing: 'heading.row' },
    ],
    ['topbar-link', { fontSize: 'md', lineHeight: 'moderate', fontWeight: 'medium', letterSpacing: 'voter' }],
    ['topbar-lang', { fontSize: 'sm', lineHeight: 'row.touch', fontWeight: 'medium', letterSpacing: 'voter' }],
  ] as const)('%s sets the voter board measures', (name, byHand) => {
    expect(system.css({ textStyle: name })).toEqual(system.css(byHand))
  })

  it.each([
    ['ballot-rail-title', 'item', 'ballot-option'],
    ['ballot-rail-meta', 'sm', 'md'],
    ['ballot-row-value', 'lg', 'ballot-option'],
  ] as const)('%s steps from %s to %s at lg', (name, base, lg) => {
    const css = system.css({ textStyle: name }) as Record<string, unknown>
    expect(css.fontSize).toBe(`var(--chakra-font-sizes-${base})`)
    expect(css['@media screen and (min-width: 64rem)']).toEqual({ fontSize: `var(--chakra-font-sizes-${lg})` })
  })

  it('keeps the voter type tokens at the boards values', () => {
    expect(system.token('fontSizes.ballot.lead')).toBe('1.125rem')
    expect(system.token('fontSizes.ballot.code')).toBe('1.625rem')
    expect(system.token('fontSizes.ballot.status')).toBe('0.84375rem')
    expect(system.token('letterSpacings.heading.open')).toBe('-0.02em')
    expect(system.token('lineHeights.row.touch')).toBe('1.375rem')
  })
})

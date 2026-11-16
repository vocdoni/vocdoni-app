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

  it('sets the control role in the control size with no weight, and figures in mono at the small size', () => {
    expect(system.css({ textStyle: 'control' })).toEqual({
      fontSize: 'var(--chakra-font-sizes-control)',
      lineHeight: '1.25rem',
    })
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
    expect(system.css({ textStyle: 'page-title' })).toMatchObject({
      fontWeight: 'var(--chakra-font-weights-semibold)',
      letterSpacing: 'var(--chakra-letter-spacings-heading-page)',
    })
    expect(system.css({ textStyle: 'section-title' })).toMatchObject({
      fontSize: 'var(--chakra-font-sizes-control)',
      fontWeight: 'var(--chakra-font-weights-semibold)',
    })
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
})

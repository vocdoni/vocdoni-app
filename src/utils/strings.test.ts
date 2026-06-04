import { describe, expect, it } from 'vitest'
import { normalizeEmail } from './strings'

describe('normalizeEmail', () => {
  it('lowercases the email', () => {
    expect(normalizeEmail('John.Doe@Example.COM')).toBe('john.doe@example.com')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeEmail('  user@example.com  ')).toBe('user@example.com')
  })

  it('trims and lowercases together', () => {
    expect(normalizeEmail('  Foo@Bar.io ')).toBe('foo@bar.io')
  })

  it('leaves an already-normalized email untouched', () => {
    expect(normalizeEmail('plain@example.com')).toBe('plain@example.com')
  })
})

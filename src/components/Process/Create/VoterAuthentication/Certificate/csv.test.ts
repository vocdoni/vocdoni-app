import { describe, expect, it } from 'vitest'
import { toCsv } from './csv'

describe('toCsv', () => {
  it('starts with a UTF-8 BOM', () => {
    expect(toCsv([['a']])).toMatch(/^﻿/)
  })

  it('wraps every cell in double quotes', () => {
    expect(toCsv([['Name', 'National ID']])).toBe('﻿"Name","National ID"')
  })

  it('doubles inner double-quote characters', () => {
    expect(toCsv([['A "q"', 'x,y']])).toBe('﻿"A ""q""","x,y"')
  })

  it('prefixes a single quote before cells starting with a formula trigger', () => {
    expect(toCsv([['=cmd()', '12345678Z']])).toBe('﻿"\'=cmd()","12345678Z"')
  })

  it('prefixes + - @ and tab as well', () => {
    expect(toCsv([['+foo', '-bar', '@baz', '\ttab']])).toBe('﻿"\'+foo","\'-bar","\'@baz","\'\ttab"')
  })

  it('joins rows with CRLF', () => {
    const result = toCsv([
      ['Name', 'National ID'],
      ['=cmd()', '12345678Z'],
      ['A "q"', 'x,y'],
    ])
    expect(result).toBe('﻿"Name","National ID"\r\n"\'=cmd()","12345678Z"\r\n"A ""q""","x,y"')
  })
})

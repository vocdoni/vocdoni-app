import { describe, expect, it } from 'vitest'
import editor from './editor'

describe('editor theme', () => {
  it('resets lexical paragraph margins for form-like fields', () => {
    expect(editor['& .lexical-paragraph']).toMatchObject({
      textStyle: 'sm',
      margin: 0,
    })
  })
})

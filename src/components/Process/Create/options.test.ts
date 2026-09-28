import type { TFunction } from 'i18next'
import { defaultQuestion } from './common'
import { insertPastedOptions, isQuestionEmpty, pruneEmptyOptions, splitPastedOptions, yesNoAbstain } from './options'

const opts = (...values: string[]) => values.map((option) => ({ option }))

describe('splitPastedOptions', () => {
  it('takes one option per line, dropping blank lines and list markers', () => {
    expect(splitPastedOptions('1. Anna Puig\n2) Jordi Serra\n\n- Marta Vidal\r\n• Pau Roca\n  Laia Font  ')).toEqual([
      'Anna Puig',
      'Jordi Serra',
      'Marta Vidal',
      'Pau Roca',
      'Laia Font',
    ])
  })

  it('keeps numbers that are part of the option', () => {
    expect(splitPastedOptions('2026 budget\n10% raise')).toEqual(['2026 budget', '10% raise'])
  })
})

describe('insertPastedOptions', () => {
  it('fills the empty option pasted into, then the next empty ones, then appends', () => {
    expect(insertPastedOptions(opts('', ''), 0, ['A', 'B', 'C'])).toEqual(opts('A', 'B', 'C'))
  })

  it('inserts after a filled option instead of overwriting it', () => {
    expect(insertPastedOptions(opts('Yes', 'No'), 0, ['Maybe', 'Later'])).toEqual(opts('Yes', 'Maybe', 'Later', 'No'))
  })

  it('does not change the options it was given', () => {
    const options = opts('', '')
    insertPastedOptions(options, 0, ['A'])
    expect(options).toEqual(opts('', ''))
  })
})

describe('pruneEmptyOptions', () => {
  it('drops options left empty', () => {
    expect(pruneEmptyOptions(opts('Yes', '', 'No', ' '))).toEqual(opts('Yes', 'No'))
  })

  it('keeps two fields for a question with fewer than two options', () => {
    expect(pruneEmptyOptions(opts('Yes', '', '', ''))).toEqual(opts('Yes', ''))
  })

  it('keeps an option that only has a photo or description so its missing title gets flagged', () => {
    const withImage = { option: '', image: 'https://img' }
    expect(pruneEmptyOptions([...opts('A', 'B'), withImage])).toEqual([...opts('A', 'B'), withImage])
  })
})

describe('isQuestionEmpty', () => {
  it('is empty until something is typed', () => {
    expect(isQuestionEmpty(defaultQuestion)).toBe(true)
    expect(isQuestionEmpty({ ...defaultQuestion, title: 'Approve?' })).toBe(false)
    expect(isQuestionEmpty({ ...defaultQuestion, options: opts('Yes', '') })).toBe(false)
  })
})

describe('yesNoAbstain', () => {
  it('gives the three standard options', () => {
    const t = ((_key: string, { defaultValue }: { defaultValue: string }) => defaultValue) as unknown as TFunction
    expect(yesNoAbstain(t)).toEqual(opts('Yes', 'No', 'Abstain'))
  })
})

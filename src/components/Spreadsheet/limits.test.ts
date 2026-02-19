import { enforceCsvRowLimit } from './limits'

describe('enforceCsvRowLimit', () => {
  it('throws when row count exceeds max', () => {
    expect(() =>
      enforceCsvRowLimit({
        rowCount: 11,
        max: 10,
        errorMessage: 'Too many rows',
      })
    ).toThrow('Too many rows')
  })

  it('throws when row count plus base count exceeds max', () => {
    expect(() =>
      enforceCsvRowLimit({
        rowCount: 900,
        max: 1000,
        baseCount: 200,
        errorMessage: 'Too many rows',
      } as unknown as Parameters<typeof enforceCsvRowLimit>[0])
    ).toThrow('Too many rows')
  })

  it('does not throw when row count equals max', () => {
    expect(() =>
      enforceCsvRowLimit({
        rowCount: 10,
        max: 10,
        errorMessage: 'Too many rows',
      })
    ).not.toThrow()
  })

  it('does not throw when max is undefined', () => {
    expect(() =>
      enforceCsvRowLimit({
        rowCount: 10,
        max: undefined,
        errorMessage: 'Too many rows',
      })
    ).not.toThrow()
  })

  it('does not throw when max is 0', () => {
    expect(() =>
      enforceCsvRowLimit({
        rowCount: 10,
        max: 0,
        errorMessage: 'Too many rows',
      })
    ).not.toThrow()
  })
})

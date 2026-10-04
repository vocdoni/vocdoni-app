import { MAX_LOOKUPS, splitLookupValues } from './VoterLookup'

describe('splitLookupValues', () => {
  it('splits on commas, semicolons and new lines, trimming each value', () => {
    expect(splitLookupValues(' anna@x.org, jordi@x.org;pere@x.org\nnuria@x.org ')).toEqual([
      'anna@x.org',
      'jordi@x.org',
      'pere@x.org',
      'nuria@x.org',
    ])
  })

  it('drops blanks and repeats', () => {
    expect(splitLookupValues('anna@x.org,,\n\nanna@x.org')).toEqual(['anna@x.org'])
  })

  it('caps the lookup at the limit', () => {
    const many = Array.from({ length: MAX_LOOKUPS + 5 }, (_, index) => `m${index}@x.org`).join(',')
    expect(splitLookupValues(many)).toHaveLength(MAX_LOOKUPS)
  })
})

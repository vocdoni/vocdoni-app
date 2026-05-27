import languages, { baseLanguages } from './languages'

describe('languages configuration', () => {
  it('exports the base language map', () => {
    expect(baseLanguages).toEqual({
      en: 'English',
      es: 'Español',
      ca: 'Català',
      it: 'Italiano',
      de: 'Deutsch',
    })
  })

  it('exports the list of language keys from the base map', () => {
    expect(languages).toEqual(Object.keys(baseLanguages))
  })
})

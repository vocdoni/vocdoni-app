import languages, { baseLanguages } from './languages'

describe('languages configuration', () => {
  it('exports the base language map', () => {
    expect(baseLanguages).toEqual({
      en: 'English',
      es: 'Spanish',
      ca: 'Catalan',
      it: 'Italiano',
    })
  })

  it('exports the list of language keys from the base map', () => {
    expect(languages).toEqual(Object.keys(baseLanguages))
  })
})

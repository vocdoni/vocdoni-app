import languages, { baseLanguages } from './languages'

describe('languages configuration', () => {
  it('exports the base language map', () => {
    expect(baseLanguages).toEqual({
      ca: 'Català',
      de: 'Deutsch',
      en: 'English',
      el: 'Ελληνικά',
      es: 'Español',
      eu: 'Euskara',
      fr: 'Français',
      it: 'Italiano',
      pt: 'Português',
    })
  })

  it('exports the list of language keys from the base map', () => {
    expect(languages).toEqual(Object.keys(baseLanguages))
  })
})

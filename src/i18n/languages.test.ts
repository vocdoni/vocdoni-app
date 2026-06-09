import languages, { baseLanguages } from './languages'

describe('languages configuration', () => {
  it('exports the base language map', () => {
    expect(baseLanguages).toEqual({
      ca: 'Català',
      de: 'Deutsch',
      el: 'Ελληνικά',
      en: 'English',
      es: 'Español',
      eu: 'Euskara',
      fr: 'Français',
      it: 'Italiano',
      pt: 'Português',
      'pt-br': 'Português (Brasil)',
    })
  })

  it('exports the list of language keys from the base map', () => {
    expect(languages).toEqual(Object.keys(baseLanguages))
  })
})

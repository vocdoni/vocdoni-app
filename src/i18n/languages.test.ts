import { inferOrgLanguage } from './languages'

const served = { languages: ['en', 'es', 'ca'], default: 'en' }

describe('inferOrgLanguage', () => {
  it('prefers the country-derived language', () => {
    expect(inferOrgLanguage('ES', served, 'ca')).toBe('es')
    expect(inferOrgLanguage('AD', served, 'es')).toBe('ca')
  })

  it('uses the UI language when the country gives no hint', () => {
    expect(inferOrgLanguage(undefined, served, 'ca')).toBe('ca')
    expect(inferOrgLanguage('DE', served, 'es')).toBe('es')
  })

  it('reduces regional UI languages to a served base language', () => {
    expect(inferOrgLanguage(undefined, served, 'es-AR')).toBe('es')
    expect(inferOrgLanguage(undefined, { languages: ['en', 'pt'], default: 'en' }, 'pt-br')).toBe('pt')
  })

  it('falls back to the API default for unserved or missing languages', () => {
    expect(inferOrgLanguage(undefined, served, 'de')).toBe('en')
    expect(inferOrgLanguage(undefined, served)).toBe('en')
    expect(inferOrgLanguage('ES', { languages: ['en'], default: 'en' }, 'fr')).toBe('en')
  })
})

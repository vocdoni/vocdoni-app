import { headerLogoFromBrand } from './headerOrganizationLogo'

describe('headerLogoFromBrand', () => {
  it('turns a brand with a logo into the header logo, named after the organisation', () => {
    expect(headerLogoFromBrand({ branded: true, name: 'Acme', logo: 'https://cdn.example/acme.png' })).toEqual({
      src: 'https://cdn.example/acme.png',
      name: 'Acme',
    })
  })

  it('keeps the logo without a name, so its alt text falls back', () => {
    expect(headerLogoFromBrand({ branded: false, name: '', logo: 'https://cdn.example/acme.png' })).toEqual({
      src: 'https://cdn.example/acme.png',
      name: undefined,
    })
  })

  it('keeps the Vocdoni mark when the brand shows no logo or there is no brand', () => {
    expect(headerLogoFromBrand({ branded: true, name: 'Acme', color: '#f5d90a' })).toBeUndefined()
    expect(headerLogoFromBrand(undefined)).toBeUndefined()
  })
})

import { resolveArchiveProcessBrand, resolveProcessBrand } from './process-brand'

const organization = {
  name: { default: 'Acme', ca: 'Acme CAT' },
  logo: { default: 'https://cdn.example/acme.png', ca: 'https://cdn.example/acme-ca.png' },
  color: '#F5D90A',
}
const branded = { addOns: { branding: true } }
const plain = { addOns: { branding: false } }
const OFF = { SHOW_ORG_LOGO: false }
const ON = { SHOW_ORG_LOGO: true }

describe('resolveProcessBrand', () => {
  it('brands a vote with the add-on: localised logo and the normalised colour', () => {
    expect(resolveProcessBrand(branded, organization, 'en', OFF)).toEqual({
      branded: true,
      name: 'Acme',
      logo: 'https://cdn.example/acme.png',
      color: '#f5d90a',
    })
  })

  it('keeps the Vocdoni mark and the deployment colour without the add-on or the flag', () => {
    for (const election of [plain, {}, { addOns: {} }]) {
      expect(resolveProcessBrand(election, organization, 'en', OFF)).toEqual({ branded: false, name: 'Acme' })
    }
  })

  it('shows the logo but never the colour when only SHOW_ORG_LOGO is on', () => {
    expect(resolveProcessBrand(plain, organization, 'en', ON)).toEqual({
      branded: false,
      name: 'Acme',
      logo: 'https://cdn.example/acme.png',
    })
  })

  it('treats anything but `branding: true` as off', () => {
    expect(resolveProcessBrand({ addOns: { branding: 'true' as never } }, organization, 'en', OFF).branded).toBe(false)
  })

  it.each(['red', 'rgb(0,0,0)', '#12', '#1234567', 'url(javascript:alert(1))', '', undefined])(
    'drops the invalid colour %s and keeps the rest of the brand',
    (color) => {
      const brand = resolveProcessBrand(branded, { ...organization, color }, 'en', OFF)
      expect(brand.color).toBeUndefined()
      expect(brand.branded).toBe(true)
      expect(brand.logo).toBe('https://cdn.example/acme.png')
    }
  )

  it('accepts the short and hashless forms the deployment colour accepts', () => {
    expect(resolveProcessBrand(branded, { ...organization, color: '#abc' }, 'en', OFF).color).toBe('#aabbcc')
    expect(resolveProcessBrand(branded, { ...organization, color: '1A73E8' }, 'en', OFF).color).toBe('#1a73e8')
  })

  it('picks the page language, then the base language, then the default entry', () => {
    expect(resolveProcessBrand(branded, organization, 'ca', OFF)).toMatchObject({
      name: 'Acme CAT',
      logo: 'https://cdn.example/acme-ca.png',
    })
    const portuguese = { name: { pt: 'Acme PT' }, logo: { pt: 'https://cdn.example/pt.png' } }
    expect(resolveProcessBrand(branded, portuguese, 'pt-br', OFF)).toMatchObject({
      name: 'Acme PT',
      logo: 'https://cdn.example/pt.png',
    })
    expect(resolveProcessBrand(branded, organization, 'eu', OFF).logo).toBe('https://cdn.example/acme.png')
  })

  it('leaves the logo out when the organisation has none, so the header keeps the Vocdoni mark', () => {
    for (const logo of [undefined, {}, { default: '   ' }]) {
      expect(resolveProcessBrand(branded, { ...organization, logo }, 'en', OFF).logo).toBeUndefined()
    }
    expect(resolveProcessBrand(branded, undefined, 'en', OFF)).toEqual({ branded: true, name: '' })
  })
})

describe('resolveArchiveProcessBrand', () => {
  const legacy = { address: '0x1', account: { avatar: ' https://cdn.example/old.png ', name: { default: 'Old' } } }

  it('shows the avatar only under SHOW_ORG_LOGO, and never brands or colours the page', () => {
    expect(resolveArchiveProcessBrand(legacy, 'en', ON)).toEqual({
      branded: false,
      name: 'Old',
      logo: 'https://cdn.example/old.png',
    })
    expect(resolveArchiveProcessBrand(legacy, 'en', OFF)).toEqual({ branded: false, name: 'Old' })
  })

  it('copes with a missing organisation or avatar', () => {
    expect(resolveArchiveProcessBrand(undefined, 'en', ON)).toEqual({ branded: false, name: '' })
    expect(resolveArchiveProcessBrand({ address: '0x1', account: {} }, 'en', ON)).toEqual({ branded: false, name: '' })
  })
})

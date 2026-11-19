import i18n from 'i18next'
import { AUTH_FIELDS, getAuthFieldLabel, getContactFieldLabel } from './fields'

const t = i18n.getFixedT('en')

describe('voter sign-in fields', () => {
  it('labels every auth field the builder offers', () => {
    for (const field of AUTH_FIELDS) {
      expect(getAuthFieldLabel(t, field)).not.toBe(field)
    }
  })

  it.each([
    [['email'], 'Email'],
    [['phone'], 'Phone'],
    [['email', 'phone'], 'Email or Phone'],
  ])('labels the contact input for %j as %s', (twoFaFields, expected) => {
    expect(getContactFieldLabel(t, twoFaFields)).toBe(expected)
  })
})

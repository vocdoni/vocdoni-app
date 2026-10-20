import i18n from 'i18next'
import { AUTH_FIELDS, getAuthFieldInputType, getAuthFieldLabel, getContactFieldLabel, passwordLast } from './fields'

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

  it('asks birth dates with a date picker', () => {
    expect(getAuthFieldInputType('birthDate')).toBe('date')
    expect(getAuthFieldInputType('memberNumber')).toBe('text')
  })

  it('masks the password and asks for it last', () => {
    expect(getAuthFieldInputType('password')).toBe('password')
    expect(passwordLast(['password', 'memberNumber', 'name'])).toEqual(['memberNumber', 'name', 'password'])
  })
})

import { renderHook } from '@testing-library/react'
import { getMemberField, MEMBER_FIELD_IDS, MEMBER_FIELDS, useMemberFields } from './fields'

describe('MEMBER_FIELDS', () => {
  it('keeps the API ids, in order', () => {
    expect(MEMBER_FIELDS.map((field) => field.id)).toEqual([...MEMBER_FIELD_IDS])
    expect(MEMBER_FIELD_IDS).toEqual([
      'name',
      'surname',
      'email',
      'phone',
      'memberNumber',
      'nationalId',
      'birthDate',
      'weight',
    ])
  })

  it('marks only the fields the server can sort by as sortable', () => {
    expect(MEMBER_FIELDS.filter((field) => field.sortable).map((field) => field.id)).toEqual([
      'name',
      'surname',
      'email',
      'memberNumber',
    ])
  })

  it('separates code channels from sign-in details', () => {
    expect(MEMBER_FIELDS.filter((field) => field.is2fa).map((field) => field.id)).toEqual(['email', 'phone'])
    expect(MEMBER_FIELDS.filter((field) => field.authEligible).map((field) => field.id)).toEqual([
      'name',
      'surname',
      'memberNumber',
      'nationalId',
      'birthDate',
    ])
  })

  it('masks sensitive values', () => {
    expect(getMemberField('phone')?.mask('a1b2c3')).toEqual({ kind: 'on_file' })
    expect(getMemberField('nationalId')?.mask('12345623A')).toEqual({ kind: 'masked', tail: '23A' })
    expect(getMemberField('birthDate')?.mask('1990-01-01')).toEqual({ kind: 'masked', tail: '' })
    expect(getMemberField('email')?.mask('ada@example.org')).toEqual({ kind: 'plain', text: 'ada@example.org' })
    expect(getMemberField('nationalId')?.mask('')).toEqual({ kind: 'empty' })
  })
})

describe('useMemberFields', () => {
  it('labels each field and formats masked values as text', () => {
    const { result } = renderHook(() => useMemberFields())
    const byId = Object.fromEntries(result.current.map((field) => [field.id, field]))

    expect(byId.name.label).toBe('First Name')
    expect(byId.phone.format('a1b2c3')).toBe('On file')
    expect(byId.phone.format(undefined)).toBe('')
    expect(byId.nationalId.format('12345623A')).toBe('•••23A')
    expect(byId.birthDate.format('1990-01-01')).toBe('•••')
    expect(byId.memberNumber.format('042')).toBe('042')
  })
})

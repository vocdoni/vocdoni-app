import { MEMBER_FIELD_IDS, type MemberFieldId } from '../fields'
import { autoMatch, isSensitiveHeader, normaliseHeader } from './autoMatch'

const LOCALES = ['en', 'ca', 'es', 'de', 'el', 'eu', 'fr', 'it', 'pt', 'pt-br']
const LABEL_KEYS: Record<MemberFieldId, string> = {
  name: 'firstname',
  surname: 'surname',
  email: 'email',
  phone: 'phone',
  memberNumber: 'member_number',
  nationalId: 'national_id',
  birthDate: 'birth_date',
  weight: 'weight',
}

const localeLabels = async (locale: string) => {
  const { default: common } = await import(`../../../i18n/locales/${locale}/common.json`)
  const fields = common.members.fields as Record<string, string>
  return Object.fromEntries(MEMBER_FIELD_IDS.map((id) => [id, fields[LABEL_KEYS[id]]])) as Record<MemberFieldId, string>
}

describe('normaliseHeader', () => {
  it('ignores accents, case and punctuation', () => {
    expect(normaliseHeader('Núm. Soci')).toBe('num soci')
    expect(normaliseHeader('Col·legiat')).toBe('collegiat')
    expect(normaliseHeader('  E-MAIL  ')).toBe('e mail')
  })
})

describe('autoMatch', () => {
  it.each(LOCALES)('matches every column of the %s template', async (locale) => {
    const labels = await localeLabels(locale)
    const headers = MEMBER_FIELD_IDS.map((id) => labels[id])

    const result = autoMatch(headers, labels)

    expect(result.targets).toEqual([...MEMBER_FIELD_IDS])
    expect(result.matched).toBe(MEMBER_FIELD_IDS.length)
    expect(result.isTemplate).toBe(true)
  })

  it('matches the English template without being told the labels', async () => {
    const labels = await localeLabels('en')
    const result = autoMatch(MEMBER_FIELD_IDS.map((id) => labels[id]))

    expect(result.targets).toEqual([...MEMBER_FIELD_IDS])
    expect(result.isTemplate).toBe(false)
  })

  it('matches Spanish headers from a professional body', () => {
    const headers = ['Nº colegiado', 'Nombre', 'Apellidos', 'Correo electrónico', 'Teléfono móvil', 'DNI', 'Quota 2026']
    expect(autoMatch(headers).targets).toEqual([
      'memberNumber',
      'name',
      'surname',
      'email',
      'phone',
      'nationalId',
      'skip',
    ])
  })

  it('matches Catalan headers from a sports club, with or without accents', () => {
    const headers = ['Núm. soci', 'Nom', 'Cognoms', 'Correu electronic', 'Mobil', 'Data de naixement', 'Vots']
    expect(autoMatch(headers).targets).toEqual([
      'memberNumber',
      'name',
      'surname',
      'email',
      'phone',
      'birthDate',
      'weight',
    ])
    expect(autoMatch(['NÚMERO DE COL·LEGIAT', 'e-mail']).targets).toEqual(['memberNumber', 'email'])
  })

  it('gives each field one column and leaves the rest out', () => {
    expect(autoMatch(['Email', 'Correo', 'Name']).targets).toEqual(['email', 'skip', 'name'])
  })

  it('reads a French "Nom" next to "Prénom" as the surname', () => {
    expect(autoMatch(['Prénom', 'Nom', 'Courriel']).targets).toEqual(['name', 'surname', 'email'])
  })

  it('does not match a generic word inside a longer header', () => {
    expect(autoMatch(['Nom del pare', 'Tipus de document']).targets).toEqual(['skip', 'skip'])
  })
})

describe('isSensitiveHeader', () => {
  it('flags money, health and free notes', () => {
    expect(isSensitiveHeader('IBAN')).toBe(true)
    expect(isSensitiveHeader('Compte bancari')).toBe(true)
    expect(isSensitiveHeader('Observacions')).toBe(true)
    expect(isSensitiveHeader('Salud')).toBe(true)
    expect(isSensitiveHeader('Quota 2026')).toBe(false)
  })
})

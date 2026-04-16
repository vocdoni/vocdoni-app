import { Routes } from './routes'
import { normalizeAuthRedirectTarget } from './authRedirects'

describe('normalizeAuthRedirectTarget', () => {
  it('forces localized admin paths back to the unprefixed admin namespace', () => {
    expect(normalizeAuthRedirectTarget('/ca/admin')).toBe('/admin')
    expect(normalizeAuthRedirectTarget('/ca/admin/processes/all')).toBe('/admin/processes/all')
    expect(normalizeAuthRedirectTarget('/en/admin/settings/team')).toBe('/admin/settings/team')
  })

  it('keeps public localized and auth paths unchanged', () => {
    expect(normalizeAuthRedirectTarget('/ca/processes/0xabc')).toBe('/ca/processes/0xabc')
    expect(normalizeAuthRedirectTarget('/account/signin')).toBe('/account/signin')
  })

  it('falls back to the dashboard base for empty values', () => {
    expect(normalizeAuthRedirectTarget(null)).toBe(Routes.dashboard.base)
    expect(normalizeAuthRedirectTarget('')).toBe(Routes.dashboard.base)
  })
})

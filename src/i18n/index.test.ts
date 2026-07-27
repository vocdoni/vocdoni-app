import { shouldEnableI18nDebug } from './index'

describe('shouldEnableI18nDebug', () => {
  it('disables i18next debug output in test mode', () => {
    expect(shouldEnableI18nDebug({ isDev: true, isTestEnv: true, isBrowser: true })).toBe(false)
  })

  it('keeps i18next debug output enabled for real dev runtime', () => {
    expect(shouldEnableI18nDebug({ isDev: true, isTestEnv: false, isBrowser: true })).toBe(true)
  })

  it('disables i18next debug output during server-side rendering', () => {
    expect(shouldEnableI18nDebug({ isDev: true, isTestEnv: false, isBrowser: false })).toBe(false)
  })
})

describe('createPageI18nInstance', () => {
  it('has common and react-components resources available immediately at init time', async () => {
    const { createPageI18nInstance } = await import('./index')
    const instance = createPageI18nInstance('en')

    expect(instance.t('menu.login')).toBe('Login')
    expect(instance.t('statuses.ongoing', { ns: 'react-components' })).toBe('Ongoing')
  })

  it('translates the SaaS READY status in every locale (deep merge over the SDK bundle)', async () => {
    const { createPageI18nInstance } = await import('./index')

    // `ready` is the SaaS wire name for a running process; the badge renders
    // `statuses.ready` when the backend emits it, so it must resolve everywhere.
    expect(createPageI18nInstance('en').t('statuses.ready', { ns: 'react-components' })).toBe('Ongoing')
    expect(createPageI18nInstance('es').t('statuses.ready', { ns: 'react-components' })).toBe('En curso')
    expect(createPageI18nInstance('ca').t('statuses.ready', { ns: 'react-components' })).toBe('En curs')
  })
})

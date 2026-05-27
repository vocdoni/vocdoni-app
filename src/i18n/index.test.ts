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
})

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

  it('translates the SaaS READY status in every locale', async () => {
    const { createPageI18nInstance } = await import('./index')

    // `ready` is the SaaS wire name for a running process; the badge renders
    // `statuses.ready` when the backend emits it, so it must resolve everywhere.
    expect(createPageI18nInstance('en').t('statuses.ready', { ns: 'react-components' })).toBe('Ongoing')
    expect(createPageI18nInstance('es').t('statuses.ready', { ns: 'react-components' })).toBe('En curso')
    expect(createPageI18nInstance('ca').t('statuses.ready', { ns: 'react-components' })).toBe('En curs')
  })

  it('keeps SDK keys the app overrides a sibling of (deep merge over the SDK bundle)', async () => {
    const { createPageI18nInstance } = await import('./index')
    const t = createPageI18nInstance('en').t

    // The app's react-components.json overrides `question_types` — but only some
    // of its keys. A shallow `{ ...sdk[ns], ...app[ns] }` replaces the whole
    // object, so the SDK-only siblings below vanish. They must survive, while
    // the app's own override of a sibling still wins.
    expect(t('question_types.budget_title', { ns: 'react-components', weighted: '' })).toBe('Budget Voting ')
    expect(t('question_types.quadratic_title', { ns: 'react-components', weighted: '' })).toBe('Quadratic Voting ')
    expect(t('validation.choices_range', { ns: 'react-components', min: 1, max: 3 })).toBe(
      'Select between 1 and 3 options'
    )
    expect(t('question_types.multichoice_desc', { ns: 'react-components', selected: 2, maxcount: 3 })).toBe(
      'You selected 2 options from a maximum of 3'
    )
  })
})

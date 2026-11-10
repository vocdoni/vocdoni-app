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
    const { createPageI18nInstance, loadLanguages } = await import('./index')
    await loadLanguages(['es', 'ca'])

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

describe('on-demand languages', () => {
  // Each test gets a fresh module, so the loaded-language cache starts with English only.
  beforeEach(() => {
    vi.resetModules()
  })

  it('ships only English until another language is asked for', async () => {
    const { createPageI18nInstance, loadLanguages } = await import('./index')
    const { getLoadedLanguages, datesLocale } = await import('./locales')

    createPageI18nInstance('en')
    expect(getLoadedLanguages()).toEqual(['en'])
    expect(datesLocale('eu')).toBeUndefined()

    await loadLanguages(['eu'])
    expect(getLoadedLanguages()).toEqual(['en', 'eu'])
    expect(datesLocale('eu')?.code).toBe('eu')
  })

  it('renders a loaded language synchronously, for pages and imperative callers', async () => {
    const { createPageI18nInstance, getBaseI18n, loadLanguages } = await import('./index')
    await loadLanguages(['ca'])

    expect(createPageI18nInstance('ca').t('menu.login')).toBe('Iniciar sessió')
    expect(getBaseI18n().t('menu.login', { lng: 'ca' })).toBe('Iniciar sessió')
  })

  it('fetches a language on switch and only switches once it is there', async () => {
    const { createPageI18nInstance, loadLanguages } = await import('./index')
    await loadLanguages(['ca'])
    const instance = createPageI18nInstance('ca')

    const switching = instance.changeLanguage('es')
    expect(instance.language).toBe('ca')
    await switching

    expect(instance.language).toBe('es')
    expect(instance.t('menu.login')).toBe('Iniciar sesión')
  })

  it('does not download the browser language when the page is in another one', async () => {
    const navigatorLanguages = Object.getOwnPropertyDescriptor(window.navigator, 'languages')
    Object.defineProperty(window.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true })
    window.localStorage.removeItem('i18nextLng')
    window.history.replaceState(null, '', '/es/')
    try {
      const { createPageI18nInstance, getBaseI18n, loadLanguages } = await import('./index')
      const { getLoadedLanguages } = await import('./locales')

      // The base instance detects German but must not fetch it: only the page's language is loaded.
      expect(getBaseI18n().language).toBe('de')
      await loadLanguages(['es'])
      expect(getLoadedLanguages().sort()).toEqual(['en', 'es'])
      expect(createPageI18nInstance('es').t('menu.login')).toBe('Iniciar sesión')
    } finally {
      if (navigatorLanguages) Object.defineProperty(window.navigator, 'languages', navigatorLanguages)
      else delete (window.navigator as { languages?: readonly string[] }).languages
      window.localStorage.removeItem('i18nextLng')
      window.history.replaceState(null, '', '/')
    }
  })

  it('renders the detected language once the page loads it', async () => {
    const navigatorLanguages = Object.getOwnPropertyDescriptor(window.navigator, 'languages')
    Object.defineProperty(window.navigator, 'languages', { value: ['de-DE', 'de'], configurable: true })
    window.localStorage.removeItem('i18nextLng')
    try {
      const { getBaseI18n, loadLanguages } = await import('./index')

      // Before the load the base instance shows English, never a raw key.
      expect(getBaseI18n().t('menu.login')).toBe('Login')
      await loadLanguages(['de'])
      expect(getBaseI18n().resolvedLanguage).toBe('de')
      expect(getBaseI18n().t('menu.login')).not.toBe('menu.login')
    } finally {
      if (navigatorLanguages) Object.defineProperty(window.navigator, 'languages', navigatorLanguages)
      else delete (window.navigator as { languages?: readonly string[] }).languages
      window.localStorage.removeItem('i18nextLng')
    }
  })

  it('falls back to English for a key a lazily loaded language lacks', async () => {
    const { createPageI18nInstance } = await import('./index')
    const instance = createPageI18nInstance('en')
    // Built at runtime, so `pnpm translations` does not extract it into the locale files.
    const englishOnlyKey = ['test', 'english_only'].join('.')
    instance.addResource('en', 'common', englishOnlyKey, 'Only in English')

    await instance.changeLanguage('eu')

    expect(instance.t('menu.login')).toBe('Hasi saioa')
    expect(instance.t(englishOnlyKey)).toBe('Only in English')
  })

  it('maps regional codes to their bundle and ignores unknown ones', async () => {
    const { loadLanguages } = await import('./index')
    const { getLoadedLanguages } = await import('./locales')

    await loadLanguages(['pt-BR', 'es-AR', 'xx', undefined])

    expect(getLoadedLanguages().sort()).toEqual(['en', 'es', 'pt', 'pt-br'])
  })

  // i18next resolves pt-br through pt before the fallback and waits for the whole chain.
  it('loads the base language of a regional one, so it renders without waiting', async () => {
    const { createPageI18nInstance, loadLanguages } = await import('./index')
    await loadLanguages(['pt-br'])

    const instance = createPageI18nInstance('pt-br')
    expect(instance.isInitialized).toBe(true)
    expect(instance.hasLoadedNamespace('common')).toBe(true)
  })
})

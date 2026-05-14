import '@testing-library/jest-dom'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import SimpleLayout from '~elements/SimpleLayout'
import { act, render, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    ScrollRestoration: () => null,
  }
})

const getDefaultElectionState = () => ({
  loading: false,
  loaded: true,
  election: { organizationId: 'org-1' },
  connected: false,
})

const getDefaultClientState = () => ({
  account: { address: 'user-1' },
  connected: false,
})

const getDefaultAuthState = () => ({
  memberNumber: null as string | null,
})

const getDefaultOrganizationState = () => ({
  organization: {
    account: { name: { default: 'Org name' }, avatar: '' },
    address: 'org-1',
  },
})

const states = {
  election: getDefaultElectionState(),
  client: getDefaultClientState(),
  auth: getDefaultAuthState(),
  organization: getDefaultOrganizationState().organization,
}

vi.mock('@vocdoni/sdk', () => ({
  InvalidElection: class InvalidElection {},
}))

vi.mock('@vocdoni/react-components', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vocdoni/react-components')>()
  const { getReactProvidersMock } = await import('~src/test-utils-react-providers-mock')
  return {
    ...actual,
    ...getReactProvidersMock(),
    ElectionTitle: () => <div>ElectionTitle</div>,
    ElectionStatusBadge: () => <div>ElectionStatusBadge</div>,
    OrganizationImage: ({ alt }: { alt?: string }) => <img src='' alt={alt || 'OrganizationImage'} />,
  }
})

const i18nState = { resolvedLanguage: 'en', language: 'en' }

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>()
  return {
    ...actual,
    useTranslation: () => ({
      t: (_key: string, opts?: { defaultValue?: string }) => opts?.defaultValue ?? _key,
      i18n: i18nState,
    }),
  }
})

vi.mock('~components/Process/ActionsMenu', () => ({
  ActionsMenu: () => <div>ActionsMenu</div>,
}))

vi.mock('~components/Process/Aside', () => ({
  CensusConnectButton: () => <button>Connect</button>,
}))

vi.mock('~components/Process/LogoutButton', () => ({
  default: () => <button>Logout</button>,
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => states.auth,
}))

vi.mock('~components/Layout/ColorModeSwitcher', () => ({
  ColorModeSwitcher: () => <div>ColorModeSwitcher</div>,
}))

vi.mock('~components/Navbar/LanguagesList', () => ({
  LanguagesMenu: () => <div>LanguagesMenu</div>,
}))

vi.mock('~components/Layout/Footer', () => ({
  __esModule: true,
  default: () => <div>Footer</div>,
}))

const editorValues: Array<{ value: unknown; type: string }> = []

vi.mock('~components/Editor', () => ({
  __esModule: true,
  default: ({ defaultValue }: { defaultValue?: string }) => {
    editorValues.push({ value: defaultValue, type: typeof defaultValue })
    return (
      <div data-testid='editor' data-value={JSON.stringify(defaultValue)}>
        {defaultValue}
      </div>
    )
  },
}))

const renderSharedCensus = async (ui: React.ReactElement) => {
  let rendered: ReturnType<typeof render>
  await act(async () => {
    rendered = render(
      <TestMemoryRouter>
        <Routes>
          <Route element={<SimpleLayout />}>
            <Route path='/' element={ui} />
          </Route>
        </Routes>
      </TestMemoryRouter>
    )
  })

  return {
    ...rendered!,
    rerender: (nextUi: React.ReactElement) =>
      rendered!.rerender(
        <TestMemoryRouter>
          <Routes>
            <Route element={<SimpleLayout />}>
              <Route path='/' element={nextUi} />
            </Route>
          </Routes>
        </TestMemoryRouter>
      ),
  }
}

const getFaviconLink = () => document.querySelector("link[rel='icon']") as HTMLLinkElement | null

describe('SharedCensus', () => {
  const originalProcessIds = import.meta.env.PROCESS_IDS
  const originalLanguages = import.meta.env.LANGUAGES
  const originalAlways = import.meta.env.SHARED_CENSUS_ALWAYS_VISIBLE_TEXT
  const originalDisconnected = import.meta.env.SHARED_CENSUS_DISCONNECTED_TEXT
  const originalConnected = import.meta.env.SHARED_CENSUS_CONNECTED_TEXT
  const originalBrowserTitle = import.meta.env.SHARED_CENSUS_BROWSER_TITLE
  const originalFavicon = import.meta.env.SHARED_CENSUS_FAVICON
  const originalStream = import.meta.env.STREAM_URL
  const originalDocumentTitle = document.title
  const originalFaviconHref = getFaviconLink()?.getAttribute('href') ?? '/favicon.ico'
  const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    cb(0)
    return 0
  })

  beforeEach(() => {
    import.meta.env.PROCESS_IDS = 'id-1'
    import.meta.env.LANGUAGES = JSON.stringify({ en: 'English', es: 'Spanish' }) as unknown as Record<string, string>
    delete import.meta.env.SHARED_CENSUS_ALWAYS_VISIBLE_TEXT
    delete import.meta.env.SHARED_CENSUS_DISCONNECTED_TEXT
    delete import.meta.env.SHARED_CENSUS_CONNECTED_TEXT
    delete import.meta.env.SHARED_CENSUS_BROWSER_TITLE
    delete import.meta.env.SHARED_CENSUS_FAVICON
    delete import.meta.env.STREAM_URL
    states.election = getDefaultElectionState()
    states.client = getDefaultClientState()
    states.auth = getDefaultAuthState()
    states.organization = getDefaultOrganizationState().organization
    i18nState.resolvedLanguage = 'en'
    i18nState.language = 'en'
    document.title = originalDocumentTitle
    const favicon = getFaviconLink()
    if (!favicon) {
      const link = document.createElement('link')
      link.setAttribute('rel', 'icon')
      link.setAttribute('href', originalFaviconHref)
      document.head.appendChild(link)
    } else {
      favicon.setAttribute('href', originalFaviconHref)
    }
    rafSpy.mockClear()
    setReactProvidersMock({
      useElection: () => states.election,
      useClient: () => states.client,
      useOrganization: () => ({ organization: states.organization }),
    })
  })

  afterEach(() => {
    import.meta.env.PROCESS_IDS = originalProcessIds
    import.meta.env.LANGUAGES = originalLanguages
    import.meta.env.SHARED_CENSUS_ALWAYS_VISIBLE_TEXT = originalAlways
    import.meta.env.SHARED_CENSUS_DISCONNECTED_TEXT = originalDisconnected
    import.meta.env.SHARED_CENSUS_CONNECTED_TEXT = originalConnected
    import.meta.env.SHARED_CENSUS_BROWSER_TITLE = originalBrowserTitle
    import.meta.env.SHARED_CENSUS_FAVICON = originalFavicon
    import.meta.env.STREAM_URL = originalStream
  })

  it('updates the browser title and favicon only while shared census is mounted', async () => {
    import.meta.env.SHARED_CENSUS_BROWSER_TITLE = 'Asamblea General Ordinaria | ICOES'
    import.meta.env.SHARED_CENSUS_FAVICON = '/assets/icoes-favicon.svg'
    states.auth.memberNumber = '15516'
    const { default: SharedCensus } = await import('./SharedCensus')
    const { unmount } = await renderSharedCensus(<SharedCensus />)

    expect(document.title).toBe('Asamblea General Ordinaria | ICOES')
    expect(getFaviconLink()?.getAttribute('href')).toContain('/assets/icoes-favicon.svg')
    expect(document.body.textContent).toContain('Member No. 15516')

    unmount()

    expect(document.title).toBe(originalDocumentTitle)
    expect(getFaviconLink()?.getAttribute('href')).toBe(originalFaviconHref)
  })

  it('renders always-visible and disconnected text when not connected', async () => {
    import.meta.env.SHARED_CENSUS_ALWAYS_VISIBLE_TEXT = JSON.stringify({
      en: 'Always EN',
      es: 'Siempre ES',
    }) as unknown as Record<string, string>
    import.meta.env.SHARED_CENSUS_DISCONNECTED_TEXT = JSON.stringify({
      en: 'Only when out EN',
      es: 'Solo ES',
    }) as unknown as Record<string, string>
    i18nState.resolvedLanguage = 'es'
    i18nState.language = 'es'
    editorValues.length = 0
    states.client.connected = false
    states.client.account = { address: 'user-1' }

    const { default: SharedCensus } = await import('./SharedCensus')
    const { getByTestId, getByText } = await renderSharedCensus(<SharedCensus />)

    expect(editorValues[0]).toEqual({ value: 'Siempre ES\n\nSolo ES', type: 'string' })
    expect(getByTestId('shared-census-pretext')).toBeInTheDocument()
    expect(getByText('Connect')).toBeInTheDocument()
  })

  it('renders always-visible and connected text when connected/admin', async () => {
    import.meta.env.SHARED_CENSUS_ALWAYS_VISIBLE_TEXT = JSON.stringify({ en: 'Always EN' }) as unknown as Record<
      string,
      string
    >
    import.meta.env.SHARED_CENSUS_CONNECTED_TEXT = JSON.stringify({ en: 'Only when in EN' }) as unknown as Record<
      string,
      string
    >
    editorValues.length = 0
    states.election.connected = true
    states.client.connected = true
    states.client.account = { address: 'org-1' }

    const { default: SharedCensus } = await import('./SharedCensus')
    const { getByTestId, queryByText } = await renderSharedCensus(<SharedCensus />)

    expect(editorValues[0]).toEqual({ value: 'Always EN\n\nOnly when in EN', type: 'string' })
    expect(getByTestId('shared-census-pretext')).toBeInTheDocument()
    expect(queryByText('Connect')).not.toBeInTheDocument()
  })

  it('rerenders pretext content when connection state changes', async () => {
    import.meta.env.SHARED_CENSUS_ALWAYS_VISIBLE_TEXT = JSON.stringify({ en: 'Always EN' }) as unknown as Record<
      string,
      string
    >
    import.meta.env.SHARED_CENSUS_DISCONNECTED_TEXT = JSON.stringify({ en: 'Disconnected EN' }) as unknown as Record<
      string,
      string
    >
    import.meta.env.SHARED_CENSUS_CONNECTED_TEXT = JSON.stringify({ en: 'Connected EN' }) as unknown as Record<
      string,
      string
    >
    editorValues.length = 0
    states.client.connected = false
    states.client.account = { address: 'user-1' }

    const { default: SharedCensus } = await import('./SharedCensus')
    const { rerender } = await renderSharedCensus(<SharedCensus />)

    expect(editorValues.at(-1)).toEqual({ value: 'Always EN\n\nDisconnected EN', type: 'string' })

    states.election.connected = true
    states.client.connected = true
    states.client.account = { address: 'org-1' }

    rerender(<SharedCensus />)

    expect(editorValues.at(-1)).toEqual({ value: 'Always EN\n\nConnected EN', type: 'string' })
  })

  it('falls back to default language when current language is not available', async () => {
    import.meta.env.LANGUAGES = JSON.stringify({ es: 'Spanish', en: 'English' }) as unknown as Record<string, string>
    import.meta.env.SHARED_CENSUS_ALWAYS_VISIBLE_TEXT = JSON.stringify({
      es: 'Siempre',
      en: 'Always',
    }) as unknown as Record<string, string>
    i18nState.resolvedLanguage = 'fr'
    i18nState.language = 'fr'
    editorValues.length = 0

    const { default: SharedCensus } = await import('./SharedCensus')
    const { getByTestId } = await renderSharedCensus(<SharedCensus />)

    expect(editorValues[0]).toEqual({ value: 'Siempre', type: 'string' })
    expect(getByTestId('shared-census-pretext')).toBeInTheDocument()
  })

  it('renders nothing for pretext when no shared census text is provided', async () => {
    const { default: SharedCensus } = await import('./SharedCensus')
    const { queryByTestId } = await renderSharedCensus(<SharedCensus />)

    expect(queryByTestId('shared-census-pretext')).toBeNull()
  })

  it('shows stream video alongside pretext once the session is started', async () => {
    import.meta.env.SHARED_CENSUS_ALWAYS_VISIBLE_TEXT = JSON.stringify({
      en: 'Always EN',
    }) as unknown as Record<string, string>
    import.meta.env.STREAM_URL = 'https://www.youtube.com/embed/test'
    states.election.connected = true
    states.client.connected = true
    editorValues.length = 0

    const { default: SharedCensus } = await import('./SharedCensus')
    const { getByTestId } = await renderSharedCensus(<SharedCensus />)

    expect(getByTestId('shared-census-pretext')).toBeInTheDocument()
    expect(getByTestId('shared-census-stream')).toBeInTheDocument()
    expect(editorValues[0]).toEqual({ value: 'Always EN', type: 'string' })
  })

  it('shows only the stream when no pretext is provided', async () => {
    import.meta.env.STREAM_URL = 'https://www.youtube.com/embed/test-only'
    states.election.connected = true
    states.client.connected = true
    editorValues.length = 0

    const { default: SharedCensus } = await import('./SharedCensus')
    const { queryByTestId, getByTestId } = await renderSharedCensus(<SharedCensus />)

    expect(queryByTestId('shared-census-pretext')).toBeNull()
    expect(getByTestId('shared-census-stream')).toBeInTheDocument()
  })
})

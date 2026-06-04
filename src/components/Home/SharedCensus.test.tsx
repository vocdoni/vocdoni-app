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

const getDefaultOrganizationState = () => ({
  organization: {
    account: { name: { default: 'Org name' }, avatar: '' },
    address: 'org-1',
  },
})

const states = {
  election: getDefaultElectionState(),
  client: getDefaultClientState(),
  organization: getDefaultOrganizationState().organization,
}

vi.mock('@vocdoni/sdk', () => ({
  InvalidElection: class InvalidElection {},
  ElectionStatus: {
    UPCOMING: 'UPCOMING',
    ONGOING: 'ONGOING',
    ENDED: 'ENDED',
    CANCELED: 'CANCELED',
    PAUSED: 'PAUSED',
    RESULTS: 'RESULTS',
  },
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

const i18nState = { resolvedLanguage: 'ca', language: 'ca' }

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

  return rendered!
}

describe('SharedCensus', () => {
  const originalProcessIds = import.meta.env.PROCESS_IDS
  const originalStream = import.meta.env.STREAM_URL
  const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    cb(0)
    return 0
  })

  beforeEach(() => {
    import.meta.env.PROCESS_IDS = 'id-1'
    delete import.meta.env.STREAM_URL
    states.election = getDefaultElectionState()
    states.client = getDefaultClientState()
    states.organization = getDefaultOrganizationState().organization
    i18nState.resolvedLanguage = 'ca'
    i18nState.language = 'ca'
    rafSpy.mockClear()
    setReactProvidersMock({
      useElection: () => states.election,
      useClient: () => states.client,
      useOrganization: () => ({ organization: states.organization }),
    })
  })

  afterEach(() => {
    import.meta.env.PROCESS_IDS = originalProcessIds
    import.meta.env.STREAM_URL = originalStream
  })

  it('renders the hardcoded pretext and post text', async () => {
    states.client.connected = false
    states.client.account = { address: 'user-1' }

    const { default: SharedCensus } = await import('./SharedCensus')
    const { getByTestId, getByText } = await renderSharedCensus(<SharedCensus />)

    expect(getByTestId('shared-census-pretext')).toBeInTheDocument()
    expect(getByText(/Com funciona la votació/)).toBeInTheDocument()
    expect(getByTestId('shared-census-posttext')).toBeInTheDocument()
    expect(getByText('Connect')).toBeInTheDocument()
  })

  it('hides the connect button for the organization admin', async () => {
    states.election.connected = true
    states.client.connected = true
    states.client.account = { address: 'org-1' }

    const { default: SharedCensus } = await import('./SharedCensus')
    const { getByTestId, queryByText } = await renderSharedCensus(<SharedCensus />)

    expect(getByTestId('shared-census-pretext')).toBeInTheDocument()
    expect(queryByText('Connect')).not.toBeInTheDocument()
  })

  it('shows the stream video once the session is started', async () => {
    import.meta.env.STREAM_URL = 'https://www.youtube.com/embed/test'
    states.election.connected = true
    states.client.connected = true

    const { default: SharedCensus } = await import('./SharedCensus')
    const { getByTestId } = await renderSharedCensus(<SharedCensus />)

    expect(getByTestId('shared-census-pretext')).toBeInTheDocument()
    expect(getByTestId('shared-census-stream')).toBeInTheDocument()
  })

  it('does not show the stream before the session is started', async () => {
    import.meta.env.STREAM_URL = 'https://www.youtube.com/embed/test'
    states.election.connected = false
    states.client.connected = false

    const { default: SharedCensus } = await import('./SharedCensus')
    const { queryByTestId } = await renderSharedCensus(<SharedCensus />)

    expect(queryByTestId('shared-census-stream')).toBeNull()
  })
})

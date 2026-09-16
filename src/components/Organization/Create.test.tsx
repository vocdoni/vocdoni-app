import '@testing-library/jest-dom'
import userEvent from '@testing-library/user-event'
import { render, screen, TestMemoryRouter, waitFor } from '~src/test-utils'
import { OrganizationCreate } from './Create'

const mockLanguages = vi.hoisted(() => ({
  data: { languages: ['en', 'es', 'ca'], default: 'en' },
  isLoading: false,
  isError: false,
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: vi.fn(),
    refreshAddresses: vi.fn(),
  }),
}))

vi.mock('~components/AnalyticsProvider', () => ({
  useAnalytics: () => ({
    trackEvent: vi.fn(),
  }),
}))

vi.mock('~src/queries/organization', () => ({
  useOrganizationTypes: () => ({ data: [], isLoading: false, isError: false }),
  useRoles: () => ({ data: [], isLoading: false, isError: false }),
  useOrganizationLanguages: () => mockLanguages,
}))

const renderCreate = () =>
  render(
    <TestMemoryRouter>
      <OrganizationCreate />
    </TestMemoryRouter>
  )

// The selectors are chakra-react-select comboboxes labelled through their FormLabel
const selectOption = async (
  user: ReturnType<typeof userEvent.setup>,
  label: RegExp | string,
  option: RegExp | string
) => {
  await user.click(screen.getByRole('combobox', { name: label }))
  // By text rather than role+name: a name query walks every one of the ~250 country options
  await user.click(await screen.findByText(option))
}

// The picked language is the only place its native name is rendered once the menu closes
const expectLanguage = (name: string) => waitFor(() => expect(screen.getByText(name)).toBeInTheDocument())

describe('OrganizationCreate defaultLang inference', () => {
  beforeEach(() => {
    mockLanguages.data = { languages: ['en', 'es', 'ca'], default: 'en' }
  })

  it('defaults to the API default language', async () => {
    renderCreate()
    await expectLanguage('English')
  })

  it('infers the language from the selected country', async () => {
    const user = userEvent.setup()
    renderCreate()

    await selectOption(user, /country/i, /Spain/)
    await expectLanguage('Español')

    await selectOption(user, /country/i, /Andorra/)
    await expectLanguage('Català')

    await selectOption(user, /country/i, /Germany/)
    await expectLanguage('English')
  })

  it('falls back to the API default when the inferred language is not served', async () => {
    mockLanguages.data = { languages: ['en'], default: 'en' }
    const user = userEvent.setup()
    renderCreate()

    await selectOption(user, /country/i, /Spain/)
    await expectLanguage('English')
  })

  it('keeps a manually picked language when the country changes', async () => {
    const user = userEvent.setup()
    renderCreate()

    await selectOption(user, /communications language/i, 'Català')
    await selectOption(user, /country/i, /Spain/)

    await expectLanguage('Català')
  })
})

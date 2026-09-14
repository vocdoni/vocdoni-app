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

const selectOption = async (user: ReturnType<typeof userEvent.setup>, inputId: string, option: RegExp | string) => {
  await user.click(document.querySelector(`#${inputId}`)!)
  await user.click(await screen.findByText(option))
}

// react-select structure: valueContainer > (singleValue text + inputContainer > input),
// so the input's grandparent holds the selected value's text
const languageValue = () => document.querySelector('#defaultLang')!.parentElement!.parentElement!.textContent

describe('OrganizationCreate defaultLang inference', () => {
  beforeEach(() => {
    mockLanguages.data = { languages: ['en', 'es', 'ca'], default: 'en' }
  })

  it('defaults to the API default language', async () => {
    renderCreate()
    await waitFor(() => expect(languageValue()).toContain('English'))
  })

  it('infers the language from the selected country', async () => {
    const user = userEvent.setup()
    renderCreate()

    await selectOption(user, 'country', /Spain/)
    await waitFor(() => expect(languageValue()).toContain('Español'))

    await selectOption(user, 'country', /Andorra/)
    await waitFor(() => expect(languageValue()).toContain('Català'))

    await selectOption(user, 'country', /Germany/)
    await waitFor(() => expect(languageValue()).toContain('English'))
  })

  it('falls back to the API default when the inferred language is not served', async () => {
    mockLanguages.data = { languages: ['en'], default: 'en' }
    const user = userEvent.setup()
    renderCreate()

    await selectOption(user, 'country', /Spain/)
    await waitFor(() => expect(languageValue()).toContain('English'))
  })

  it('keeps a manually picked language when the country changes', async () => {
    const user = userEvent.setup()
    renderCreate()

    await selectOption(user, 'defaultLang', 'Català')
    await selectOption(user, 'country', /Spain/)

    await waitFor(() => expect(languageValue()).toContain('Català'))
  })
})

import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { Routes } from '~src/router/routes'
import { system } from '~theme/system'
import Settings from './settings'

const navigateSpy = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateSpy,
    useLocation: () => ({
      pathname: Routes.dashboard.settings.organization,
    }),
  }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: Record<string, string>) => opts?.defaultValue ?? _key,
  }),
}))

vi.mock('~components/Account/SaasAccountProvider', () => ({
  useSaasAccount: () => ({
    isLoading: false,
    isError: false,
    error: null,
    organization: {
      account: {
        name: {
          default: 'Acme Org',
        },
      },
    },
  }),
}))

describe('Settings', () => {
  it('marks the active tab using data-state', async () => {
    render(
      <ChakraProvider value={system}>
        <Settings />
      </ChakraProvider>
    )

    const activeTab = await screen.findByRole('tab', { name: 'Organization Details' })
    expect(activeTab).toHaveAttribute('aria-selected', 'true')
  })
})

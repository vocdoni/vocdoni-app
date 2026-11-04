import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { Routes } from '~src/router/routes'
import { system } from '~theme/system'
import Settings from './settings'

const navigateSpy = vi.fn()
const walletAccess = vi.hoisted(() => ({ current: { canView: true, canTopUp: true } }))

vi.mock('~queries/wallet', () => ({
  useWalletAccess: () => walletAccess.current,
}))

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>('react-router')
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
  beforeEach(() => {
    walletAccess.current = { canView: true, canTopUp: true }
  })

  it('marks the active tab using data-state', async () => {
    render(
      <ChakraProvider value={system}>
        <Settings />
      </ChakraProvider>
    )

    const activeTab = await screen.findByRole('tab', { name: 'Organization details' })
    expect(activeTab).toHaveAttribute('aria-selected', 'true')
  })

  it('shows the Billing tab to admins and managers, in place of the wallet and subscription tabs', async () => {
    render(
      <ChakraProvider value={system}>
        <Settings />
      </ChakraProvider>
    )

    expect(await screen.findByRole('tab', { name: 'Billing' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Wallet' })).not.toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Subscription plan' })).not.toBeInTheDocument()
  })

  it('hides the Billing tab from roles that cannot read the wallet', async () => {
    walletAccess.current = { canView: false, canTopUp: false }
    render(
      <ChakraProvider value={system}>
        <Settings />
      </ChakraProvider>
    )

    expect(await screen.findByRole('tab', { name: 'Team' })).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Billing' })).not.toBeInTheDocument()
  })
})

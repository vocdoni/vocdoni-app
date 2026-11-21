import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { system } from '~theme/system'
import AddressBtn from './Address'

const mockUseOrganization = vi.fn()
const mockUseClient = vi.fn()
const mockUseToast = vi.fn()

vi.mock('~src/app-env', () => ({
  useAppEnv: () => ({ VOCDONI_ENVIRONMENT: 'dev' }),
}))

vi.mock('~components/Toast', () => ({
  useToast: () => mockUseToast,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: Record<string, string>) => opts?.defaultValue ?? _key,
  }),
}))

describe('AddressBtn', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization(),
      useClient: () => mockUseClient(),
    })
  })

  it('renders the organization address', () => {
    mockUseOrganization.mockReturnValue({
      organization: { address: '0x1234567890abcdef' },
    })
    mockUseClient.mockReturnValue({ client: {} })

    render(
      <ChakraProvider value={system}>
        <AddressBtn />
      </ChakraProvider>
    )

    expect(screen.getByText('0x123...def')).toBeInTheDocument()
  })

  it('disables the open-in-explorer item when there is no address to open', async () => {
    mockUseOrganization.mockReturnValue({ organization: { address: '' } })
    mockUseClient.mockReturnValue({ client: {} })

    render(
      <ChakraProvider value={system}>
        <AddressBtn />
      </ChakraProvider>
    )
    const open = vi.spyOn(window, 'open').mockReturnValue(null)

    await userEvent.click(screen.getByRole('button'))
    await userEvent.click(screen.getByText('open_in_explorer'))

    expect(screen.getByText('open_in_explorer').closest('[data-disabled]')).not.toBeNull()
    expect(open).not.toHaveBeenCalled()
    open.mockRestore()
  })
})

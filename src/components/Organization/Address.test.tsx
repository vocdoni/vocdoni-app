import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
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
})

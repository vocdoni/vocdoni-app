import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { system } from '~theme'
import AddressBtn from './Address'

const mockUseOrganization = vi.fn()
const mockUseClient = vi.fn()
const mockUseToast = vi.fn()

vi.mock('@vocdoni/react-providers', () => ({
  useOrganization: () => mockUseOrganization(),
  useClient: () => mockUseClient(),
  enforceHexPrefix: (value: string | undefined) => value,
}))

vi.mock('~shared/Toast', () => ({
  useToast: () => mockUseToast,
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: Record<string, string>) => opts?.defaultValue ?? _key,
  }),
}))

describe('AddressBtn', () => {
  it('renders the organization address', () => {
    mockUseOrganization.mockReturnValue({
      organization: { address: '0x1234567890abcdef' },
    })
    mockUseClient.mockReturnValue({
      client: { explorerUrl: 'https://explorer.test' },
    })

    render(
      <ChakraProvider value={system}>
        <AddressBtn />
      </ChakraProvider>
    )

    expect(screen.getByText('0x123...def')).toBeInTheDocument()
  })
})

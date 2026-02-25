import { ChakraProvider } from '@chakra-ui/react'
import { render, screen } from '@testing-library/react'
import { system } from '~theme/system'
import OrganizationVotings from './index'

const navigateSpy = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateSpy,
    useLocation: () => ({
      pathname: '/admin/processes/drafts/1',
    }),
  }
})

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, opts?: Record<string, string>) => opts?.defaultValue ?? _key,
  }),
}))

describe('OrganizationVotings', () => {
  it('marks the active tab using data-state', async () => {
    render(
      <ChakraProvider value={system}>
        <OrganizationVotings />
      </ChakraProvider>
    )

    const activeTab = await screen.findByRole('tab', { name: 'Drafts' })
    expect(activeTab).toHaveAttribute('aria-selected', 'true')
  })
})

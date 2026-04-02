import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { mockUseClient, mockUseOrganization, render, screen, TestMemoryRouter } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { DraftsContextMenu } from './drafts'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({
    bearedFetch: vi.fn(),
  }),
}))

vi.mock('~components/Process/Create', () => ({
  useCreateProcess: () => ({
    mutateAsync: vi.fn(),
  }),
}))

vi.mock('~components/Toast', () => ({
  ToastProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useToast: () => vi.fn(),
}))

vi.mock('react-i18next', () => ({
  initReactI18next: { type: '3rdParty', init: vi.fn() },
  I18nextProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useTranslation: () => ({
    t: (_key: string, opts?: Record<string, string>) => opts?.defaultValue ?? _key,
  }),
  Trans: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

describe('DraftsContextMenu', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useClient: () => mockUseClient({ account: { address: '0xabc' } }),
      useOrganization: () => mockUseOrganization({ organization: { address: '0xorg' } }),
    })
  })

  it('renders the edit draft action when opened', async () => {
    const user = userEvent.setup()

    const { container } = render(
      <TestMemoryRouter>
        <DraftsContextMenu
          draft={{
            id: 'draft-1',
            metadata: { title: 'Draft title' } as any,
          }}
        />
      </TestMemoryRouter>
    )

    const trigger = screen.getByRole('button')
    await user.click(trigger)

    expect(screen.getByText('Edit Draft')).toBeInTheDocument()
    expect(container).not.toContainElement(screen.getByText('Edit Draft'))
    expect(screen.getByText('Delete Draft').closest('[role="menuitem"]')).toHaveStyle({
      color: 'var(--chakra-colors-fg-error)',
    })
  })
})

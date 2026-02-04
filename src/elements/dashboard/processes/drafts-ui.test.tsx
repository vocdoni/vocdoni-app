import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '~src/test-utils'
import { DraftsContextMenu } from './drafts'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  }
})

vi.mock('@vocdoni/react-providers', () => ({
  useClient: () => ({
    account: { address: '0xabc' },
  }),
  useOrganization: () => ({
    organization: { address: '0xorg' },
  }),
}))

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

vi.mock('~shared/Toast', () => ({
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
  it('renders the edit draft action when opened', async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <DraftsContextMenu
          draft={{
            id: 'draft-1',
            metadata: { title: 'Draft title' } as any,
          }}
        />
      </MemoryRouter>
    )

    const trigger = screen.getByRole('button')
    await user.click(trigger)

    expect(screen.getByText('Edit Draft')).toBeInTheDocument()
  })
})

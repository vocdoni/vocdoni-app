import userEvent from '@testing-library/user-event'
import { VocdoniApiError } from '@vocdoni/api-client'
import { useUpdateManagedOrganization } from '~src/queries/integrators'
import type { ManagedOrganizationRow } from '~src/queries/integrators'
import { render, screen, waitFor } from '~src/test-utils'
import { ManagedOrganizationsTable } from './ManagedOrganizationsTable'

const mutateAsync = vi.fn()

vi.mock('~src/queries/integrators', () => ({
  useUpdateManagedOrganization: vi.fn(),
}))

const ADDRESS = '0x1234567890abcdef1234567890abcdef12345678'

// Without spend fields, as an older backend returns it; tests that need spend set them explicitly
const org = (overrides: Partial<ManagedOrganizationRow> = {}): ManagedOrganizationRow => ({
  address: ADDRESS,
  website: '',
  createdAt: '2025-01-15T00:00:00Z',
  type: 'others',
  ...overrides,
})

const editButton = () => screen.getByRole('button', { name: 'Edit cap' })
const amountInput = () => screen.getByLabelText(/Cap \(EUR, VAT excluded\)/)
const saveButton = () => screen.getByRole('button', { name: 'Save' })

describe('ManagedOrganizationsTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mutateAsync.mockResolvedValue({})
    vi.mocked(useUpdateManagedOrganization).mockReturnValue({ mutateAsync, isPending: false } as never)
  })

  it('renders the org name with its address and counters', () => {
    render(
      <ManagedOrganizationsTable
        organizations={[
          org({
            name: { default: 'Acme' },
            counters: { processes: 7, sentSMS: 3, sentEmails: 9, sentVotes: 0, subOrgs: 0, users: 0 },
          }),
        ]}
      />
    )

    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText('0x123456…5678')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('falls back to the website when the org has no name', () => {
    render(<ManagedOrganizationsTable organizations={[org({ website: 'https://example.com' })]} />)

    expect(screen.getByText('https://example.com')).toBeInTheDocument()
    expect(screen.getByText('0x123456…5678')).toBeInTheDocument()
  })

  it('falls back to the address when the org has no name and no website', () => {
    render(<ManagedOrganizationsTable organizations={[org()]} />)

    expect(screen.getByText('0x123456…5678')).toBeInTheDocument()
  })

  describe('spend columns', () => {
    it('stays hidden, with no edit action, when the backend does not send spend', () => {
      render(<ManagedOrganizationsTable organizations={[org()]} canEditCaps />)

      expect(screen.queryByText('Spent')).not.toBeInTheDocument()
      expect(screen.queryByText('Spend cap')).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'Edit cap' })).not.toBeInTheDocument()
    })

    it('shows what is spent and the cap, or "No cap" when there is none', () => {
      render(
        <ManagedOrganizationsTable
          organizations={[
            org({ address: '0xaaa1', spentCents: 1250, spendCapCents: 5000 }),
            org({ address: '0xbbb2', spentCents: 0, spendCapCents: null }),
          ]}
        />
      )

      expect(screen.getByText('Spent')).toBeInTheDocument()
      expect(screen.getByText('Spend cap')).toBeInTheDocument()
      expect(screen.getByText('€12.50')).toBeInTheDocument()
      expect(screen.getByText('€50')).toBeInTheDocument()
      expect(screen.getByText('No cap')).toBeInTheDocument()
      expect(screen.getByText('€0')).toBeInTheDocument()
    })

    it('does not show the cap reached badge without a cap', () => {
      render(<ManagedOrganizationsTable organizations={[org({ spentCents: 99999, spendCapCents: null })]} />)

      expect(screen.queryByText('Cap reached')).not.toBeInTheDocument()
    })

    it('marks a row whose spend has reached its cap', () => {
      render(
        <ManagedOrganizationsTable
          organizations={[
            org({ address: '0xaaa1', spentCents: 5000, spendCapCents: 5000 }),
            org({ address: '0xbbb2', spentCents: 4999, spendCapCents: 5000 }),
          ]}
        />
      )

      expect(screen.getAllByText('Cap reached')).toHaveLength(1)
      expect(screen.getByText('€49.99')).toBeInTheDocument()
    })
  })

  describe('edit cap', () => {
    const withSpend = (overrides: Partial<ManagedOrganizationRow> = {}) =>
      org({ spentCents: 1000, spendCapCents: 5000, ...overrides })

    it('is not offered to a user who cannot edit caps', () => {
      render(<ManagedOrganizationsTable organizations={[withSpend()]} />)

      expect(screen.queryByRole('button', { name: 'Edit cap' })).not.toBeInTheDocument()
    })

    it('opens a dialog with the current cap and the VAT hint', async () => {
      const user = userEvent.setup()
      render(<ManagedOrganizationsTable organizations={[withSpend()]} canEditCaps />)

      await user.click(editButton())

      expect(await screen.findByRole('dialog')).toBeInTheDocument()
      expect(amountInput()).toHaveValue(50)
      expect(
        screen.getByText(
          "What this organization's voting processes may hold charged from your wallet, VAT excluded. Lowering it below what is already spent only blocks new charges."
        )
      ).toBeInTheDocument()
    })

    it('sends the amount in cents', async () => {
      const user = userEvent.setup()
      render(<ManagedOrganizationsTable organizations={[withSpend()]} canEditCaps />)

      await user.click(editButton())
      await user.clear(amountInput())
      await user.type(amountInput(), '12.5')
      await user.click(saveButton())

      await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ address: ADDRESS, spendCapCents: 1250 }))
    })

    it('sends null when "No cap" is ticked', async () => {
      const user = userEvent.setup()
      render(<ManagedOrganizationsTable organizations={[withSpend()]} canEditCaps />)

      await user.click(editButton())
      await user.click(screen.getByLabelText('No cap'))
      await user.click(saveButton())

      await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({ address: ADDRESS, spendCapCents: null }))
    })

    it('rejects a negative amount without saving', async () => {
      const user = userEvent.setup()
      render(<ManagedOrganizationsTable organizations={[withSpend()]} canEditCaps />)

      await user.click(editButton())
      await user.clear(amountInput())
      await user.type(amountInput(), '-5')
      await user.click(saveButton())

      expect(await screen.findByText('Enter an amount of 0 or more, with at most 2 decimals.')).toBeInTheDocument()
      expect(mutateAsync).not.toHaveBeenCalled()
    })

    it('rejects an amount with more than two decimals without saving', async () => {
      const user = userEvent.setup()
      render(<ManagedOrganizationsTable organizations={[withSpend()]} canEditCaps />)

      await user.click(editButton())
      await user.clear(amountInput())
      await user.type(amountInput(), '1.234')
      await user.click(saveButton())

      expect(await screen.findByText('Enter an amount of 0 or more, with at most 2 decimals.')).toBeInTheDocument()
      expect(mutateAsync).not.toHaveBeenCalled()
    })

    it('shows the API error in the dialog and keeps it open', async () => {
      const user = userEvent.setup()
      mutateAsync.mockRejectedValue(
        new VocdoniApiError(404, { error: 'Organization not managed by you' }, 'Organization not managed by you')
      )
      render(<ManagedOrganizationsTable organizations={[withSpend()]} canEditCaps />)

      await user.click(editButton())
      await user.click(saveButton())

      expect(await screen.findByText('Organization not managed by you')).toBeInTheDocument()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })
  })
})

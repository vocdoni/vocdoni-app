import '@testing-library/jest-dom'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '~src/test-utils'
import { ImportMembers } from './Import'

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useOutletContext: () => ({ jobId: null, setJobId: vi.fn() }),
  }
})

vi.mock('~src/queries/members', () => ({
  useAddMembers: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useImportJobProgress: () => ({ data: undefined, isError: false }),
  usePaginatedMembers: () => ({ data: { pagination: { totalItems: 0 } } }),
}))

vi.mock('~components/Spreadsheet/SpreadsheetManager', () => {
  class SpreadsheetManager {
    data: string[][] = [['John', 'john@doe.com']]
    filedata: string[][] = [['John', 'john@doe.com']]
    heading: string[] = ['Name', 'Email']
    header: string[] = ['Name', 'Email']
    static AcceptedTypes = ['text/csv']

    async read() {
      return undefined
    }
  }

  return { SpreadsheetManager }
})

vi.mock('~components/Pricing/use-pricing-modal', () => ({
  usePricingModal: () => ({
    openModal: vi.fn(),
    closeModal: vi.fn(),
    modalType: null,
    modalData: null,
  }),
}))

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({
    subscription: {
      subscriptionDetails: { maxCensusSize: 1000 },
      plan: { organization: { maxCensus: 1000 } },
    },
  }),
}))

vi.mock('../TableProvider', () => ({
  useTable: () => ({
    columns: [
      { id: 'name', label: 'Name' },
      { id: 'email', label: 'Email' },
    ],
  }),
}))

describe('ImportMembers drawer', () => {
  it('keeps the drawer open and shows the mapping step after selecting a file', async () => {
    const user = userEvent.setup()
    render(<ImportMembers />)

    await user.click(screen.getByRole('button', { name: 'Import' }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeTruthy()
    await user.upload(input, new File(['Name,Email\nJohn,john@doe.com'], 'members.csv', { type: 'text/csv' }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(await screen.findByText('Map Columns')).toBeInTheDocument()
  })
})

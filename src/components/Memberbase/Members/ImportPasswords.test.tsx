import '@testing-library/jest-dom'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockUseOrganization, render } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { ImportMembers } from './Import'

// hashMemberPassword(ORG, 's3cret'), the shared test vector
const S3CRET_HASH = '2f7e83a0b19a82fa9a5dc6ecc6ff44ec82679ea87012a7187bd3313366bf277e'

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  toast: vi.fn(),
  filedata: [] as string[][],
}))

vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router')>()),
  useOutletContext: () => ({ jobId: null, setJobId: vi.fn() }),
}))

vi.mock('~src/queries/members', () => ({
  useAddMembers: () => ({ mutateAsync: mocks.mutateAsync, isPending: false }),
  useImportJobProgress: () => ({ data: undefined, isError: false }),
  usePaginatedMembers: () => ({ data: { pagination: { totalItems: 0 } } }),
}))

vi.mock('~components/Toast', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~components/Toast')>()),
  useToast: () => mocks.toast,
}))

vi.mock('~components/Spreadsheet/SpreadsheetManager', () => {
  class SpreadsheetManager {
    heading = ['Number', 'Secret']
    header = ['Number', 'Secret']
    static Accept = { 'text/csv': ['.csv'] }
    get data() {
      return mocks.filedata
    }
    get filedata() {
      return mocks.filedata
    }
    async read() {
      return undefined
    }
  }
  return { SpreadsheetManager }
})

vi.mock('~components/Pricing/use-pricing-modal', () => ({
  usePricingModal: () => ({ openModal: vi.fn(), closeModal: vi.fn(), modalType: null, modalData: null }),
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
      { id: 'memberNumber', label: 'Member number' },
      { id: 'password', label: 'Password' },
    ],
  }),
}))

const importFile = async (filedata: string[][]) => {
  mocks.filedata = filedata
  const user = userEvent.setup()
  render(<ImportMembers />)
  await user.click(screen.getByRole('button', { name: 'Import' }))
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  await user.upload(input, new File(['x'], 'members.csv', { type: 'text/csv' }))
  await screen.findByText('Map Columns')

  for (const [label, option] of [
    ['Member number', 'Number'],
    ['Password', 'Secret'],
  ]) {
    await user.click(screen.getByLabelText(label))
    await user.click(await screen.findByRole('option', { name: option }))
  }
  await user.click(screen.getByRole('button', { name: 'Import Data' }))
}

// the drawer, the select and the real hashing make these slow under a loaded machine
vi.setConfig({ testTimeout: 20000 })

describe('ImportMembers passwords', () => {
  beforeEach(() => {
    mocks.mutateAsync.mockReset().mockResolvedValue({ jobId: 'job-1' })
    mocks.toast.mockReset()
    setReactProvidersMock({
      useOrganization: () =>
        mockUseOrganization({ organization: { address: '0x00000000000000000000000000000000000000AA' } }),
    })
  })

  it('imports the valid and the passwordless rows, skips the invalid one and reports its line', async () => {
    await importFile([
      ['1', 's3cret'],
      ['2', 'abc'],
      ['3', ''],
    ])

    await waitFor(() => expect(mocks.mutateAsync).toHaveBeenCalledTimes(1))
    expect(mocks.mutateAsync.mock.calls[0][0]).toEqual([
      { memberNumber: '1', password: S3CRET_HASH },
      { memberNumber: '3' },
    ])
    expect(mocks.toast).toHaveBeenCalledTimes(1)
    expect(mocks.toast.mock.calls[0][0].description).toContain('lines 3.')
  })

  it('calls no API when every row is skipped', async () => {
    await importFile([
      ['1', 'abc'],
      ['2', '123456'],
    ])

    await waitFor(() => expect(mocks.toast).toHaveBeenCalledTimes(1))
    expect(mocks.toast.mock.calls[0][0].description).toContain('lines 2, 3.')
    expect(mocks.mutateAsync).not.toHaveBeenCalled()
  })
})

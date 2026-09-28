import '@testing-library/jest-dom'
import { act, screen } from '@testing-library/react'
import type { FileRejection } from 'react-dropzone'
import { FormProvider, useForm } from 'react-hook-form'
import ErrorMissingHeader from '~components/Spreadsheet/errors/ErrorMissingHeader'
import { render } from '~src/test-utils'
import { MembersCsvManager } from './MembersCsvManager'

type DropHandler = (files: File[], rejections?: FileRejection[]) => Promise<void>

let dropHandler: DropHandler | undefined
let mockRowCount = 0
let mockReadError: unknown = null
const openModal = vi.fn()
const mockTrackAnalyticsEvent = vi.fn()

// Partial mock: keep the real AnalyticsEvents taxonomy, intercept only the sink.
vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
}))

vi.mock('react-dropzone', () => ({
  useDropzone: (options: { onDrop: DropHandler }) => {
    dropHandler = options.onDrop
    return {
      getRootProps: () => ({ 'data-testid': 'dropzone-root' }),
      getInputProps: () => ({}),
      isDragActive: false,
    }
  },
}))

vi.mock('~components/Spreadsheet/SpreadsheetManager', async (importOriginal) => {
  const actual = await importOriginal<typeof import('~components/Spreadsheet/SpreadsheetManager')>()

  class SpreadsheetManager {
    data: string[][]
    encoding = 'utf-8'
    static AcceptedTypes = ['text/csv']

    constructor(public file: File) {
      this.data = Array.from({ length: mockRowCount }, () => ['row'])
    }

    get fileType() {
      return actual.getSpreadsheetFileType(this.file.name)
    }

    async read() {
      if (mockReadError) throw mockReadError
      return undefined
    }
  }

  return { ...actual, SpreadsheetManager }
})

vi.mock('~components/Pricing/use-pricing-modal', () => ({
  usePricingModal: () => ({
    openModal,
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

vi.mock('~queries/members', () => ({
  usePaginatedMembers: () => ({
    data: { pagination: { totalItems: 100 } },
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

const MembersCsvManagerForm = () => {
  const methods = useForm({
    defaultValues: { spreadsheet: { data: [] } },
  })

  return (
    <FormProvider {...methods}>
      <MembersCsvManager />
    </FormProvider>
  )
}

describe('MembersCsvManager', () => {
  beforeEach(() => {
    mockRowCount = 0
    mockReadError = null
    openModal.mockClear()
    mockTrackAnalyticsEvent.mockClear()
    dropHandler = undefined
  })

  const drop = async (files: File[], rejections: FileRejection[] = []) => {
    await act(async () => {
      await dropHandler?.(files, rejections)
    })
  }

  it('opens the plan upgrade modal when the import exceeds member limit', async () => {
    mockRowCount = 901
    render(<MembersCsvManagerForm />)

    const file = new File(['data'], 'members.csv', { type: 'text/csv' })
    await act(async () => {
      await dropHandler?.([file])
    })

    expect(openModal).toHaveBeenCalledWith('planUpgrade', { context: 'memberbase', limit: '1000' })
    // The row limit is a paywall (tracked as `paywall_viewed`), not a broken file
    expect(mockTrackAnalyticsEvent).not.toHaveBeenCalled()
  })

  it('explains and tracks a file the dropzone rejected', async () => {
    render(<MembersCsvManagerForm />)

    const file = new File(['png'], 'photo.png', { type: 'image/png' })
    await drop([], [{ file, errors: [{ code: 'file-invalid-type', message: 'invalid' }] }])

    expect(await screen.findByText(/Upload a single CSV, XLSX, XLS or ODS file/)).toBeInTheDocument()
    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
      name: 'members_import_failed',
      props: { reason: 'rejected_file', file_type: 'other', rejection_code: 'file-invalid-type' },
    })
  })

  it('tracks a spreadsheet without a header as missing_header', async () => {
    mockReadError = new ErrorMissingHeader()
    render(<MembersCsvManagerForm />)

    await drop([new File([''], 'members.CSV', { type: 'text/csv' })])

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
      name: 'members_import_failed',
      props: { reason: 'missing_header', file_type: 'csv', encoding: 'utf-8' },
    })
  })

  it('tracks any other read failure as parse_error', async () => {
    mockReadError = new Error('File is password-protected')
    render(<MembersCsvManagerForm />)

    await drop([new File(['data'], 'members.xlsx')])

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
      name: 'members_import_failed',
      props: { reason: 'parse_error', file_type: 'xlsx', encoding: 'utf-8' },
    })
  })

  it('applies the dropzone root props only once', () => {
    render(<MembersCsvManagerForm />)

    expect(screen.getAllByTestId('dropzone-root')).toHaveLength(1)
  })
})

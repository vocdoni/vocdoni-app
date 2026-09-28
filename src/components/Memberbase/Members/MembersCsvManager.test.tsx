import '@testing-library/jest-dom'
import { act, screen } from '@testing-library/react'
import type { FileRejection } from 'react-dropzone'
import { FormProvider, useForm } from 'react-hook-form'
import ErrorMissingData from '~components/Spreadsheet/errors/ErrorMissingData'
import { render } from '~src/test-utils'
import { MembersCsvManager } from './MembersCsvManager'

type DropHandler = (files: File[], rejections?: FileRejection[]) => Promise<void>

let dropHandler: DropHandler | undefined
let mockRowCount = 0
let mockReadError: Error | undefined
const openModal = vi.fn()

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

vi.mock('~components/Spreadsheet/SpreadsheetManager', () => {
  class SpreadsheetManager {
    data: string[][]
    static Accept = { 'text/csv': ['.csv'] }

    constructor() {
      this.data = Array.from({ length: mockRowCount }, () => ['row'])
    }

    async read() {
      if (mockReadError) throw mockReadError
    }
  }

  return { SpreadsheetManager }
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
    mockReadError = undefined
    openModal.mockClear()
    dropHandler = undefined
  })

  it('opens the plan upgrade modal when the import exceeds member limit', async () => {
    mockRowCount = 901
    render(<MembersCsvManagerForm />)

    const file = new File(['data'], 'members.csv', { type: 'text/csv' })
    await act(async () => {
      await dropHandler?.([file])
    })

    expect(openModal).toHaveBeenCalledWith('planUpgrade', { context: 'memberbase', limit: '1000' })
  })

  it('applies the dropzone root props only once', () => {
    render(<MembersCsvManagerForm />)

    expect(screen.getAllByTestId('dropzone-root')).toHaveLength(1)
  })

  it('asks for a supported file type when the dropped file is rejected', async () => {
    render(<MembersCsvManagerForm />)

    const file = new File(['data'], 'members.pdf', { type: 'application/pdf' })
    await act(async () => {
      await dropHandler?.(
        [],
        [{ file, errors: [{ code: 'file-invalid-type', message: 'File type must be text/csv' }] }]
      )
    })

    expect(
      screen.getByText("This file type isn't supported. Upload a .csv, .xlsx, .xls or .ods file.")
    ).toBeInTheDocument()
    expect(screen.queryByText('File type must be text/csv')).not.toBeInTheDocument()
  })

  it('asks for a single file when several files are dropped', async () => {
    render(<MembersCsvManagerForm />)

    const tooMany = { code: 'too-many-files', message: 'Too many files' }
    const rejections = ['a.csv', 'b.csv'].map((name) => ({
      file: new File(['data'], name, { type: 'text/csv' }),
      errors: [tooMany],
    }))
    await act(async () => {
      await dropHandler?.([], rejections)
    })

    expect(screen.getByText('Upload one file at a time.')).toBeInTheDocument()
  })

  it('shows a generic message instead of raw browser errors when the file cannot be read', async () => {
    mockReadError = new TypeError(
      "Failed to execute 'readAsBinaryString' on 'FileReader': parameter 1 is not of type 'Blob'."
    )
    render(<MembersCsvManagerForm />)

    await act(async () => {
      await dropHandler?.([new File(['data'], 'members.csv', { type: 'text/csv' })])
    })

    expect(
      screen.getByText("We couldn't read this file. Check that it's a valid CSV or spreadsheet and try again.")
    ).toBeInTheDocument()
    expect(screen.queryByText(/readAsBinaryString/)).not.toBeInTheDocument()
  })

  it('shows the spreadsheet validation message when the file has no data', async () => {
    mockReadError = new ErrorMissingData()
    render(<MembersCsvManagerForm />)

    await act(async () => {
      await dropHandler?.([new File(['data'], 'members.csv', { type: 'text/csv' })])
    })

    expect(screen.getByText(mockReadError.message)).toBeInTheDocument()
  })
})

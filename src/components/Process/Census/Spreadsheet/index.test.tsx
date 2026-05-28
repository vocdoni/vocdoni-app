import '@testing-library/jest-dom'
import { act, screen, waitFor } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { render } from '~src/test-utils'
import { CensusTypes } from '../CensusType'
import { CensusSpreadsheetManager } from './CensusSpreadsheetManager'
import { CensusCsvManager } from './index'

// Capture the onDrop callback so tests can trigger it directly
let dropHandler: ((files: File[]) => Promise<void>) | undefined

vi.mock('react-dropzone', () => ({
  useDropzone: (options: { onDrop: (files: File[]) => Promise<void> }) => {
    dropHandler = options.onDrop
    return {
      getRootProps: () => ({ 'data-testid': 'dropzone-root' }),
      getInputProps: () => ({}),
      isDragActive: false,
    }
  },
}))

// Mock the spreadsheet manager so tests don't need real file parsing
vi.mock('./CensusSpreadsheetManager', () => {
  class CensusSpreadsheetManager {
    static AcceptedTypes = ['text/csv']
    read = vi.fn().mockResolvedValue(undefined)
    data = [
      ['john@example.com', 'John'],
      ['jane@example.com', 'Jane'],
    ]
    header = ['email', 'name']
    heading = ['email', 'name']
    filedata = [
      ['john@example.com', 'John'],
      ['jane@example.com', 'Jane'],
    ]
    weighted = false
  }
  return { CensusSpreadsheetManager }
})

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({
    subscription: {
      subscriptionDetails: { maxCensusSize: 1000 },
      plan: { organization: { maxCensus: 1000 } },
    },
  }),
}))

vi.mock('~components/Spreadsheet/limits', () => ({
  enforceCsvRowLimit: vi.fn(),
}))

vi.mock('~components/Spreadsheet/generator', () => ({
  CsvGenerator: class CsvGenerator {
    url = 'blob:mock'
  },
}))

vi.mock('~components/Spreadsheet/Preview', () => ({
  CsvPreview: () => null,
}))

vi.mock('~components/Layout/Uploader', () => ({
  default: ({ getInputProps }: { getInputProps: () => object }) => (
    <input data-testid='file-input' type='file' {...getInputProps()} />
  ),
}))

type FormValues = {
  spreadsheet: CensusSpreadsheetManager | null
  weightedVote: boolean
  censusType: CensusTypes
}

const submitHandler = vi.fn()
const errorHandler = vi.fn()

const Harness = ({ censusType = CensusTypes.Spreadsheet }: { censusType?: CensusTypes }) => {
  const methods = useForm<FormValues>({
    defaultValues: { spreadsheet: null, weightedVote: false, censusType },
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(submitHandler, errorHandler)}>
        <CensusCsvManager />
        <button type='submit'>Submit</button>
      </form>
    </FormProvider>
  )
}

describe('CensusCsvManager', () => {
  beforeEach(() => {
    dropHandler = undefined
    submitHandler.mockClear()
    errorHandler.mockClear()
  })

  /**
   * Regression test for: https://github.com/vocdoni/ui-scaffold/issues/XXXX
   *
   * Root cause: commit 2a0f7f7c removed {...upload} from <FormControl>, which
   * had accidentally been overriding RHF's ref. Once RHF's ref attached to the
   * FormControl div, it ran querySelectorAll("input,select,textarea") and found
   * the file input inside <Uploader>. File inputs always have value="" so the
   * `required` check permanently failed regardless of setValue() calls.
   *
   * Fix: register is now on a <input type="hidden"> so RHF finds the hidden
   * input directly (no querySelectorAll fallback), and setValue() writes a
   * truthy string to it when a spreadsheet is loaded.
   */
  it('passes required validation after a spreadsheet is successfully uploaded', async () => {
    render(<Harness />)

    // Simulate a successful file drop
    const file = new File(['email,name\njohn@example.com,John'], 'census.csv', { type: 'text/csv' })
    await act(async () => {
      await dropHandler?.([file])
    })

    // Submit the form
    await act(async () => {
      screen.getByRole('button', { name: 'Submit' }).click()
    })

    await waitFor(() => {
      // onSubmit should have been called — no validation errors
      expect(submitHandler).toHaveBeenCalledTimes(1)
      expect(errorHandler).not.toHaveBeenCalled()
    })
  })

  it('fails required validation when no spreadsheet has been uploaded', async () => {
    render(<Harness />)

    // Submit without uploading anything
    await act(async () => {
      screen.getByRole('button', { name: 'Submit' }).click()
    })

    await waitFor(() => {
      expect(submitHandler).not.toHaveBeenCalled()
      expect(errorHandler).toHaveBeenCalledTimes(1)
      const errors = errorHandler.mock.calls[0][0]
      expect(errors.spreadsheet).toBeDefined()
      expect(errors.spreadsheet.type).toBe('required')
    })
  })

  it('skips spreadsheet validation when census type is not Spreadsheet', async () => {
    render(<Harness censusType={CensusTypes.CSP} />)

    // Submit without uploading — should pass because required is conditional
    await act(async () => {
      screen.getByRole('button', { name: 'Submit' }).click()
    })

    await waitFor(() => {
      expect(errorHandler).not.toHaveBeenCalled()
      expect(submitHandler).toHaveBeenCalledTimes(1)
    })
  })

  it('register is attached to a hidden input, not the FormControl wrapper', () => {
    const { container } = render(<Harness />)

    // The hidden input carrying the RHF registration must exist
    const hiddenInput = container.querySelector('input[type="hidden"]')
    expect(hiddenInput).toBeInTheDocument()

    // The file input from <Uploader> must NOT be the one carrying the field name
    const fileInput = screen.getByTestId('file-input')
    expect(fileInput).not.toHaveAttribute('name', 'spreadsheet')

    // The hidden input must carry the field name
    expect(hiddenInput).toHaveAttribute('name', 'spreadsheet')
  })
})

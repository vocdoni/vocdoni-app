import '@testing-library/jest-dom'
import { act } from '@testing-library/react'
import { FormProvider, useForm } from 'react-hook-form'
import { render } from '~src/test-utils'
import { MembersCsvManager } from './MembersCsvManager'

let dropHandler: ((files: File[]) => Promise<void>) | undefined
let mockRowCount = 0
const openModal = vi.fn()

vi.mock('react-dropzone', () => ({
  useDropzone: (options: { onDrop: (files: File[]) => Promise<void> }) => {
    dropHandler = options.onDrop
    return {
      getRootProps: () => ({}),
      getInputProps: () => ({}),
      isDragActive: false,
    }
  },
}))

vi.mock('~components/shared/Spreadsheet/SpreadsheetManager', () => {
  class SpreadsheetManager {
    data: string[][]
    static AcceptedTypes = ['text/csv']

    constructor() {
      this.data = Array.from({ length: mockRowCount }, () => ['row'])
    }

    async read() {
      return undefined
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
})

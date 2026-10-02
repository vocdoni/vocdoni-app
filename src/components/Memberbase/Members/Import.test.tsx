import type { ImportJob } from '~src/queries/members'
import { mockUseOrganization, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { ImportProgress } from './Import'

let mockJobData: ImportJob = {
  jobId: 'job-1',
  type: 'org_members',
  status: 'completed',
  errors: [],
  result: { progress: 100, added: 5, total: 5 },
}

vi.mock('~src/queries/members', () => ({
  useImportJobProgress: () => ({
    data: mockJobData,
    isError: false,
  }),
  useAddMembers: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

describe('ImportProgress', () => {
  beforeEach(() => {
    setReactProvidersMock({
      useOrganization: () => mockUseOrganization({ organization: { address: '0x123' } }),
    })
    mockJobData = {
      jobId: 'job-1',
      type: 'org_members',
      status: 'completed',
      errors: [],
      result: { progress: 100, added: 5, total: 5 },
    }
  })

  it('renders completed status', () => {
    render(<ImportProgress jobId='job-1' onDismiss={vi.fn()} />)

    expect(screen.getByText('Your member data has been imported successfully.')).toBeInTheDocument()
    expect(screen.getByText('You may now start using your imported members.')).toBeInTheDocument()
    expect(screen.queryByText('Import Completed Successfully')).not.toBeInTheDocument()
  })

  it('renders error status when the job has failed', () => {
    mockJobData = {
      jobId: 'job-1',
      type: 'org_members',
      status: 'failed',
      errors: [],
    }
    render(<ImportProgress jobId='job-1' onDismiss={vi.fn()} />)

    expect(screen.getByText('Import Error')).toBeInTheDocument()
  })

  it('renders completed with errors when the job has row errors', () => {
    mockJobData = {
      jobId: 'job-1',
      type: 'org_members',
      status: 'completed',
      errors: ['row 3: bad email'],
      result: { progress: 100, added: 5, total: 5 },
    }
    render(<ImportProgress jobId='job-1' onDismiss={vi.fn()} />)

    expect(screen.getByText('Import Completed with Errors')).toBeInTheDocument()
  })
})

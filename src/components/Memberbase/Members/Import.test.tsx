import type { ImportJob } from '~src/queries/members'
import { mockUseOrganization, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { setStoredImportJobMeta } from '../importJobStorage'
import { ImportProgress } from './Import'

const mockTrackAnalyticsEvent = vi.fn()

// Partial mock: keep the real AnalyticsEvents taxonomy, intercept only the sink.
vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: (...args: unknown[]) => mockTrackAnalyticsEvent(...args),
}))

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router')>()
  return {
    ...actual,
    useOutletContext: () => ({ jobId: 'job-1', setJobId: vi.fn() }),
  }
})

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
    mockTrackAnalyticsEvent.mockClear()
    localStorage.clear()
  })

  it('tracks the completed job once, with what was imported', () => {
    setStoredImportJobMeta('job-1', { file_type: 'csv', rows: 5, encoding: 'non-utf-8' })

    const { unmount } = render(<ImportProgress />)
    unmount()
    // The alert stays up until dismissed, so it remounts on every tab switch
    render(<ImportProgress />)

    expect(mockTrackAnalyticsEvent).toHaveBeenCalledTimes(1)
    expect(mockTrackAnalyticsEvent).toHaveBeenCalledWith({
      name: 'members_import_completed',
      props: {
        file_type: 'csv',
        rows: 5,
        encoding: 'non-utf-8',
        status: 'completed',
        added: 5,
        total: 5,
        error_count: 0,
      },
    })
  })

  it('renders completed status', () => {
    render(<ImportProgress />)

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
    render(<ImportProgress />)

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
    render(<ImportProgress />)

    expect(screen.getByText('Import Completed with Errors')).toBeInTheDocument()
  })
})

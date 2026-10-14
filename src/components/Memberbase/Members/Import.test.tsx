import type { ImportJob } from '~src/queries/members'
import { mockUseOrganization, render, screen } from '~src/test-utils'
import { setReactProvidersMock } from '~src/test-utils-react-providers-mock'
import { buildImportRows, ImportProgress } from './Import'
import { maskIfNeeded } from './maskIfNeeded'

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

describe('buildImportRows', () => {
  // hashMemberPassword('0x…AA', 's3cret'), the shared test vector
  const S3CRET_HASH = '2f7e83a0b19a82fa9a5dc6ecc6ff44ec82679ea87012a7187bd3313366bf277e'

  it('maps the spreadsheet columns and sends password hashes, never the plaintext', async () => {
    const rows = await buildImportRows(
      '0x00000000000000000000000000000000000000AA',
      {
        heading: ['number', 'secret'],
        filedata: [
          ['1', 's3cret'],
          ['2', ''],
        ],
      },
      { memberNumber: 'number', password: 'secret' }
    )

    expect(rows).toEqual([{ memberNumber: '1', password: S3CRET_HASH }, { memberNumber: '2' }])
    expect(JSON.stringify(rows)).not.toContain('s3cret')
  })

  it('masks the password column of the import preview', () => {
    expect(maskIfNeeded('password', 's3cret')).toBe('*********')
    expect(maskIfNeeded('password', '')).toBe('')
  })
})

import { render, screen } from '~src/test-utils'
import { ImportProgress } from './Import'

vi.mock('@vocdoni/react-providers', () => ({
  useOrganization: () => ({ organization: { address: '0x123' } }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useOutletContext: () => ({ jobId: 'job-1', setJobId: vi.fn() }),
  }
})

vi.mock('~src/queries/members', () => ({
  useImportJobProgress: () => ({
    data: { progress: 100, errors: [] },
    isError: false,
  }),
  useAddMembers: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}))

describe('ImportProgress', () => {
  it('renders completed status', () => {
    render(<ImportProgress />)

    expect(screen.getByText('Your member data has been imported successfully.')).toBeInTheDocument()
    expect(screen.getByText('You may now start using your imported members.')).toBeInTheDocument()
    expect(screen.queryByText('Import Completed Successfully')).not.toBeInTheDocument()
  })
})

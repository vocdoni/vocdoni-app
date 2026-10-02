import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { render, screen, waitFor } from '~src/test-utils'
import { MembersImport } from './index'

const members = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  job: undefined as unknown,
}))
const track = vi.hoisted(() => vi.fn())

vi.mock('~src/queries/members', () => ({
  useAddMembers: () => ({ mutateAsync: members.mutateAsync, isPending: false }),
  useImportJobProgress: (jobId: string | null) => ({ data: jobId ? members.job : undefined, isError: false }),
  useInvalidateMembers: () => vi.fn(),
}))

vi.mock('~components/Auth/useAuth', () => ({
  useAuth: () => ({ currentAddress: '0xabc' }),
}))

vi.mock('~utils/analytics', async (importOriginal) => ({
  ...(await importOriginal<typeof import('~utils/analytics')>()),
  trackAnalyticsEvent: track,
}))

const CSV = [
  'Colegio de Ejemplo · Censo 2026',
  'Nombre;Correo electrónico;Teléfono;Nº colegiado;Quota 2026',
  'Anna;anna@example.org;612 345 678;00123;Sí',
  'Pere;pere@;;00124;No',
].join('\n')

const renderWizard = (url = '/admin/memberbase/import?returnTo=/admin/processes/create') =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path='/admin/memberbase/import' element={<MembersImport />} />
        <Route path='/admin/processes/create' element={<h1>Draft</h1>} />
      </Routes>
    </MemoryRouter>
  )

const upload = async (user: ReturnType<typeof userEvent.setup>, csv = CSV) => {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  await user.upload(input, new File([csv], 'colegiados.csv', { type: 'text/csv' }))
}

describe('MembersImport', () => {
  beforeEach(() => {
    localStorage.clear()
    members.mutateAsync.mockReset().mockResolvedValue({ jobId: 'job-1' })
    members.job = undefined
    track.mockReset()
  })

  it('imports a file from upload to receipt', async () => {
    const user = userEvent.setup()
    renderWizard()

    expect(screen.getByRole('heading', { level: 1, name: 'Import members' })).toBeInTheDocument()
    await upload(user)

    // Match: the columns are matched by themselves, the title row above them is skipped
    expect(await screen.findByText('We matched 4 of 5 columns. Check them, then continue.')).toBeInTheDocument()
    expect(document.querySelector('select[data-column="Nombre"]')).toHaveValue('name')
    expect(document.querySelector('select[data-column="Correo electrónico"]')).toHaveValue('email')
    expect(document.querySelector('select[data-column="Nº colegiado"]')).toHaveValue('memberNumber')
    expect(document.querySelector('select[data-column="Quota 2026"]')).toHaveValue('skip')
    // Leaving now would lose the matched file
    const leave = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(leave)
    expect(leave.defaultPrevented).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Continue' }))
    expect(track).toHaveBeenCalledWith({
      name: 'members_import_mapped',
      props: { auto_pct: 80, is_template: false, extra_columns: 0 },
    })

    // Review: opens on the problems, with the spreadsheet's own row number
    expect(screen.getByRole('button', { name: /Only rows with problems/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText('This email isn’t valid. Fix it, or they’re imported without it.')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Email, row 4' })).toHaveValue('pere@')

    await user.click(screen.getByRole('button', { name: 'Import 2 members' }))

    expect(members.mutateAsync).toHaveBeenCalledWith([
      { name: 'Anna', email: 'anna@example.org', phone: '612345678', memberNumber: '00123' },
      { name: 'Pere', memberNumber: '00124' },
    ])
    expect(track).toHaveBeenCalledWith({
      name: 'members_import_started',
      props: { total_rows: 2, method: 'file' },
    })
    expect(localStorage.getItem('memberbaseImportJobId:0xabc')).toBe('job-1')
    expect(screen.getByRole('heading', { name: 'Importing 2 members…' })).toBeInTheDocument()
    const leaveAfter = new Event('beforeunload', { cancelable: true })
    window.dispatchEvent(leaveAfter)
    expect(leaveAfter.defaultPrevented).toBe(false)
  })

  it('shows the receipt and the rows the job could not take whole', async () => {
    members.job = {
      jobId: 'job-1',
      status: 'completed',
      result: { added: 2, total: 2, progress: 100 },
      errors: ['line 2: invalid phone number "6"'],
    }
    const user = userEvent.setup()
    renderWizard()
    await upload(user)
    await user.click(await screen.findByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Import 2 members' }))

    expect(await screen.findByRole('heading', { name: '2 members added' })).toBeInTheDocument()
    expect(screen.getByText('From colegiados.csv')).toBeInTheDocument()
    expect(screen.getByText('Skipped the title row above your column names.')).toBeInTheDocument()
    expect(screen.getByText(/Matched 4 of 5 columns/)).toBeInTheDocument()
    expect(screen.getByText('Left out “Quota 2026”, as you chose.')).toBeInTheDocument()
    expect(screen.getByText(/Row 4/).closest('li')).toHaveTextContent(
      'Row 4 · Pere · The mobile isn’t valid, so it was left out.'
    )
    // The receipt says how the job went, so the People tab stops following it
    await waitFor(() => expect(localStorage.getItem('memberbaseImportJobId:0xabc')).toBeNull())

    await user.click(screen.getByRole('button', { name: 'Back to your draft' }))
    expect(screen.getByRole('heading', { name: 'Draft' })).toBeInTheDocument()
    expect(track).toHaveBeenCalledWith({ name: 'members_import_next_clicked', props: { next: 'return' } })
  })

  it('explains what is missing before matching on', async () => {
    const user = userEvent.setup()
    renderWizard()
    await upload(user, 'Nombre;Quota\nAnna;Sí\n')

    await user.click(await screen.findByRole('button', { name: 'Continue' }))

    expect(
      screen.getByText('Choose the column with each person’s email or mobile: that’s where their voting code goes.')
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Import/ })).toBeNull()
  })

  it('ignores a return path outside the dashboard', async () => {
    members.job = { jobId: 'job-1', status: 'completed', result: { added: 2, total: 2 }, errors: [] }
    const user = userEvent.setup()
    renderWizard('/admin/memberbase/import?returnTo=https://evil.example/admin/')
    await upload(user)
    await user.click(await screen.findByRole('button', { name: 'Continue' }))
    await user.click(screen.getByRole('button', { name: 'Import 2 members' }))

    expect(await screen.findByRole('heading', { name: '2 members added' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Back to your draft' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Back to members' })).toBeInTheDocument()
  })

  it('explains a file it cannot use', async () => {
    const user = userEvent.setup({ applyAccept: false })
    renderWizard()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    await user.upload(input, new File(['x'], 'photo.png', { type: 'image/png' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'We can’t read this type of file. Upload an .xlsx, .xls, .csv or .ods file.'
    )
  })
})

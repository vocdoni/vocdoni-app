import { addDays, format } from 'date-fns'
import { FormProvider, useForm } from 'react-hook-form'
import { Routes } from '~routes'
import { fireEvent, render, screen, TestMemoryRouter } from '~src/test-utils'
import { defaultProcessValues, Process } from '../common'
import { BasicConfig } from './BasicConfig'

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({
    permission: (key: string) => (key === 'organization.maxDaysDuration' ? 7 : undefined),
  }),
}))

const Harness = ({ endInDays, endTime = '' }: { endInDays: number; endTime?: string }) => {
  const methods = useForm<Process>({
    defaultValues: {
      ...defaultProcessValues,
      endDate: format(addDays(new Date(), endInDays), 'yyyy-MM-dd'),
      endTime,
    },
  })

  return (
    <TestMemoryRouter>
      <FormProvider {...methods}>
        <BasicConfig />
      </FormProvider>
    </TestMemoryRouter>
  )
}

describe('BasicConfig plan duration limit', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('warns with a working contact link when the vote is longer than the plan allows', async () => {
    render(<Harness endInDays={30} />)

    expect(await screen.findByText(/7-day limit/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'contact us' })).toHaveAttribute('href', Routes.dashboard.settings.support)
  })

  it('drops the warning once the end date is cleared', async () => {
    render(<Harness endInDays={30} />)
    expect(await screen.findByText(/7-day limit/)).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('End date and time'), { target: { value: '' } })

    expect(screen.queryByText(/7-day limit/)).not.toBeInTheDocument()
  })

  it('counts the end time, so the last allowed day cannot run past the limit', async () => {
    // Local noon: the vote starts now and ends 7 days later at 23:59, i.e. ~7.5 days.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 0, 15, 12, 0))

    render(<Harness endInDays={7} endTime='23:59' />)

    expect(await screen.findByText(/7-day limit/)).toBeInTheDocument()
  })

  it('shows no warning within the plan limit', () => {
    render(<Harness endInDays={3} />)

    expect(screen.queryByText(/7-day limit/)).not.toBeInTheDocument()
  })
})

import { addDays, format } from 'date-fns'
import { FormProvider, useForm } from 'react-hook-form'
import { Routes } from '~routes'
import { render, screen, TestMemoryRouter } from '~src/test-utils'
import { defaultProcessValues, Process } from '../common'
import { BasicConfig } from './BasicConfig'

vi.mock('~components/Auth/Subscription', () => ({
  useSubscription: () => ({
    permission: (key: string) => (key === 'organization.maxDaysDuration' ? 7 : undefined),
  }),
}))

const Harness = ({ endInDays }: { endInDays: number }) => {
  const methods = useForm<Process>({
    defaultValues: { ...defaultProcessValues, endDate: format(addDays(new Date(), endInDays), 'yyyy-MM-dd') },
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
  it('warns with a working contact link when the vote is longer than the plan allows', async () => {
    render(<Harness endInDays={30} />)

    expect(await screen.findByText(/7-day limit/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'contact us' })).toHaveAttribute('href', Routes.dashboard.settings.support)
  })

  it('shows no warning within the plan limit', () => {
    render(<Harness endInDays={3} />)

    expect(screen.queryByText(/7-day limit/)).not.toBeInTheDocument()
  })
})

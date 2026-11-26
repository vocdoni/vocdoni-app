import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import { defaultProcessValues, Process } from '../common'
import { ExtraConfig } from './ExtraConfig'

const AnonymityWatcher = () => {
  const { watch } = useFormContext<Process>()

  return (
    <>
      <div data-testid='form-anonymousVoting'>{String(watch('anonymousVoting'))}</div>
      <div data-testid='form-showVoterResults'>{String(watch('showVoterResults'))}</div>
    </>
  )
}

const Harness = ({
  startPaused = false,
  resultVisibility = defaultProcessValues.resultVisibility,
}: {
  startPaused?: boolean
  resultVisibility?: Process['resultVisibility']
}) => {
  const methods = useForm<Process>({ defaultValues: { ...defaultProcessValues, startPaused, resultVisibility } })

  return (
    <FormProvider {...methods}>
      <ExtraConfig />
      <AnonymityWatcher />
    </FormProvider>
  )
}

describe('ExtraConfig voter anonymity', () => {
  it('starts off, with nothing to explain', () => {
    render(<Harness />)

    expect(screen.getByRole('checkbox', { name: /Anonymous voting/ })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: /Anonymous voting/ })).toBeEnabled()
    expect(screen.getByTestId('form-anonymousVoting')).toHaveTextContent('false')
    expect(screen.queryByText(/no vote can be traced back/)).not.toBeInTheDocument()
  })

  it('hides the anonymous voting toggle when the option is disabled', () => {
    render(<Harness />, { appEnv: { DISABLE_ANONYMOUS_VOTING: true } })

    expect(screen.queryByRole('checkbox', { name: /Anonymous voting/ })).not.toBeInTheDocument()
    expect(screen.getByTestId('form-anonymousVoting')).toHaveTextContent('false')
  })

  it('sets the form flag and explains anonymity once switched on', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('checkbox', { name: /Anonymous voting/ }))

    expect(screen.getByTestId('form-anonymousVoting')).toHaveTextContent('true')
    expect(screen.getByText(/no vote can be traced back to a voter/)).toBeInTheDocument()
  })

  it('hides the explanation again when switched off', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const toggle = screen.getByRole('checkbox', { name: /Anonymous voting/ })
    await user.click(toggle)
    await user.click(toggle)

    expect(screen.getByTestId('form-anonymousVoting')).toHaveTextContent('false')
    expect(screen.queryByText(/no vote can be traced back/)).not.toBeInTheDocument()
  })
})

describe('ExtraConfig results for voters', () => {
  const label = /Show the results to voters/

  it('shows whether or not the questions start paused, off by default, with the help of each', () => {
    const { unmount } = render(<Harness startPaused={false} />)
    expect(screen.getByRole('checkbox', { name: label })).not.toBeChecked()
    expect(screen.getByTestId('form-showVoterResults')).toHaveTextContent('false')
    // The help describes the switch, as the fields around it are described by theirs.
    expect(screen.getByRole('checkbox', { name: label })).toHaveAccessibleDescription(
      /Results hidden until the end appear when the vote ends/
    )
    unmount()

    render(<Harness startPaused resultVisibility='live' />)
    expect(screen.getByRole('checkbox', { name: label })).not.toBeChecked()
    expect(screen.getByRole('checkbox', { name: label })).toHaveAccessibleDescription(/each question's result/)
  })

  it('says that with the questions paused and hidden results, they show only at the end', () => {
    render(<Harness startPaused resultVisibility='hidden' />)
    expect(screen.getByRole('checkbox', { name: label })).toHaveAccessibleDescription(
      /voters see them all when the vote ends/
    )
  })

  it('sets the form flag when switched on', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    await user.click(screen.getByRole('checkbox', { name: label }))

    expect(screen.getByTestId('form-showVoterResults')).toHaveTextContent('true')
  })
})

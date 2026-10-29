import userEvent from '@testing-library/user-event'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import { defaultProcessValues, Process } from '../common'
import { ExtraConfig } from './ExtraConfig'

const AnonymityWatcher = () => {
  const { watch } = useFormContext<Process>()

  return <div data-testid='form-anonymousVoting'>{String(watch('anonymousVoting'))}</div>
}

const Harness = () => {
  const methods = useForm<Process>({ defaultValues: defaultProcessValues })

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

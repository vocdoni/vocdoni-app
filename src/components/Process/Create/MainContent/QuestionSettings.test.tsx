import userEvent from '@testing-library/user-event'
import { FormProvider, useForm } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import { defaultProcessValues, defaultQuestion, Process, SelectorTypes } from '../common'
import { QuestionSettings } from './QuestionSettings'

const QuestionSettingsHarness = ({
  questions = defaultProcessValues.questions,
}: {
  questions?: Process['questions']
}) => {
  const methods = useForm<Process>({ defaultValues: { ...defaultProcessValues, questions } })

  return (
    <FormProvider {...methods}>
      {questions.map((_, index) => (
        <QuestionSettings key={index} index={index} />
      ))}
    </FormProvider>
  )
}

describe('QuestionSettings', () => {
  it('renders without field context errors', () => {
    expect(() => render(<QuestionSettingsHarness />)).not.toThrow()
  })

  it('shows each question its own type', () => {
    render(
      <QuestionSettingsHarness
        questions={[{ ...defaultQuestion }, { ...defaultQuestion, type: SelectorTypes.Multiple }]}
      />
    )

    expect(screen.getByText('Single choice')).toBeInTheDocument()
    expect(screen.getByText('Multiple choice')).toBeInTheDocument()
  })

  it('toggles extended info for a single question', async () => {
    render(<QuestionSettingsHarness questions={[{ ...defaultQuestion }, { ...defaultQuestion }]} />)
    const [first, second] = screen.getAllByRole('checkbox', { name: 'Extended info' })

    // The switch is an Ark UI machine feeding a react-hook-form `Controller`: the
    // resulting form update lands a tick after the click, so it needs awaiting.
    await userEvent.click(first)

    expect(first).toBeChecked()
    expect(second).not.toBeChecked()
  })
})

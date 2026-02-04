import { FormProvider, useForm } from 'react-hook-form'
import { render } from '~src/test-utils'
import { defaultProcessValues } from '../common'
import { QuestionType } from './QuestionType'

const QuestionTypeHarness = () => {
  const methods = useForm({ defaultValues: defaultProcessValues })

  return (
    <FormProvider {...methods}>
      <QuestionType />
    </FormProvider>
  )
}

describe('QuestionType', () => {
  it('renders without field context errors', () => {
    expect(() => render(<QuestionTypeHarness />)).not.toThrow()
  })
})

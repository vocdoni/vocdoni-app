import { FormProvider, useForm } from 'react-hook-form'
import { render } from '~src/test-utils'
import { defaultProcessValues } from '../../common'
import { QuestionFormat } from '.'

const Harness = ({ index }: { index: number }) => {
  const methods = useForm({ defaultValues: defaultProcessValues })
  return (
    <FormProvider {...methods}>
      <QuestionFormat index={index} />
    </FormProvider>
  )
}

describe('QuestionFormat', () => {
  it('renders the editable footer for question 1', () => {
    expect(() => render(<Harness index={0} />)).not.toThrow()
  })

  it('renders the inherited footer for later questions', () => {
    expect(() => render(<Harness index={1} />)).not.toThrow()
  })
})

import { FormProvider, useForm } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import InputBasic from './InputBasic'

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({ defaultValues: { name: '' } })
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('InputBasic', () => {
  it('renders label and input', () => {
    render(
      <Wrapper>
        <InputBasic formValue='name' label='Name' />
      </Wrapper>
    )

    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  // The organization name field relies on this to stay readable in session
  // replays (see posthogMaskInput in ~utils/analytics).
  it('forwards data attributes to the underlying input', () => {
    render(
      <Wrapper>
        <InputBasic formValue='name' label='Name' data-ph-unmask='' />
      </Wrapper>
    )

    expect(screen.getByRole('textbox')).toHaveAttribute('data-ph-unmask')
  })
})

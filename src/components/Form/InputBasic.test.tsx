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

  it('renders the required indicator and exposes aria-required when required', () => {
    const { container } = render(
      <Wrapper>
        <InputBasic formValue='name' label='Name' required />
      </Wrapper>
    )

    expect(container.querySelector('.chakra-field__requiredIndicator')).toBeInTheDocument()
    // required={false} suppresses native HTML5 validation, so aria-required must carry the semantics
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-required', 'true')
    expect(screen.getByRole('textbox')).not.toHaveAttribute('required')
  })

  it('does not render the required indicator nor aria-required when not required', () => {
    const { container } = render(
      <Wrapper>
        <InputBasic formValue='name' label='Name' />
      </Wrapper>
    )

    expect(container.querySelector('.chakra-field__requiredIndicator')).not.toBeInTheDocument()
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-required')
  })
})

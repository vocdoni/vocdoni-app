import { FormProvider, useForm } from 'react-hook-form'
import { render, screen } from '~src/test-utils'
import { CountrySelector } from './CountrySelector'

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm({ defaultValues: { country: '' } })
  return <FormProvider {...methods}>{children}</FormProvider>
}

describe('CountrySelector', () => {
  it('associates the label with the select input for assistive tech', () => {
    render(
      <Wrapper>
        <CountrySelector />
      </Wrapper>
    )

    // getByLabelText only resolves if htmlFor='country' matches the inner input's id
    expect(screen.getByLabelText(/Country/)).toBeInTheDocument()
  })

  it('renders the required indicator', () => {
    const { container } = render(
      <Wrapper>
        <CountrySelector />
      </Wrapper>
    )

    expect(container.querySelector('.chakra-field__requiredIndicator')).toBeInTheDocument()
  })
})

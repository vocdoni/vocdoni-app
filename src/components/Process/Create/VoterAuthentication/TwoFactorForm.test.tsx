import { FormProvider, useForm } from 'react-hook-form'
import { render } from '~src/test-utils'
import { TwoFactorForm } from './TwoFactorForm'

const TestWrapper = () => {
  const methods = useForm({
    defaultValues: {
      use2FA: false,
      use2FAMethod: 'email',
    },
  })

  return (
    <FormProvider {...methods}>
      <TwoFactorForm />
    </FormProvider>
  )
}

describe('TwoFactorForm', () => {
  it('renders the two-factor toggle label', () => {
    const { getByText } = render(<TestWrapper />)

    expect(getByText('Enable Two-Factor Authentication')).toBeTruthy()
  })
})
